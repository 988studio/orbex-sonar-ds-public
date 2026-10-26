import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { formatPlain } from '../internal/chart.ts'
import { cx } from '../internal/cx.ts'

export interface TrendChartProps {
  /** One sentence that sums the chart up, read first: “Daily shipments in May, 11,940 pallets in total”. */
  label: string
  /** The label of each point along the x axis, such as the days of the month. */
  categories: string[]
  /** The series drawn as a solid line. Missing points (null) leave a gap: days still to come. */
  series: { name: string; values: (number | null)[] }
  /** A second series drawn dotted against its own axis on the right: the running total of the first. */
  cumulative?: { name: string }
  /** Unit of the values, after each figure in the tooltip. */
  unit: string
  /**
   * Indices of the categories labeled on the x axis.
   * @default first, middle and last
   */
  axisLabels?: number[]
  /**
   * Height of the chart in pixels, axes included. The width follows its container.
   * @default 200
   */
  height?: number
  /** Classes added to the chart’s root element, after sonar-trend-chart. */
  className?: string
}

const MARGIN = { top: 10, right: 44, bottom: 26, left: 34 }

/* A step that gives about five gridlines: 1, 2 or 5 times a power of ten */
function niceScale(max: number) {
  const raw = Math.max(max, 1) / 5
  const power = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 5, 10].map((factor) => factor * power).find((candidate) => candidate >= raw) ?? raw
  const top = Math.ceil(Math.max(max, 1) / step) * step
  return { top, ticks: Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step) }
}

/**
 * A daily series as a line, with its running total dotted against a second axis. The legend turns each series off
 * and on; the pointer, a finger or the arrow keys show the values of a day.
 */
