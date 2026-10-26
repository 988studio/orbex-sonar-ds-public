/* Daily shipments, size XL: the month to date, its key figures and the month’s line */
import { Card, CardLink, UnitMenu } from '@orbex/sonar-components/card'
import { TrendChart } from '@orbex/sonar-components/trend-chart'
import '@orbex/sonar-components/card.css'
import '@orbex/sonar-components/menu.css'
import '@orbex/sonar-components/trend-chart.css'
import { useState } from 'react'

const units = [
  { value: 'plt', short: 'plt', name: 'Pallets' },
  { value: 'kg', short: 'kg', name: 'Kilograms' },
]
const perPallet: Record<string, number> = { plt: 1, kg: 420 }

/* May up to the 12th: the days still to come are null and leave the line open */
const shipped = [320, 410, 360, 300, 455, 385, 290, 430, 470, 345, 370, 350]
const days = Array.from({ length: 31 }, (_, index) => `May ${index + 1}`)
const values = days.map((_, index) => shipped[index] ?? null)

export function ShipmentsCard() {
  const [unit, setUnit] = useState('plt')
  const inUnit = (pallets: number) => pallets * perPallet[unit]!
  const format = (pallets: number) => `${inUnit(pallets).toLocaleString('en-US')} ${unit}`
  const total = shipped.reduce((sum, value) => sum + value, 0)
  const stats = [
    ['Today', shipped.at(-1)!],
    ['Yesterday', shipped.at(-2)!],
    ['This month', total],
    ['Returns', 40],
  ] as const
  return (
    <Card
      title="Daily shipments"
      size="xl"
      actions={<UnitMenu label="Unit" value={unit} options={units} onValueChange={setUnit} />}
      summary={{ label: 'Month to date', value: format(total) }}
      footer={<CardLink href="/shipments">Go to Shipments</CardLink>}
    >
      <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {stats.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd style={{ margin: 0 }}>{format(value)}</dd>
          </div>
        ))}
      </dl>
      <TrendChart
        label={`Daily shipments in May 2026, ${format(total)} so far`}
        categories={days}
        series={{ name: `Shipments (${unit})`, values: values.map((value) => (value === null ? null : inUnit(value))) }}
        cumulative={{ name: `Cumulative (${unit})` }}
        unit={unit}
        axisLabels={[0, 14, days.length - 1]}
      />
    </Card>
  )
}
