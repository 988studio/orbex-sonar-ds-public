/*
 * Smooth wheel (1.1.0): a mouse wheel scrolls in steps of about 100 px a notch, and in Safari each notch lands at
 * once, so pages and lists jump. On a desktop with a mouse, this eases every wheel step over about a quarter of a
 * second, on the page and in any area that scrolls (card lists, panels, the assistant). Touch screens, trackpads (their
 * scrolling is already smooth, with its own momentum), the keyboard and scrollbars keep the browser’s own scrolling.
 * With reduced motion the step is not eased; it lands at once, as before.
 *
 * Lists that stop on their rows (scroll-snap y) used to pull each notch back to a row (DS 1.1 pending #17). 1.1.0 eased
 * the list to a row after the wheel; 1.1.2 dropped the snap only when these events looked like a mouse's, which failed
 * where a mouse reads as a trackpad (Chromium at 2× scale: half notches), so the rows still snapped (988©STUDIO, 26 oct
 * 16:45, «sigue haciendo snap con ratón en escritorio»). Since 1.1.3 the snap does not depend on the wheel at all: on a
 * desktop (`(hover: hover) and (pointer: fine)`: mouse or trackpad) the lists have no row snap, by CSS (card and
 * scroll-area styles.css), and stop wherever the wheel leaves them. Touch screens keep it. The wheel-type check below
 * only decides whether a step is eased.
 */

const TAU = 70 // ms: the easing’s time constant; a step is done in about four of them
const TRACKPAD_HOLD = 160 // ms: events this close to a trackpad’s are part of its gesture (and its momentum)

type Motion = { target: number; pos: number; frame: number; time: number; expected: number }
const motions = new WeakMap<Element, Motion>()
let installs = 0
let lastTrackpad = -Infinity

const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const desktopMouse = () => matchMedia('(hover: hover) and (pointer: fine)').matches

/** A mouse wheel notch, not a trackpad’s pixel stream. Returns the distance in px, or 0 when it is not a wheel. */
function wheelDistance(event: WheelEvent): number {
  const dy = event.deltaY
  if (!dy || Math.abs(dy) < Math.abs(event.deltaX)) return 0
  if (event.deltaMode === 1) return dy * 16 // lines (Firefox)
  if (event.deltaMode === 2) return dy * innerHeight * 0.85 // pages
  if (event.timeStamp - lastTrackpad < TRACKPAD_HOLD) {
    lastTrackpad = event.timeStamp
    return 0
  }
  const legacy = (event as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY
  if (legacy) {
    /* A wheel reports whole notches of 120 (WebKit: 40 px a notch; Chromium: 100 px); a trackpad streams small, uneven
       pixel steps. A gesture that starts as a trackpad's stays one (TRACKPAD_HOLD), so its momentum is never eased. */
    if (legacy % 120 !== 0 || Math.abs(dy) < 1) {
      lastTrackpad = event.timeStamp
      return 0
    }
    return Math.abs(dy) >= 16 ? dy : Math.sign(dy) * (Math.abs(legacy) / 120) * 40
  }
  if (Number.isInteger(dy) && Math.abs(dy) >= 50) return dy
  lastTrackpad = event.timeStamp
  return 0
}

const canScroll = (el: Element, dy: number) => {
  const max = el.scrollHeight - el.clientHeight
  if (max < 1) return false
  const motion = motions.get(el)
  const at = motion ? motion.target : el.scrollTop
  return dy > 0 ? at < max - 0.5 : at > 0.5
}

/** The element the wheel scrolls: the nearest area that can still move that way, else the page; null for none */
function scrollerOf(start: Element | null, dy: number): Element | null | undefined {
  for (let el = start; el && el !== document.body && el !== document.documentElement; el = el.parentElement) {
    const style = getComputedStyle(el)
    if (!/(auto|scroll)/.test(style.overflowY)) continue
    if (el.scrollHeight - el.clientHeight < 1) continue
    if (canScroll(el, dy)) return el
    /* At its end: a contained area does not hand the wheel to the page */
    if (style.overscrollBehaviorY !== 'auto') return null
  }
  const page = document.scrollingElement
  if (!page) return undefined
  const root = getComputedStyle(document.documentElement)
  const body = getComputedStyle(document.body)
  if (root.overflowY === 'hidden' || body.overflowY === 'hidden' || root.overflowY === 'clip') return undefined
  return canScroll(page, dy) ? page : null
}

function animate(el: Element, to: number, done?: () => void) {
  const max = el.scrollHeight - el.clientHeight
  const target = Math.max(0, Math.min(max, to))
  let motion = motions.get(el)
  if (calm()) {
    if (motion) cancelAnimationFrame(motion.frame), motions.delete(el)
    el.scrollTop = target
    done?.()
    return
  }
  if (motion) {
    motion.target = target
    return
  }
  motion = { target, pos: el.scrollTop, frame: 0, time: performance.now(), expected: el.scrollTop }
  motions.set(el, motion)
  const step = (now: number) => {
    const m = motions.get(el)
    if (!m) return
    /* Someone else scrolled (the keyboard, the scrollbar, a script): their scroll wins */
    if (Math.abs(el.scrollTop - m.expected) > 2) {
      motions.delete(el)
      done?.()
      return
    }
    const dt = Math.min(200, now - m.time)
    m.time = now
    m.pos += (m.target - m.pos) * (1 - Math.exp(-dt / TAU))
    if (Math.abs(m.target - m.pos) < 0.5) m.pos = m.target
    el.scrollTop = m.pos
    m.expected = el.scrollTop
    if (m.pos === m.target) {
      motions.delete(el)
      done?.()
      return
    }
    m.frame = requestAnimationFrame(step)
  }
  motion.frame = requestAnimationFrame(step)
}

function onWheel(event: WheelEvent) {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
  if (!desktopMouse()) return
  const dy = wheelDistance(event)
  if (!dy) return
  const target = event.target instanceof Element ? event.target : null
  if (target?.closest('[data-sonar-native-wheel], select, iframe')) return
  const el = scrollerOf(target, dy)
  if (el === undefined) return
  event.preventDefault()
  if (!el) return
  const motion = motions.get(el)
  animate(el, (motion ? motion.target : el.scrollTop) + dy)
}

/**
 * Turns on the smooth mouse wheel for the whole document (desktop with a mouse; never touch or trackpad; instant with
 * reduced motion). Safe to call many times: every ScrollArea, Card list and Dialog does. Returns a function that
 * turns it off again once every caller has.
 * @since 1.1.0
 */
export function smoothWheel(): () => void {
  if (typeof document === 'undefined') return () => {}
  if (installs++ === 0) {
    document.addEventListener('wheel', onWheel, { passive: false })
  }
  let on = true
  return () => {
    if (!on) return
    on = false
    if (--installs === 0) {
      document.removeEventListener('wheel', onWheel)
    }
  }
}