export function TrendChart({ label, categories, series, cumulative, unit, axisLabels, height = 200, className }: TrendChartProps) {
  const frame = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(480)
  const [shown, setShown] = useState({ series: true, cumulative: true })
  const [active, setActive] = useState<number | null>(null)
  const id = useId()

  useEffect(() => {
    const element = frame.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => entry && setWidth(Math.round(entry.contentRect.width)))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  /* A finger leaves no pointerleave and a tap elsewhere does not always move focus (Safari on iOS keeps it), so a
     reading opened by touch would stay forever: a press anywhere outside the chart closes it */
  useEffect(() => {
    if (active === null) return
    const close = (event: Event) => {
      if (!frame.current?.contains(event.target as Node)) setActive(null)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [active])

  const running = useMemo(() => {
    let sum = 0
    return series.values.map((value) => (value === null ? null : (sum += value)))
  }, [series.values])

  const left = niceScale(Math.max(0, ...series.values.map((value) => value ?? 0)))
  const right = niceScale(Math.max(0, ...running.map((value) => value ?? 0)))
  const plotWidth = Math.max(width - MARGIN.left - MARGIN.right, 10)
  const plotHeight = height - MARGIN.top - MARGIN.bottom
  const x = (index: number) => MARGIN.left + (categories.length > 1 ? (index / (categories.length - 1)) * plotWidth : 0)
  const yLeft = (value: number) => MARGIN.top + plotHeight - (value / left.top) * plotHeight
  const yRight = (value: number) => MARGIN.top + plotHeight - (value / right.top) * plotHeight

  const path = (values: (number | null)[], y: (value: number) => number) =>
    values.reduce<string>((d, value, index) => {
      if (value === null) return d
      const command = index > 0 && values[index - 1] !== null ? 'L' : 'M'
      return `${d}${command}${x(index).toFixed(1)},${y(value).toFixed(1)}`
    }, '')

  const labeled = axisLabels ?? [0, Math.floor((categories.length - 1) / 2), categories.length - 1]
  const lastDay = series.values.reduce<number>((last, value, index) => (value === null ? last : index), 0)

  const pick = (event: PointerEvent<SVGRectElement>) => {
    const box = event.currentTarget.getBoundingClientRect()
    const index = Math.round(((event.clientX - box.left) / box.width) * (categories.length - 1))
    setActive(Math.min(Math.max(index, 0), lastDay))
  }

  const step = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, Home: -Infinity, End: Infinity }
    const move = moves[event.key]
    if (move === undefined) {
      if (event.key === 'Escape') setActive(null)
      return
    }
    event.preventDefault()
    setActive((current) => Math.min(Math.max((current ?? (move > 0 ? -1 : lastDay + 1)) + move, 0), lastDay))
  }

  const value = active === null ? null : series.values[active]
  const total = active === null ? null : running[active]
  const readout =
    active === null || value === null || value === undefined
      ? ''
      : `${categories[active]}: ${formatPlain(value)} ${unit}${cumulative && total !== null && total !== undefined ? `, ${formatPlain(total)} ${unit} so far` : ''}`
  const tipLeft = active === null ? 0 : Math.min(Math.max(x(active), 70), width - 70)

  return (
    <figure className={cx('sonar-trend-chart', className)}>
      <div className="sonar-trend-legend" role="group" aria-label="Series">
        <button type="button" aria-pressed={shown.series} data-series="primary" onClick={() => setShown((now) => ({ ...now, series: !now.series }))}>
          <span className="sonar-trend-marker" aria-hidden="true" />
          {series.name}
        </button>
        {cumulative && (
          <button type="button" aria-pressed={shown.cumulative} data-series="cumulative" onClick={() => setShown((now) => ({ ...now, cumulative: !now.cumulative }))}>
            <span className="sonar-trend-marker" aria-hidden="true" />
            {cumulative.name}
          </button>
        )}
      </div>
      <div
        ref={frame}
        className="sonar-trend-frame"
        tabIndex={0}
        role="group"
        aria-label={`${label}. Use the arrow keys to read each day.`}
        aria-describedby={`${id}-readout`}
        onKeyDown={step}
        onBlur={() => setActive(null)}
      >
        {/* Drawn at the measured width. Before the first measure (server rendering, or before hydration) the viewBox
            scales the default drawing to fit, so it never overflows its card. */}
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} aria-hidden="true">
          {left.ticks.map((tick) => (
            <g key={tick}>
              <line className="sonar-trend-grid" x1={MARGIN.left} x2={width - MARGIN.right} y1={yLeft(tick)} y2={yLeft(tick)} />
              <text className="sonar-trend-axis" x={MARGIN.left - 8} y={yLeft(tick)} textAnchor="end" dominantBaseline="middle">
                {formatPlain(tick)}
              </text>
            </g>
          ))}
          {cumulative &&
            right.ticks
              .filter((_, index) => index % Math.max(1, Math.round(right.ticks.length / left.ticks.length)) === 0)
              .map((tick) => (
                <text key={tick} className="sonar-trend-axis" x={width - MARGIN.right + 8} y={yRight(tick)} dominantBaseline="middle">
                  {formatPlain(tick)}
                </text>
              ))}
          {labeled.map((index) => (
            <text key={index} className="sonar-trend-axis" x={x(index)} y={height - 8} textAnchor="middle">
              {categories[index]}
            </text>
          ))}
          {cumulative && shown.cumulative && <path className="sonar-trend-line" data-series="cumulative" d={path(running, yRight)} />}
          {shown.series && <path className="sonar-trend-line" data-series="primary" d={path(series.values, yLeft)} />}
          {active !== null && (
            <g className="sonar-trend-focus">
              <line x1={x(active)} x2={x(active)} y1={MARGIN.top} y2={MARGIN.top + plotHeight} />
              {shown.series && value !== null && value !== undefined && <circle data-series="primary" cx={x(active)} cy={yLeft(value)} r={4} />}
              {cumulative && shown.cumulative && total !== null && total !== undefined && <circle data-series="cumulative" cx={x(active)} cy={yRight(total)} r={4} />}
            </g>
          )}
          <rect
            className="sonar-trend-hit"
            x={MARGIN.left}
            y={MARGIN.top}
            width={plotWidth}
            height={plotHeight}
            onPointerMove={pick}
            onPointerDown={pick}
            onPointerLeave={(event) => event.pointerType === 'mouse' && setActive(null)}
          />
        </svg>
        {active !== null && readout && (
          <div className="sonar-trend-tip" style={{ left: tipLeft }} aria-hidden="true">
            <span>{categories[active]}</span>
            {shown.series && value !== null && <strong>{`${formatPlain(value ?? 0)} ${unit}`}</strong>}
            {cumulative && shown.cumulative && total !== null && <span>{`${cumulative.name}: ${formatPlain(total ?? 0)} ${unit}`}</span>}
          </div>
        )}
      </div>
      <p className="sonar-trend-readout" id={`${id}-readout`} aria-live="polite">
        {readout}
      </p>
    </figure>
  )
}
