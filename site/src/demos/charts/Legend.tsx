import { ChartLegend } from '@orbex/sonar-components/chart-legend'

/* Names alone, under a chart that states its figures; or names with values, when the chart has none */
export default function Legend() {
  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <ChartLegend
        items={[
          { label: 'Shipped', tone: 'accent' },
          { label: 'On hold', tone: 'strong' },
          { label: 'Pending', tone: 'muted' },
        ]}
      />
      <ChartLegend
        items={[
          { label: 'Overdue', tone: 'danger', value: '2,230,800 USD' },
          { label: 'Not due yet', tone: 'muted', value: '1,669,200 USD' },
        ]}
      />
    </div>
  )
}
