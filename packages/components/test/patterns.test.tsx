import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'
import { Button, Card, CardLink, CardScroll, ChartLegend, ScrollArea, Notice, RingChart, TickBar, ToastProvider, TrendChart, UnitMenu, useToast } from '../src/index.ts'
import { violations } from './axe.ts'

/* jsdom has no ResizeObserver; the trend chart keeps its default width */
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('Card', () => {
  test('is a region named by its title, with its summary and link', async () => {
    const { container } = render(
      <Card title="Orders" summary={{ label: 'Open total', value: '3,940 plt' }} footer={<CardLink href="/orders">Go to Orders</CardLink>}>
        <p>Content</p>
      </Card>,
    )
    expect(screen.getByRole('region', { name: 'Orders' })).toBeTruthy()
    expect(screen.getByText('3,940 plt')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Go to Orders' }).getAttribute('href')).toBe('/orders')
    expect(await violations(container)).toEqual([])
  })

  test('the unit menu names the unit and changes it', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <UnitMenu
        label="Unit"
        value="plt"
        onValueChange={onValueChange}
        options={[
          { value: 'plt', short: 'plt', name: 'Pallets' },
          { value: 'kg', short: 'kg', name: 'Kilograms' },
        ]}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Unit: plt, Pallets' }))
    await user.click(await screen.findByRole('menuitemradio', { name: 'KG, Kilograms' }))
    expect(onValueChange).toHaveBeenCalledWith('kg')
  })
})

