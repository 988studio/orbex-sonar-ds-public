/* Deliveries, size L: the deliveries of the chosen day, in a list that scrolls first when the card runs out of room */
import { Button } from '@orbex/sonar-components/button'
import { Card, CardLink, CardScroll, UnitMenu } from '@orbex/sonar-components/card'
import { Status } from '@orbex/sonar-components/status'
import '@orbex/sonar-components/button.css'
import '@orbex/sonar-components/card.css'
import '@orbex/sonar-components/menu.css'
import '@orbex/sonar-components/status.css'
import { useState } from 'react'

const units = [
  { value: 'plt', short: 'plt', name: 'Pallets' },
  { value: 'kg', short: 'kg', name: 'Kilograms' },
]
const perPallet: Record<string, number> = { plt: 1, kg: 420 }

const deliveries = [
  { id: '04-118B', items: 2, pallets: 40, status: 'Delivered', tone: 'positive' },
  { id: '04-121A', items: 7, pallets: 150, status: 'Delayed', tone: 'warning' },
  { id: '04-127C', items: 1, pallets: 15, status: 'Delayed', tone: 'warning' },
  { id: '04-130A', items: 8, pallets: 210, status: 'Delivered', tone: 'positive' },
] as const

export function DeliveriesCard({ onView }: { onView: (id: string) => void }) {
  const [unit, setUnit] = useState('plt')
  const format = (pallets: number) => `${(pallets * perPallet[unit]!).toLocaleString('en-US')} ${unit}`
  return (
    <Card
      title="Deliveries"
      size="l"
      actions={<UnitMenu label="Unit" value={unit} options={units} onValueChange={setUnit} />}
      footer={<CardLink href="/deliveries">Go to Deliveries</CardLink>}
    >
      <h3 style={{ margin: '0 0 8px', font: 'var(--sonar-type-label-md)' }}>Tuesday, May 12</h3>
      <CardScroll label="Deliveries of May 12">
        <ul role="list" style={{ padding: 0 }}>
          {deliveries.map(({ id, items, pallets, status, tone }) => (
            <li key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--sonar-color-divider)' }}>
              <span style={{ flex: 1 }}>
                {id} · {items} {items === 1 ? 'item' : 'items'} · {format(pallets)}
              </span>
              <Status tone={tone}>{status}</Status>
              <Button size="small" variant="text" aria-label={`View delivery ${id}`} onClick={() => onView(id)}>
                View
              </Button>
            </li>
          ))}
        </ul>
      </CardScroll>
    </Card>
  )
}
