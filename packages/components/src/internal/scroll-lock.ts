/**
 * Scroll lock: while a layer covers the page (a modal dialog, a side panel or sheet, a navigation drawer), the page
 * behind it does not scroll, and when the last layer closes the page is exactly where it was.
 *
 * One lock for the whole document, counted: layers can open over each other and the page is released when the last
 * one goes. The page keeps its place on screen (no jump to the top, sticky bars stay put): the root stops scrolling
 * with overflow hidden, and the width of a classic scrollbar is kept as padding so nothing shifts sideways.
 * iOS Safari: older versions scroll the page under overflow hidden when a finger drags it, so a touch move is also
 * cancelled unless it starts inside a layer, over something in it that can still scroll that way. Overscroll inside
 * a layer does not pass to the page (overscroll-behavior: contain on the layer).
 */

interface Held {
  x: number
  y: number
  styles: { overflow: string; paddingRight: string; overscroll: string }
}

const layers = new Set<Element>()
let held: Held | null = null
let startY = 0
let startX = 0

const canScroll = (element: Element, dx: number, dy: number) => {
  const style = getComputedStyle(element)
  const vertical = /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1
  const horizontal = /(auto|scroll)/.test(style.overflowX) && element.scrollWidth > element.clientWidth + 1
  if (Math.abs(dy) >= Math.abs(dx)) {
    if (!vertical) return false
    /* At the top dragging down, or at the end dragging up, the move would pass to the page */
    if (dy > 0) return element.scrollTop > 0
    return element.scrollTop + element.clientHeight < element.scrollHeight - 1
  }
  if (!horizontal) return false
  if (dx > 0) return element.scrollLeft > 0
  return element.scrollLeft + element.clientWidth < element.scrollWidth - 1
}

const onTouchStart = (event: TouchEvent) => {
  const touch = event.touches[0]
  if (!touch) return
  startY = touch.clientY
  startX = touch.clientX
}

const onTouchMove = (event: TouchEvent) => {
  if (event.touches.length > 1) return
  const touch = event.touches[0]
  if (!touch || !event.cancelable) return
  const dy = touch.clientY - startY
  const dx = touch.clientX - startX
  const target = event.target instanceof Element ? event.target : null
  const layer = target && [...layers].find((candidate) => candidate.contains(target))
  if (layer) {
    for (let element: Element | null = target; element && element !== layer.parentElement; element = element.parentElement) {
      if (canScroll(element, dx, dy)) return
    }
  }
  event.preventDefault()
}

/**
 * Locks the page's scroll while `layer` is open; touches inside it can still scroll what scrolls in it.
 * Returns the function that releases this layer's hold.
 */
export function lockScroll(layer: Element): () => void {
  if (typeof document === 'undefined') return () => {}
  layers.add(layer)
  if (!held) {
    const root = document.documentElement
    const gutter = window.innerWidth - root.clientWidth
    held = {
      x: window.scrollX,
      y: window.scrollY,
      styles: { overflow: root.style.overflow, paddingRight: root.style.paddingRight, overscroll: root.style.overscrollBehavior },
    }
    if (gutter > 0) root.style.paddingRight = `${gutter}px`
    root.style.overflow = 'hidden'
    root.style.overscrollBehavior = 'none'
    root.dataset.scrollLocked = ''
    document.addEventListener('touchstart', onTouchStart, { passive: true, capture: true })
    document.addEventListener('touchmove', onTouchMove, { passive: false, capture: true })
  }
  let released = false
  return () => {
    if (released) return
    released = true
    layers.delete(layer)
    if (layers.size || !held) return
    const root = document.documentElement
    const { x, y, styles } = held
    held = null
    root.style.overflow = styles.overflow
    root.style.paddingRight = styles.paddingRight
    root.style.overscrollBehavior = styles.overscroll
    delete root.dataset.scrollLocked
    document.removeEventListener('touchstart', onTouchStart, { capture: true })
    document.removeEventListener('touchmove', onTouchMove, { capture: true })
    /* Back to the same place, at once, whatever the page's scroll-behavior says */
    if (window.scrollX !== x || window.scrollY !== y) {
      const behavior = root.style.scrollBehavior
      root.style.scrollBehavior = 'auto'
      window.scrollTo(x, y)
      root.style.scrollBehavior = behavior
    }
  }
}

/** Whether a layer holds the page's scroll now */
export const isScrollLocked = () => held !== null
