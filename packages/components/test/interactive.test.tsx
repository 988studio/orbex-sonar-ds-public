import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, test, vi } from 'vitest'
import { Button, Dialog, DialogHost, IconButton, Menu, SearchField, SearchResult, Tooltip } from '../src/index.ts'
import { violations } from './axe.ts'

describe('Menu', () => {
  test('opens from its trigger, moves with the keyboard and closes on choice', async () => {
    const user = userEvent.setup()
    const onExport = vi.fn()
    render(
      <Menu.Root>
        <Menu.Trigger render={<Button variant="outlined">Actions</Button>} />
        <Menu.Content>
          <Menu.Item onClick={onExport}>Export as CSV</Menu.Item>
          <Menu.Item>Print</Menu.Item>
        </Menu.Content>
      </Menu.Root>,
    )
    const trigger = screen.getByRole('button', { name: 'Actions' })
    expect(trigger.className).toContain('sonar-button')
    await user.click(trigger)
    const menu = await screen.findByRole('menu')
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Export as CSV', 'Print'])
    expect(await violations(menu)).toEqual([])
    await user.click(screen.getByRole('menuitem', { name: 'Export as CSV' }))
    expect(onExport).toHaveBeenCalledOnce()
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull())
  })
})

describe('Tooltip', () => {
  test('describes its trigger when it receives focus', async () => {
    render(
      <Tooltip content="Notifications">
        <IconButton label="Notifications" icon={<svg />} />
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Notifications' })
    await act(async () => trigger.focus())
    expect(await screen.findByText('Notifications', { selector: '.sonar-tooltip' })).toBeTruthy()
  })
})

describe('Dialog', () => {
  function Example({ onOpenChange = () => {} }: { onOpenChange?: (open: boolean) => void }) {
    const [open, setOpen] = useState(false)
    const change = (next: boolean) => {
      setOpen(next)
      onOpenChange(next)
    }
    return (
      <>
        <Button onClick={() => change(true)}>Reset layout</Button>
        <Dialog open={open} onOpenChange={change} title="Reset the overview?" description="Your arrangement is replaced by the default." actions={<Button>Reset</Button>} />
      </>
    )
  }

  test('opens as a modal named by its title and closes on Escape', async () => {
    const onOpenChange = vi.fn()
    const { container } = render(<Example onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Reset layout' }))
    const dialog = container.querySelector('dialog')!
    expect(dialog.open).toBe(true)
    expect(screen.getByRole('dialog', { name: 'Reset the overview?' })).toBeTruthy()
    expect(dialog.getAttribute('aria-describedby')).toBe(screen.getByText('Your arrangement is replaced by the default.').id)
    expect(await violations(container)).toEqual([])
    fireEvent(dialog, new Event('cancel', { cancelable: true }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(dialog.open).toBe(false)
  })

  test('closes from its close button', () => {
    const { container } = render(<Example />)
    fireEvent.click(screen.getByRole('button', { name: 'Reset layout' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(container.querySelector('dialog')!.open).toBe(false)
  })
})

describe('SearchField', () => {
  test('opens its results as people type, keeps its name while open and chooses with Enter', async () => {
    const user = userEvent.setup()
    const onItemChoose = vi.fn()
    const all = ['04-121A', '04-127C', 'INV-7712']
    function Search() {
      const [value, setValue] = useState('')
      const items = all.filter((code) => value && code.toLowerCase().includes(value.toLowerCase()))
      return (
        <SearchField
          label="Search deliveries and invoices"
          value={value}
          onValueChange={setValue}
          items={items}
          itemToString={(code) => code}
          renderItem={(code) => <SearchResult title={code} />}
          onItemChoose={onItemChoose}
          status={value ? `${items.length} results` : 'Try a code'}
        />
      )
    }
    render(<Search />)
    const input = screen.getByRole('combobox', { name: 'Search deliveries and invoices' })
    await user.type(input, '04-12')
    expect(await screen.findAllByRole('option')).toHaveLength(2)
    expect(screen.getByRole('combobox', { name: 'Search deliveries and invoices' })).toBe(input)
    await user.keyboard('{ArrowDown}{Enter}')
    await waitFor(() => expect(onItemChoose).toHaveBeenCalled())
    expect(all).toContain(onItemChoose.mock.calls[0]?.[0])
  })
})

describe('SearchField (1.1)', () => {
  function Search({ onItemChoose = () => {} }: { onItemChoose?: (code: string) => void }) {
    const [value, setValue] = useState('')
    const all = ['04-121A', '04-127C', 'INV-7712']
    const items = value ? all.filter((code) => code.toLowerCase().includes(value.toLowerCase())) : all
    return (
      <SearchField
        label="Search"
        variant="top-bar"
        value={value}
        onValueChange={setValue}
        items={items}
        itemToString={(code) => code}
        renderItem={(code) => <SearchResult title={code} />}
        onItemChoose={onItemChoose}
        status="Smart search"
        statusIcon={<span>*</span>}
        popupClassName="app-results"
      />
    )
  }

  test('highlights the first result, so Enter takes it at once', async () => {
    const user = userEvent.setup()
    const onItemChoose = vi.fn()
    render(<Search onItemChoose={onItemChoose} />)
    await user.type(screen.getByRole('combobox', { name: 'Search' }), 'INV')
    await screen.findAllByRole('option')
    await user.keyboard('{Enter}')
    await waitFor(() => expect(onItemChoose).toHaveBeenCalledWith('INV-7712'))
  })

  test('Escape clears the text first and keeps the list, then closes it', async () => {
    const user = userEvent.setup()
    const { container } = render(<Search />)
    expect(container.querySelector('.sonar-search')?.getAttribute('data-variant')).toBe('top-bar')
    const input = screen.getByRole('combobox', { name: 'Search' }) as HTMLInputElement
    await user.type(input, '04')
    await screen.findAllByRole('option')
    expect(document.querySelector('.sonar-search-popup.app-results')).toBeTruthy()
    expect(document.querySelector('.sonar-search-status-icon')).toBeTruthy()
    await user.keyboard('{Escape}')
    expect(input.value).toBe('')
    expect(input.getAttribute('aria-expanded')).toBe('true')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(input.getAttribute('aria-expanded')).toBe('false'))
  })
})

describe('Dialog that is not modal', () => {
  test('keeps Tab and Shift+Tab inside the panel (1.0.0-alpha.20)', () => {
    /* A side panel watches its body's size for the fades; jsdom has no ResizeObserver and lays nothing out */
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
    const rects = vi.spyOn(Element.prototype, 'getClientRects').mockImplementation(() => [{}] as unknown as DOMRectList)
    function Example() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <Button onClick={() => setOpen(true)}>Open order</Button>
          <Button>Behind the panel</Button>
          <Dialog open={open} onOpenChange={setOpen} modal={false} placement="end" title="Order details" actions={<Button>Go to Orders</Button>}>
            <p>Lines</p>
          </Dialog>
        </>
      )
    }
    render(<Example />)
    fireEvent.click(screen.getByRole('button', { name: 'Open order' }))
    const close = screen.getByRole('button', { name: 'Close' })
    const last = screen.getByRole('button', { name: 'Go to Orders' })
    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(document.activeElement).toBe(close)
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last)
    rects.mockRestore()
    vi.unstubAllGlobals()
  })
  test('after a press, focus goes back to what was pressed, without its ring until the next key (1.0.0-alpha.21)', async () => {
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
    function Example() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <div tabIndex={0} data-testid="list">
            <Button onClick={() => setOpen(true)}>Open order</Button>
          </div>
          <Dialog open={open} onOpenChange={setOpen} modal={false} placement="end" title="Order details">
            <p>Lines</p>
          </Dialog>
        </>
      )
    }
    render(<Example />)
    const opener = screen.getByRole('button', { name: 'Open order' })
    /* As in Safari: the press focuses the list around the button, not the button */
    fireEvent.pointerDown(opener)
    screen.getByTestId('list').focus()
    fireEvent.click(opener)
    const close = screen.getByRole('button', { name: 'Close' })
    fireEvent.pointerDown(close)
    fireEvent.click(close)
    /* Once the page behind is live again (1.0.0-alpha.24) */
    await Promise.resolve()
    expect(document.activeElement).toBe(opener)
    expect(opener.hasAttribute('data-sonar-quiet-focus')).toBe(true)
    fireEvent.keyDown(document.body, { key: 'Tab' })
    expect(opener.hasAttribute('data-sonar-quiet-focus')).toBe(false)
    vi.unstubAllGlobals()
  })
  test('closing, focus stays on what was pressed when the browser hands it to what held it before (1.0.0-alpha.24)', async () => {
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
    vi.useFakeTimers()
    function Example() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <div tabIndex={0} data-testid="list">
            <Button onClick={() => setOpen(true)}>Open order</Button>
          </div>
          <Dialog open={open} onOpenChange={setOpen} modal={false} placement="end" title="Order details">
            <p>Lines</p>
          </Dialog>
        </>
      )
    }
    render(<Example />)
    const opener = screen.getByRole('button', { name: 'Open order' })
    const list = screen.getByTestId('list')
    /* As in Safari on a phone: the scrolled list holds focus when the button is tapped; closing the dialog, WebKit
       focuses it again, with its ring */
    const native = HTMLDialogElement.prototype.close
    const close = vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (this: HTMLDialogElement) {
      native.call(this)
      list.focus()
    })
    fireEvent.pointerDown(opener)
    list.focus()
    fireEvent.click(opener)
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Close' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    await Promise.resolve()
    vi.runAllTimers()
    expect(close).toHaveBeenCalled()
    expect(document.activeElement).toBe(opener)
    expect(opener.hasAttribute('data-sonar-quiet-focus')).toBe(true)
    close.mockRestore()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })
  test('is placed against the window, at the end of the page, unless a host holds it (1.0.0-alpha.23)', () => {
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
    function Example({ host }: { host?: boolean }) {
      const [open, setOpen] = useState(false)
      return (
        <div data-testid="card" style={{ transform: 'scale(0.5)' }} data-theme="dark">
          <Button onClick={() => setOpen(true)}>Open order</Button>
          {host ? (
            <DialogHost>
              <Dialog open={open} onOpenChange={setOpen} modal={false} placement="end" title="Order details">
                <p>Lines</p>
              </Dialog>
            </DialogHost>
          ) : (
            <Dialog open={open} onOpenChange={setOpen} modal={false} placement="end" title="Order details">
              <p>Lines</p>
            </Dialog>
          )}
        </div>
      )
    }
    const { unmount } = render(<Example />)
    fireEvent.click(screen.getByRole('button', { name: 'Open order' }))
    const panel = screen.getByRole('dialog')
    expect(panel.parentElement).toBe(document.body)
    expect(panel.getAttribute('data-theme')).toBe('dark')
    unmount()
    render(<Example host />)
    fireEvent.click(screen.getByRole('button', { name: 'Open order' }))
    expect(screen.getByTestId('card').contains(screen.getByRole('dialog'))).toBe(true)
    vi.unstubAllGlobals()
  })
})
