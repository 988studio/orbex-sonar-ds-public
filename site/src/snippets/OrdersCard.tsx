/* Orders, size M: the open total, two months as tick bars, New order and the way to the Orders page */
import { Card, CardLink, UnitMenu } from '@orbex/sonar-components/card'
import { ChartLegend } from '@orbex/sonar-components/chart-legend'
import { IconButton } from '@orbex/sonar-components/icon-button'
import { TickBar } from '@orbex/sonar-components/tick-bar'
import '@orbex/sonar-components/card.css'
import '@orbex/sonar-components/chart-legend.css'
import '@orbex/sonar-components/icon-button.css'
import '@orbex/sonar-components/menu.css'
import '@orbex/sonar-components/tick-bar.css'
import addCircle from '@material-symbols/svg-400/rounded/add_circle.svg?raw'
import { useState } from 'react'

const AddIcon = () => (
  <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
    <path d={addCircle.match(/ d="([^"]+)"/)?.[1]} />
  </svg>
)

const units = [
  { value: 'plt', short: 'plt', name: 'Pallets' },
  { value: 'kg', short: 'kg', name: 'Kilograms' },
]
const perPallet: Record<string, number> = { plt: 1, kg: 420 }

const months = [
  { month: 'May 2026', shipped: 1420, onHold: 80, pending: 1100 },
  { month: 'June 2026', shipped: 0, onHold: 160, pending: 2600 },
]
const parts = [
  { key: 'shipped', label: 'Shipped', tone: 'accent' },
  { key: 'onHold', label: 'On hold', tone: 'strong' },
  { key: 'pending', label: 'Pending', tone: 'muted' },
] as const

export function OrdersCard({ onNewOrder }: { onNewOrder: () => void }) {
  const [unit, setUnit] = useState('plt')
  const format = (pallets: number) => `${(pallets * perPallet[unit]!).toLocaleString('en-US')} ${unit}`
  const open = months.reduce((sum, { onHold, pending }) => sum + onHold + pending, 0)
  return (
    <Card
      title="Orders"
      size="m"
      actions={<UnitMenu label="Unit" value={unit} options={units} onValueChange={setUnit} />}
      summary={{ label: 'Open total', value: format(open) }}
      footer={<CardLink href="/orders">Go to Orders</CardLink>}
    >
      {months.map((month) => (
        <section key={month.month} aria-label={month.month} style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
          <h3 style={{ margin: 0, font: 'var(--sonar-type-label-md)' }}>{month.month}</h3>
          <TickBar
            label={`${month.month} orders`}
            format={format}
            segments={parts.map(({ key, label, tone }) => ({ label, tone, value: month[key] }))}
          />
        </section>
      ))}
      <ChartLegend aria-hidden="true" items={parts.map(({ label, tone }) => ({ label, tone }))} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
        <span>New order</span>
        <IconButton variant="tonal" label="New order" icon={<AddIcon />} aria-haspopup="dialog" onClick={onNewOrder} />
      </div>
    </Card>
  )
}
