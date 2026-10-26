import type { ComponentProps, ReactNode } from 'react'
import type { ChartTone } from '../internal/chart.ts'
import { cx } from '../internal/cx.ts'

export interface ChartLegendItem {
  /** What the color stands for: Shipped, Overdue. */
  label: ReactNode
  tone: ChartTone
  /** A figure after the label, when the legend also states the value. */
  value?: ReactNode
}

export interface ChartLegendProps extends Omit<ComponentProps<'ul'>, 'children'> {
  /** One entry per color, in the order of the chart’s parts. */
  items: ChartLegendItem[]
}

/** The key to a chart’s colors: a dot in each part’s tone, then its name. */
export function ChartLegend({ items, className, ...props }: ChartLegendProps) {
  return (
    <ul role="list" className={cx('sonar-chart-legend', className)} {...props}>
      {items.map(({ label, tone, value }, index) => (
        <li key={index} data-tone={tone}>
          {label}
          {value !== undefined && <span className="sonar-chart-legend-value">{value}</span>}
        </li>
      ))}
    </ul>
  )
}