describe('Charts', () => {
  const segments = [
    { value: 1960, tone: 'accent' as const, label: 'Available' },
    { value: 840, tone: 'danger' as const, label: 'On hold' },
  ]

  test('tick bars and rings describe their parts in words', () => {
    render(
      <>
        <TickBar label="May orders" segments={segments} />
        <RingChart label="Inventory" segments={segments} />
      </>,
    )
    expect(screen.getByRole('img', { name: 'May orders: Available 1,960, On hold 840' })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Inventory: Available 1,960, On hold 840' })).toBeTruthy()
  })

  test('the trend chart is read day by day with the arrow keys, and its series turn off', async () => {
    const { container } = render(
      <TrendChart label="Daily shipments" categories={['May 1', 'May 2', 'May 3']} series={{ name: 'Shipments', values: [300, 350, null] }} cumulative={{ name: 'Cumulative' }} unit="plt" />,
    )
    const chart = screen.getByRole('group', { name: /Daily shipments/ })
    fireEvent.keyDown(chart, { key: 'ArrowRight' })
    expect(container.querySelector('[aria-live]')?.textContent).toBe('May 1: 300 plt, 300 plt so far')
    fireEvent.keyDown(chart, { key: 'End' })
    expect(container.querySelector('[aria-live]')?.textContent).toBe('May 2: 350 plt, 650 plt so far')
    const toggle = screen.getByRole('button', { name: 'Cumulative' })
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-pressed')).toBe('false')
    expect(await violations(container)).toEqual([])
  })

  test('the trend chart’s reading closes with a press outside it, as a finger leaves no pointerleave', () => {
    const { container } = render(
      <div>
        <TrendChart label="Daily shipments" categories={['May 1', 'May 2']} series={{ name: 'Shipments', values: [300, 350] }} unit="plt" />
        <p>Outside</p>
      </div>,
    )
    const chart = screen.getByRole('group', { name: /Daily shipments/ })
    fireEvent.keyDown(chart, { key: 'ArrowRight' })
    expect(container.querySelector('.sonar-trend-tip')).toBeTruthy()
    fireEvent.pointerDown(chart)
    expect(container.querySelector('.sonar-trend-tip')).toBeTruthy()
    fireEvent.pointerDown(screen.getByText('Outside'))
    expect(container.querySelector('.sonar-trend-tip')).toBeNull()
    expect(container.querySelector('[aria-live]')?.textContent).toBe('')
  })
})

describe('Notice', () => {
  test('shows its title and message', async () => {
    const { container } = render(<Notice tone="success" title="Order created.">PO-2210 was sent for confirmation.</Notice>)
    expect(screen.getByText('Order created.')).toBeTruthy()
    expect(await violations(container)).toEqual([])
  })
})

describe('Toast', () => {
  function Remove({ onUndo }: { onUndo: () => void }) {
    const toast = useToast()
    return <Button onClick={() => toast({ message: 'Inventory removed from your overview.', action: { label: 'Undo', onClick: onUndo } })}>Remove</Button>
  }

  test('says what happened and offers to undo it', async () => {
    const user = userEvent.setup()
    const onUndo = vi.fn()
    render(
      <ToastProvider>
        <Remove onUndo={onUndo} />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(await screen.findByText('Inventory removed from your overview.')).toBeTruthy()
    await act(async () => user.click(screen.getByRole('button', { name: 'Undo' })))
    expect(onUndo).toHaveBeenCalledOnce()
  })

  test('can leave out the close button and sit where the app says (1.1)', async () => {
    const user = userEvent.setup()
    function Saved() {
      const toast = useToast()
      return <Button onClick={() => toast({ message: 'Layout saved.' })}>Save</Button>
    }
    render(
      <ToastProvider closeButton={false} inset={{ left: '224px', bottom: '66px' }}>
        <Saved />
      </ToastProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))
    expect(await screen.findByText('Layout saved.')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Dismiss' })).toBeNull()
    const viewport = document.querySelector<HTMLElement>('.sonar-toast-viewport')!
    expect(viewport.style.getPropertyValue('--sonar-toast-left')).toBe('224px')
    expect(viewport.style.getPropertyValue('--sonar-toast-bottom')).toBe('66px')
  })
})

describe('Tick bar and chart legend', () => {
  test('one fill colors the parts edge to edge, each change of color snapped to the tick pitch', () => {
    const { container } = render(
      <TickBar
        label="May orders"
        segments={[
          { value: 1420, tone: 'accent', label: 'Shipped' },
          { value: 0, tone: 'strong', label: 'On hold' },
          { value: 1180, tone: 'muted', label: 'Pending' },
        ]}
      />,
    )
    const bar = container.querySelector<HTMLElement>('.sonar-tick-bar')!
    const fill = bar.style.getPropertyValue('--_fill')
    expect(fill).toBe('linear-gradient(90deg, var(--_accent) 0% 54.615%, var(--_muted) 54.615% 100%)')
    expect(bar.style.getPropertyValue('--_fill-snapped')).toContain('round(nearest, 54.615%, var(--_pitch))')
    expect(bar.children).toHaveLength(0)
  })

  test('a legend lists each color by name, as a list', async () => {
    const { container } = render(
      <ChartLegend
        items={[
          { label: 'Overdue', tone: 'danger' },
          { label: 'Not due yet', tone: 'muted', value: '1,669,200.00 USD' },
        ]}
      />,
    )
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(['Overdue', 'Not due yet1,669,200.00 USD'])
    expect(container.querySelector('[data-tone="danger"]')).toBeTruthy()
    expect(await violations(container)).toEqual([])
  })
})

describe('Scrolling inside a card', () => {
  /* jsdom lays nothing out: give the area a content taller than itself, as a small card size would */
  const overflow = (element: HTMLElement, content: number, height: number) => {
    Object.defineProperty(element, 'scrollHeight', { configurable: true, value: content })
    Object.defineProperty(element, 'clientHeight', { configurable: true, value: height })
  }

  test('a list that does not fit becomes a named group that takes focus, with a fade at the end that has more', async () => {
    const { container } = render(
      <Card title="Deliveries" size="m">
        <CardScroll label="Deliveries of May 12">
          <ul role="list">
            <li>04-118B</li>
            <li>04-121A</li>
          </ul>
        </CardScroll>
      </Card>,
    )
    const area = container.querySelector<HTMLElement>('.sonar-card-scroll-area')!
    expect(area.hasAttribute('tabindex')).toBe(false)
    overflow(area, 400, 120)
    await act(async () => fireEvent.scroll(area))
    expect(screen.getByRole('group', { name: 'Deliveries of May 12' })).toBe(area)
    expect(area.tabIndex).toBe(0)
    expect(area.hasAttribute('data-at-start')).toBe(true)
    expect(area.hasAttribute('data-at-end')).toBe(false)
    expect(await violations(container)).toEqual([])
  })

  test('a sized card scrolls its whole content when nothing else gives way, named by its title', async () => {
    const { container } = render(
      <Card title="Balance" size="s" footer={<CardLink href="/balance">Go to Balance</CardLink>}>
        <p>Overdue</p>
      </Card>,
    )
    const body = container.querySelector<HTMLElement>('.sonar-card-body')!
    overflow(body, 300, 100)
    await act(async () => fireEvent.scroll(body))
    expect(screen.getByRole('group', { name: 'Balance' })).toBe(body)
    overflow(body, 100, 100)
    await act(async () => fireEvent.scroll(body))
    expect(body.hasAttribute('role')).toBe(false)
    expect(body.hasAttribute('tabindex')).toBe(false)
  })

  test('a card without a size never scrolls', () => {
    const { container } = render(<Card title="Orders">Content</Card>)
    expect(container.querySelector('.sonar-scroll-thumb')).toBeNull()
  })
})

describe('ScrollArea', () => {
  const overflow = (element: HTMLElement, content: number, height: number) => {
    Object.defineProperty(element, 'scrollHeight', { configurable: true, value: content })
    Object.defineProperty(element, 'clientHeight', { configurable: true, value: height })
  }

  test('hides nothing while it fits; once it scrolls it is a named group with the indicator beside it, never a system scrollbar', async () => {
    const { container } = render(
      <ScrollArea label="Invoices">
        <ul role="list">
          <li>INV-0025698</li>
          <li>INV-0025677</li>
        </ul>
      </ScrollArea>,
    )
    const area = container.querySelector<HTMLElement>('.sonar-scroll-area-viewport')!
    const thumb = container.querySelector<HTMLElement>('.sonar-scroll-area-thumb')!
    expect(area.hasAttribute('tabindex')).toBe(false)
    expect(thumb.getAttribute('aria-hidden')).toBe('true')
    overflow(area, 400, 120)
    await act(async () => fireEvent.scroll(area))
    expect(screen.getByRole('group', { name: 'Invoices' })).toBe(area)
    expect(area.tabIndex).toBe(0)
    expect(thumb.hidden).toBe(false)
    expect(thumb.hasAttribute('data-visible')).toBe(true)
    expect(container.querySelector('.sonar-scroll-area')!.getAttribute('data-indicator')).toBe('outside')
    expect(await violations(container)).toEqual([])
  })
})
