import type { ComponentProps, CSSProperties } from 'react'
import { describeSegments, formatPlain, type ChartSegment } from '../internal/chart.ts'
import { cx } from '../internal/cx.ts'

export type { ChartSegment, ChartTone } from '../internal/chart.ts'

export interface TickBarProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** The parts of a whole, in order. Each takes its share of the width. */
  segments: ChartSegment[]
  /** What the bar measures, read before its parts: “May orders”. */
  label: string
  /** Formats values for the accessible description. */
  format?: (value: number) => string
}

/* One row of ticks for the whole bar, colored part by part. Each change of color falls between two ticks, so the
   parts meet without a gap and no tick is split in two colors. */
const fill = (segments: ChartSegment[], edge: (percent: number) => string) => {
  const total = segments.reduce((sum, { value }) => sum + Math.max(value, 0), 0)
  if (!total) return 'var(--_muted)'
  let start = 0
  const stops = segments.flatMap(({ value, tone }) => {
    if (value <= 0) return []
    const end = start + (value / total) * 100
    const stop = `var(--_${tone}) ${edge(start)} ${edge(end)}`
    start = end
    return [stop]
  })
  return `linear-gradient(90deg, ${stops.join(', ')})`
}

const plain = (percent: number) => `${+percent.toFixed(3)}%`
const snapped = (percent: number) => (percent <= 0 || percent >= 100 ? plain(percent) : `round(nearest, ${plain(percent)}, var(--_pitch))`)

/** A proportion as a row of fine ticks. */
export function TickBar({ segments, label, format = formatPlain, className, style, ...props }: TickBarProps) {
  const custom = { '--_fill': fill(segments, plain), '--_fill-snapped': fill(segments, snapped) } as CSSProperties
  return (
    <div
      role="img"
      aria-label={`${label}: ${describeSegments(segments, format)}`}
      className={cx('sonar-tick-bar', className)}
      style={{ ...custom, ...style }}
      {...props}
    />
  )
}
