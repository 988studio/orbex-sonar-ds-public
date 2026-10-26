/**
 * Springs as CSS easing functions.
 *
 * A spring is described the way designers talk about it: how long it takes and how much it bounces.
 *   duration — the time the spring needs to settle within 0.2% of its target
 *   bounce   — 0 settles without overshoot; 0.3 overshoots and settles (damping ratio = 1 − bounce)
 * The curve is sampled into a CSS `linear()` function, so the motion runs on the compositor
 * like any other transition, with no JavaScript at runtime.
 */

const SETTLE_TOLERANCE = 0.002
const SAMPLES = 48

/** Position of a unit spring released from rest at 0, heading to 1, at normalised time t (0–1). */
function position(dampingRatio: number, frequency: number, t: number): number {
  if (dampingRatio >= 1) return 1 - (1 + frequency * t) * Math.exp(-frequency * t)
  const damped = frequency * Math.sqrt(1 - dampingRatio ** 2)
  const envelope = Math.exp(-dampingRatio * frequency * t)
  return 1 - envelope * (Math.cos(damped * t) + ((dampingRatio * frequency) / damped) * Math.sin(damped * t))
}

/** Largest distance from the target once the duration is over. */
function residual(dampingRatio: number, frequency: number): number {
  let worst = 0
  for (let t = 1; t <= 5; t += 0.0005) worst = Math.max(worst, Math.abs(1 - position(dampingRatio, frequency, t)))
  return worst
}

/** Natural frequency (in units of 1/duration) that makes the spring settle exactly at the end of its duration. */
function settlingFrequency(dampingRatio: number): number {
  let [low, high] = [1, 60]
  for (let step = 0; step < 50; step++) {
    const middle = (low + high) / 2
    if (residual(dampingRatio, middle) > SETTLE_TOLERANCE) low = middle
    else high = middle
  }
  return high
}

/** CSS `linear()` easing for a spring with the given bounce. */
export function springEasing(bounce: number): string {
  if (bounce < 0 || bounce >= 1) throw new RangeError(`bounce must be in [0, 1): ${bounce}`)
  const dampingRatio = 1 - bounce
  const frequency = settlingFrequency(dampingRatio)
  const stops = Array.from({ length: SAMPLES }, (_, i) => Number(position(dampingRatio, frequency, i / SAMPLES).toFixed(4)))
  return `linear(${[...stops, 1].join(', ')})`
}
