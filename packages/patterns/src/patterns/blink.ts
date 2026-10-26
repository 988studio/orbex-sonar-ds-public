/**
 * One beat for every blinking alert mark (1.1.4). The blink itself is pure CSS (`cal-alert-blink` in panels.css, 1.2 s);
 * this only gives each mark an `animation-delay` so its cycle lines up with the document's clock, set once per mark.
 *
 * 1.0.0-alpha.23 to 1.1.3 wrote `animation.startTime = 0` on the running animation from script instead. On a real
 * iPhone (iOS Safari, 988©STUDIO recording, 26 Oct) that left the triangle dim and dropping out for a frame every 1.2 s
 * until the page was touched; Playwright's WebKit did not show it. Nothing here writes to an Animation object.
 *
 * How: the marks of one frame are collected, their animation is restarted together (`animation: none`, one style read,
 * then back to the stylesheet's) with `animation-delay: -(now % 1200)ms`, so a mark drawn at any moment starts at the
 * point of the cycle every other mark is at. A browser may start the animation a few frames after that (Chromium waits
 * for a busy first render): once it has started, the delay is set once more from the moment it really started (read,
 * never written), so it lands on the same beat. With reduced motion the stylesheet has no animation and nothing changes.
 */
export const BLINK_PERIOD = 1200

const pending = new Set<HTMLElement | SVGElement>()
let queued = false

const now = () => {
  const time = typeof document !== 'undefined' ? document.timeline?.currentTime : null
  return typeof time === 'number' ? time : performance.now()
}

function flush() {
  queued = false
  const marks = [...pending].filter((mark) => mark.isConnected && !mark.hasAttribute('data-beat'))
  pending.clear()
  if (!marks.length) return
  for (const mark of marks) mark.style.animation = 'none'
  void getComputedStyle(marks[0]!).animationName
  const delay = -(now() % BLINK_PERIOD)
  for (const mark of marks) {
    mark.style.animation = ''
    mark.style.animationDelay = `${delay}ms`
    mark.setAttribute('data-beat', '')
  }
  for (const mark of marks) settle(mark, delay)
}

/** Once the mark's animation has really started, the delay that puts it on the beat from that moment, if it differs */
function settle(mark: HTMLElement | SVGElement, delay: number) {
  const animation = typeof mark.getAnimations === 'function' ? mark.getAnimations()[0] : undefined
  animation?.ready.then(
    () => {
      const start = animation.startTime
      if (typeof start !== 'number' || !mark.isConnected) return
      const exact = -(start % BLINK_PERIOD)
      if (Math.abs(exact - delay) > 4) mark.style.animationDelay = `${exact}ms`
    },
    () => {},
  )
}

/** Puts blinking marks on the shared beat; marks already on it are left alone. Marks of the same frame share one pass */
export function syncBlink(marks: Iterable<Element>, now = false) {
  for (const mark of marks) if (mark instanceof HTMLElement || mark instanceof SVGElement) pending.add(mark)
  if (now) flush()
  else if (!queued) {
    queued = true
    queueMicrotask(flush)
  }
}

/** Every blinking mark in `root`, now and whenever one is added later (the documentation pages: examples wake one by one) */
export function watchBlink(root: ParentNode & Node = document, onMark?: (mark: Element) => void) {
  const selector = '.cal-alert[data-blink]'
  const found = (marks: Element[]) => {
    if (!marks.length) return
    marks.forEach((mark) => onMark?.(mark))
    syncBlink(marks)
  }
  found([...root.querySelectorAll(selector)].filter((mark) => !mark.hasAttribute('data-beat')))
  const observer = new MutationObserver((records) => {
    const marks: Element[] = []
    for (const record of records) {
      if (record.type === 'attributes') {
        if (record.target instanceof Element && record.target.matches(selector) && !record.target.hasAttribute('data-beat')) marks.push(record.target)
        continue
      }
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue
        if (node.matches(selector)) marks.push(node)
        else marks.push(...node.querySelectorAll(selector))
      }
    }
    found(marks.filter((mark) => !mark.hasAttribute('data-beat')))
  })
  observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-blink'] })
  return () => observer.disconnect()
}
