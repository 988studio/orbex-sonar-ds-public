import { Card, CardLink, UnitMenu } from '@orbex/sonar-components/card'
import { TickBar } from '@orbex/sonar-components/tick-bar'
import { useState } from 'react'

const units = [
  { value: 'plt', short: 'plt', name: 'Pallets' },
  { value: 'kg', short: 'kg', name: 'Kilograms' },
  { value: 'items', short: 'items', name: 'Items' },
]
const perPallet: Record<string, number> = { plt: 1, kg: 420, items: 36 }

const may = [
  { label: 'Shipped', tone: 'accent', value: 1420 },
  { label: 'On hold', tone: 'strong', value: 80 },
  { label: 'Pending', tone: 'muted', value: 1100 },
] as const

/* A title, a unit, one figure, its detail and the way to the full page */
export default function Basic() {
  const [unit, setUnit] = useState('plt')
  const format = (pallets: number) => `${(pallets * perPallet[unit]!).toLocaleString('en-US')} ${unit}`
  return (
    <Card
      titleAs="h3"
      title="Orders"
      actions={<UnitMenu label="Unit" value={unit} options={units} onValueChange={setUnit} />}
      summary={{ label: 'Open total', value: format(3940) }}
      footer={<CardLink href="/patterns/overview/#card-orders">Go to Orders</CardLink>}
    >
      <TickBar label="May orders" format={format} segments={[...may]} />
    </Card>
  )
}
