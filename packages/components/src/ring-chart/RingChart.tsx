import { useMemo, type ComponentProps, type ReactNode } from 'react'
import { describeSegments, formatPlain, type ChartSegment } from '../internal/chart.ts'
import { cx } from '../internal/cx.ts'

export type { ChartSegment, ChartTone } from '../internal/chart.ts'

export interface RingChartProps extends Omit<ComponentProps<'figure'>, 'children'> {
  /** The parts of the whole, in order around the ring: each with a label, a value and a chart tone. */
  segments: ChartSegment[]
  /** What the ring measures, read before its parts: “Inventory”. */
  label: string
  /**
   * Ticks around the ring. Fewer read as coarser; the dashboard uses 96.
   * @default 96
   */
  ticks?: number
  /** Writes a value for the chart’s accessible name: “On hold 1,420 plt”. Plain numbers when left out. */
  format?: (value: number) => string
  /**
   * Which way the parts run from twelve o’clock. Counterclockwise puts the first part on the left, beside a label
   * set on that side, as in the Inventory card.
   * @default 'clockwise'
   */
  direction?: 'clockwise' | 'counterclockwise'
  /** Content in the hole of the ring, such as the total. */
  children?: ReactNode
}

/** Parts of a whole as a ring of ticks: the donut of the Inventory card. */
export function RingChart({ segments, label, ticks = 96, format = formatPlain, direction = 'clockwise', className, children, ...props }: RingChartProps) {
  const turn = direction === 'clockwise' ? 1 : -1
  const total = segments.reduce((sum, { value }) => sum + Math.max(value, 0), 0) || 1
  const tones = useMemo(() => {
    const bounds = segments.reduce<number[]>((acc, { value }) => [...acc, (acc.at(-1) ?? 0) + Math.max(value, 0) / total], [])
    return Array.from({ length: ticks }, (_, index) => segments[bounds.findIndex((bound) => (index + 0.5) / ticks <= bound)]?.tone ?? 'muted')
  }, [segments, ticks, total])
  return (
    <figure className={cx('sonar-ring-chart', className)} {...props}>
      <svg viewBox="-50 -50 100 100" role="img" aria-label={`${label}: ${describeSegments(segments, format)}`}>
        {tones.map((tone, index) => {
          const angle = turn * (index / ticks) * 2 * Math.PI - Math.PI / 2
          /* Rounded, so the server and every browser write the same numbers: trigonometry differs in the last digits
             between engines, and a hydrated chart must match the HTML it was rendered as */
          const at = (radius: number, trig: number) => Math.round(trig * radius * 1000) / 1000
          const [cos, sin] = [Math.cos(angle), Math.sin(angle)]
          return <line key={index} data-tone={tone} x1={at(38, cos)} y1={at(38, sin)} x2={at(48, cos)} y2={at(48, sin)} />
        })}
      </svg>
      {children && <div className="sonar-ring-chart-center">{children}</div>}
    </figure>
  )
}
