/* Inventory, size S: the total, and on hold against available as a ring */
import { Card, UnitMenu } from '@orbex/sonar-components/card'
import { RingChart } from '@orbex/sonar-components/ring-chart'
import '@orbex/sonar-components/card.css'
import '@orbex/sonar-components/menu.css'
import '@orbex/sonar-components/ring-chart.css'
import { useState } from 'react'

const units = [
  { value: 'plt', short: 'plt', name: 'Pallets' },
  { value: 'kg', short: 'kg', name: 'Kilograms' },
]
const perPallet: Record<string, number> = { plt: 1, kg: 420 }
const stock = { available: 1960, onHold: 840 }

export function InventoryCard() {
  const [unit, setUnit] = useState('plt')
  const format = (pallets: number) => `${(pallets * perPallet[unit]!).toLocaleString('en-US')} ${unit}`
  const parts = [
    { label: 'On hold', tone: 'danger', value: stock.onHold },
    { label: 'Available', tone: 'muted', value: stock.available },
  ] as const
  return (
    <Card
      title="Inventory"
      size="s"
      actions={<UnitMenu label="Unit" value={unit} options={units} onValueChange={setUnit} />}
      summary={{ label: 'Total', value: format(stock.available + stock.onHold) }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 12 }}>
        <p>{format(stock.onHold)}<br />On hold</p>
        <RingChart label="Inventory" direction="counterclockwise" format={format} segments={[...parts]} style={{ width: 96 }} />
        <p style={{ textAlign: 'end' }}>{format(stock.available)}<br />Available</p>
      </div>
    </Card>
  )
}
