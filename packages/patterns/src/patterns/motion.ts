/**
 * Motion shared by the card demos, as in the product: short, without bounce, easing out.
 * Everything here steps straight to the end when the person asks for reduced motion.
 */
import { useEffect, useRef, useState } from 'react'

export const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * A figure that counts to its new value when the unit changes, instead of jumping. `id` says which figure it is:
 * when it changes (another day, another month) the figure jumps, because it is a different number, not a converted one.
 */
export function useCount(target: number, id: string | number = '', duration = 420) {
  const [shown, setShown] = useState(target)
  const current = useRef(target)
  const last = useRef({ target, id })
  useEffect(() => {
    const previous = last.current
    last.current = { target, id }
    if (previous.target === target) return
    if (previous.id !== id || reducedMotion()) {
      current.current = target
      setShown(target)
      return
    }
    const from = current.current
    const start = performance.now()
    let frame = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      current.current = t >= 1 ? target : from + (target - from) * (1 - (1 - t) ** 4)
      setShown(current.current)
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, id, duration])
  /* The first paint after a change of figure already shows the new one, never a frame of the old */
  return last.current.id !== id ? target : shown
}

/** A figure as text that counts on a change of unit: <Count value={1420} format={(x) => quantity(x, unit)} /> */
export function Count({ value, format, id }: { value: number; format: (value: number) => string; id?: string | number }) {
  return format(useCount(value, id))
}
