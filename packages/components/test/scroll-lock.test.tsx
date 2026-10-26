import { render, screen, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { Button, Dialog, isScrollLocked, lockScroll } from '../src/index.ts'

/* The page's scroll lock: one for the document, counted, shared by the dialog and any other layer (the
   documentation's drawer). jsdom does not scroll, so the page's position is stubbed */
const root = () => document.documentElement

function at(y: number) {
  Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
  Object.defineProperty(window, 'scrollX', { configurable: true, value: 0 })
}

function touch(target: Element, type: 'touchstart' | 'touchmove', y: number) {
  const event = new Event(type, { bubbles: true, cancelable: true }) as Event & { touches: { clientX: number; clientY: number }[] }
  Object.defineProperty(event, 'touches', { value: [{ clientX: 10, clientY: y }] })
  target.dispatchEvent(event)
  return event
}

afterEach(() => {
  at(0)
  vi.restoreAllMocks()
})

describe('Scroll lock', () => {
  test('holds the page while a layer is open and releases it when the last one closes', () => {
    const one = document.createElement('div')
    const two = document.createElement('div')
    document.body.append(one, two)
    const releaseOne = lockScroll(one)
    expect(root().style.overflow).toBe('hidden')
    expect(isScrollLocked()).toBe(true)
    const releaseTwo = lockScroll(two)
    releaseOne()
    releaseOne()
    expect(root().style.overflow).toBe('hidden')
    releaseTwo()
    expect(root().style.overflow).toBe('')
    expect(isScrollLocked()).toBe(false)
    one.remove()
    two.remove()
  })

  test('returns the page to where it was if it moved while locked', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    const layer = document.createElement('div')
    document.body.append(layer)
    at(1200)
    const release = lockScroll(layer)
    at(0)
    release()
    expect(scrollTo).toHaveBeenCalledWith(0, 1200)
    layer.remove()
  })

  test('cancels a finger dragging the page, but not one scrolling a list inside the layer (iOS Safari)', () => {
    const page = document.createElement('p')
    const layer = document.createElement('div')
    const list = document.createElement('ul')
    list.style.overflowY = 'auto'
    Object.defineProperty(list, 'scrollHeight', { configurable: true, value: 600 })
    Object.defineProperty(list, 'clientHeight', { configurable: true, value: 200 })
    list.scrollTop = 100
    layer.append(list)
    document.body.append(page, layer)
    const release = lockScroll(layer)
    touch(page, 'touchstart', 300)
    expect(touch(page, 'touchmove', 200).defaultPrevented).toBe(true)
    touch(list, 'touchstart', 300)
    expect(touch(list, 'touchmove', 200).defaultPrevented).toBe(false)
    /* At the top of the list, dragging down would pull the page: cancelled */
    list.scrollTop = 0
    touch(list, 'touchstart', 200)
    expect(touch(list, 'touchmove', 300).defaultPrevented).toBe(true)
    release()
    touch(page, 'touchstart', 300)
    expect(touch(page, 'touchmove', 200).defaultPrevented).toBe(false)
    page.remove()
    layer.remove()
  })

  test('a dialog locks the page while open, modal or not, and puts it back on close', () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    /* A side panel watches its body's size for the fades; jsdom has no ResizeObserver */
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
    function Example({ modal }: { modal: boolean }) {
      const [open, setOpen] = useState(false)
      return (
        <>
          <Button onClick={() => setOpen(true)}>New order</Button>
          <Dialog open={open} onOpenChange={setOpen} modal={modal} placement="end" title="New order">
            <p>Lines</p>
          </Dialog>
        </>
      )
    }
    for (const modal of [true, false]) {
      const { unmount } = render(<Example modal={modal} />)
      at(800)
      fireEvent.click(screen.getByRole('button', { name: 'New order' }))
      expect(root().style.overflow).toBe('hidden')
      at(0)
      fireEvent.click(screen.getByRole('button', { name: 'Close' }))
      expect(root().style.overflow).toBe('')
      expect(scrollTo).toHaveBeenLastCalledWith(0, 800)
      unmount()
    }
    vi.unstubAllGlobals()
  })
})
