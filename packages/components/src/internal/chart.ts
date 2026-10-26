/*
 * What the overview’s charts share. Charts are drawn in SVG and CSS with the chart roles of the tokens: no charting
 * library, because the three shapes the dashboard needs are small and drawing them here keeps every color, type and
 * motion in the system.
 */

export type ChartTone = 'accent' | 'strong' | 'muted' | 'danger' | 'warning'

export interface ChartSegment {
  value: number
  tone: ChartTone
  /** What the part is, for the accessible description: Shipped, On hold. */
  label: string
}

export const formatPlain = (value: number) => value.toLocaleString('en-US')

export const describeSegments = (segments: ChartSegment[], format: (value: number) => string) =>
  segments.map(({ label, value }) => `${label} ${format(value)}`).join(', ')
