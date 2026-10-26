import { useEffect, type RefObject } from 'react'
import { smoothWheel } from './smooth-wheel.ts'

/* The indicator: 3 px from the ends of the track, never shorter than 32 px; it stays 1 s after scrolling and shows
   for 0.8 s when the pointer or focus arrives, to say there is more */
const INSET = 3
const MIN_LENGTH = 32
const AFTER_SCROLL = 1000
const ON_ARRIVAL = 800

/**
 * A content area that scrolls when its content does not fit, as the lists of the overview do: no scrollbar, a fade
 * at each edge that has more, and a thin indicator that shows while scrolling. While it scrolls it is a named group
 * that takes focus, so the keyboard can scroll it; when everything fits it is left as plain content.
 *
 * The area names itself from `data-label` or `data-labelledby`; the indicator shares the area’s offset parent.
 */
export function useScrollArea(area: RefObject<HTMLElement | null>, indicator: RefObject<HTMLElement | null>, enabled = true, rows: 'snap' | 'fit' | false = false) {
  /* 1.1: the mouse wheel eases (desktop only) and no longer fights the rows' snap */
  useEffect(() => smoothWheel(), [])
  useEffect(() => {
    const element = area.current
    const thumb = indicator.current
    if (!enabled || !element || !thumb) return
    let timer = 0

    /* Rows (1.0.0-alpha.21, alpha.22, alpha.23): a list stops on its rows, scrolling down or up. In a card whose
       header draws its rule just above the list, the area reaches up to that rule, as in the product, where the rule
       is the first line of the list: the first row lies on the title's rule with the same room above its content as
       below it, down to its own rule, at rest and at every stop. The area fills the room down to the footer, as in the
       product (alpha.23: no longer cut to whole rows, which left the room under the list empty); the list ends with
       the room that puts the last row on the rule as well. The top fade covers only the room inside a row, so a row
       that has stopped is never half covered; the bottom fade is the product's 24 px. Nothing is hidden while the list
       moves (alpha.23: the alpha.22 mask that hid the room under the last whole row made rows vanish mid-scroll). */
    const base = {
      marginTop: parseFloat(getComputedStyle(element).marginTop) || 0,
      paddingTop: parseFloat(getComputedStyle(element).paddingTop) || 0,
      paddingBottom: parseFloat(getComputedStyle(element).paddingBottom) || 0,
    }
    const half = (value: number) => Math.round(value * 2) / 2
    const rowsOf = () => {
      let list: Element = element
      while (list.children.length === 1 && list.firstElementChild!.children.length > 1) list = list.firstElementChild!
      const children = [...list.children].filter((child) => (child as HTMLElement).offsetHeight > 0) as HTMLElement[]
      /* The files of a group that is folded are not stops */
      const nested = [...element.querySelectorAll('[data-scroll-row]')].filter((row) => (row as HTMLElement).offsetHeight > 0 && !row.closest('[inert]')) as HTMLElement[]
      return { list, children, items: [...children, ...nested] }
    }
    let lift = 0
    let tail = 0
    let last = ''
    const contentOf = (node: Element) => {
      let top = Infinity
      let bottom = -Infinity
      const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
      for (let text = walker.nextNode(); text; text = walker.nextNode()) {
        if (!text.textContent?.trim()) continue
        const range = document.createRange()
        range.selectNodeContents(text)
        for (const r of range.getClientRects()) if (r.height > 0) (top = Math.min(top, r.top)), (bottom = Math.max(bottom, r.bottom))
      }
      for (const part of node.querySelectorAll('svg, button, img')) {
        const r = part.getBoundingClientRect()
        if (r.height > 0) (top = Math.min(top, r.top)), (bottom = Math.max(bottom, r.bottom))
      }
      return { top, bottom }
    }
    const setStyle = (node: HTMLElement, property: string, value: string) => {
      if (node.style.getPropertyValue(property) !== value) node.style.setProperty(property, value)
    }
    const fit = (scrolls: boolean) => {
      if (!rows) return
      const { list, children, items } = rowsOf()
      /* Only when something it depends on has changed: the card's size, the rows, or the area's own size. Whole
         pixels only, so a sub-pixel change of scale never re-fits a list while it is being scrolled */
      const card = element.closest('.sonar-card') as HTMLElement | null
      let heights = 0
      for (const item of items) heights += item.offsetHeight
      const box0 = element.getBoundingClientRect()
      const keyOf = () => `${scrolls}|${card?.offsetWidth}x${card?.offsetHeight}|${element.clientHeight - (parseFloat(element.style.paddingTop) || 0)}|${items.length}|${heights}|${Math.round(box0.width)}`
      if (keyOf() === last) return
      const snap = scrolls ? 'y mandatory' : ''
      if (element.style.scrollSnapType !== snap) element.style.scrollSnapType = snap
      /* Leftovers of 1.0.0-alpha.21–22, when the area was cut to whole rows */
      if (element.style.height) (element.style.height = ''), (element.style.flex = '')
      const scale = element.offsetHeight ? box0.height / element.offsetHeight : 1
      /* Where things are, in the area's own pixels */
      const y = (value: number) => (value - element.getBoundingClientRect().top) / scale + element.scrollTop
      const at = (node: Element) => {
        const r = node.getBoundingClientRect()
        return { top: y(r.top), bottom: y(r.bottom) }
      }
      const first = children[0]
      if (!first) return
      const second = children[1]
      const snapTarget = (list !== element ? list : first) as HTMLElement
      /* Rows set apart by a gap (bands) stop that gap below the rule. Rows that draw rules stop so that their content
         lies as far below the rule above as it lies above the rule below */
      const gap = second ? Math.max(0, Math.min(16, at(second).top - at(first).bottom)) : 0
      const head = first.querySelector('[data-scroll-row]') ? (first.firstElementChild ?? first) : first
      const box1 = at(head)
      const content1 = contentOf(head)
      const rule = parseFloat(getComputedStyle(first).borderBottomWidth) || 0
      const insetTop = Number.isFinite(content1.top) ? Math.max(0, y(content1.top) - box1.top) : 8
      const below = Number.isFinite(content1.bottom) ? Math.max(0, (head === first ? box1.bottom - rule : box1.bottom) - y(content1.bottom)) : insetTop
      const marginOf = (item: Element) => {
        if (gap) return gap
        const content = contentOf(item)
        return Number.isFinite(content.top) ? half(below - (y(content.top) - at(item).top)) : 0
      }
      /* The rule just above the area: the header's, or the summary's when there is one; only when nothing else is
         drawn between them, so the area never lies over other content */
      let above: Element | null = null
      for (let node: Element | null = element; node && !above && !node.classList.contains('sonar-card'); node = node.parentElement) {
        for (let sibling = node.previousElementSibling; sibling && !above; sibling = sibling.previousElementSibling) {
          if ((sibling as HTMLElement).offsetHeight > 0) above = sibling
        }
      }
      let next = 0
      if (above && /sonar-card-(header|summary)/.test(above.className) && parseFloat(getComputedStyle(above).borderBottomWidth) > 0) {
        const room = (element.getBoundingClientRect().top - above.getBoundingClientRect().bottom) / scale + lift
        if (room > 0.5 && room <= 40) next = half(room)
      }
      /* The first row's place under the rule: its own stop, at rest too */
      const offset = next ? Math.max(0, gap || half(below - insetTop)) : 0
      lift = next
      setStyle(element, 'margin-top', lift ? `${base.marginTop - lift}px` : '')
      setStyle(element, 'padding-top', lift ? `${offset}px` : '')
      if (snapTarget.style.scrollSnapAlign !== 'start') snapTarget.style.scrollSnapAlign = 'start'
      const rest = at(snapTarget).top
      setStyle(snapTarget, 'scroll-margin-top', `${half(rest)}px`)
      const stops: { top: number; margin: number }[] = []
      for (const item of items) {
        if (item === snapTarget) continue
        if (item.style.scrollSnapAlign !== 'start') item.style.scrollSnapAlign = 'start'
        const margin = marginOf(item)
        setStyle(item, 'scroll-margin-top', `${margin}px`)
        stops.push({ top: at(item).top, margin })
      }
      /* The list ends with the room that puts a row on the rule at its last stop, as every other stop does */
      const shown = element.clientHeight
      const end = Math.max(...items.map((item) => at(item).bottom), at(snapTarget).bottom)
      const minimum = Math.max(0, half(rest) - gap)
      tail = minimum
      for (const stop of stops.sort((a, b) => a.top - b.top)) {
        const left = shown - (end - stop.top) - stop.margin
        if (left >= Math.min(minimum, minimum - stop.margin) - 1) {
          tail = Math.max(0, left)
          break
        }
      }
      setStyle(element, 'padding-bottom', `${Math.floor(Math.max(base.paddingBottom, tail) * 2) / 2}px`)
      /* Bands: the top fade lies in the room between them; rows that draw rules: in the room inside the row */
      setStyle(element, '--_fade-top', `${gap || Math.min(insetTop, below)}px`)
      setStyle(element, '--_fade-bottom', '24px')
      last = keyOf()
    }

    const name = (scrolls: boolean) => {
      const { label, labelledby } = element.dataset
      element.toggleAttribute('data-scrollable', scrolls)
      if (scrolls) {
        element.tabIndex = 0
        element.setAttribute('role', 'group')
        if (label) element.setAttribute('aria-label', label)
        if (labelledby) element.setAttribute('aria-labelledby', labelledby)
      } else {
        for (const attribute of ['tabindex', 'role', 'aria-label', 'aria-labelledby']) element.removeAttribute(attribute)
      }
    }

    const place = (scrolled = false) => {
      if (!scrolled) fit(element.scrollHeight > element.clientHeight + 1 || !!element.style.height)
      const { clientHeight: height, scrollHeight: content, scrollTop: top } = element
      const scrolls = content > height + 1
      if (scrolls !== element.hasAttribute('data-scrollable')) name(scrolls)
      element.toggleAttribute('data-at-start', top <= 1)
      element.toggleAttribute('data-at-end', top >= content - height - 1)
      thumb.hidden = !scrolls
      if (!scrolls) return false
      /* The track runs between the rules the rows stop on, not over the room the area took above them */
      const track = height - lift - tail - INSET * 2
      const length = Math.max(MIN_LENGTH, (track * height) / content)
      thumb.style.top = `${element.offsetTop + lift + INSET + ((track - length) * top) / (content - height)}px`
      thumb.style.height = `${length}px`
      return true
    }

    const show = (duration: number, scrolled = false) => {
      if (!place(scrolled)) return
      thumb.toggleAttribute('data-visible', true)
      clearTimeout(timer)
      timer = window.setTimeout(() => thumb.removeAttribute('data-visible'), duration)
    }
    const onScroll = () => show(AFTER_SCROLL, true)
    const onArrival = () => show(ON_ARRIVAL, true)

    /* Content can change size without the area changing: watch the area, each child, and children as they come */
    /* Changes of size come in bursts (a group unfolding, a card being resized): placed once per frame */
    let frame = 0
    const later = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        place()
      })
    }
    const sizes = new ResizeObserver(later)
    const watch = () => {
      sizes.observe(element, { box: 'border-box' })
      if (rows === 'fit' && element.parentElement) sizes.observe(element.parentElement)
      for (const child of element.children) sizes.observe(child)
    }
    const children = new MutationObserver(() => {
      watch()
      later()
    })
    watch()
    children.observe(element, { childList: true, subtree: rows !== false })
    element.addEventListener('scroll', onScroll, { passive: true })
    element.addEventListener('pointerenter', onArrival)
    element.addEventListener('focus', onArrival)
    place()

    return () => {
      sizes.disconnect()
      children.disconnect()
      element.removeEventListener('scroll', onScroll)
      element.removeEventListener('pointerenter', onArrival)
      element.removeEventListener('focus', onArrival)
      clearTimeout(timer)
      cancelAnimationFrame(frame)
    }
  }, [area, indicator, enabled, rows])
}
