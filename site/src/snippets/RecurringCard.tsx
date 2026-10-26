/* Recurring orders, size L: the products ordered most often, to choose and reorder in one step */
import { Button } from '@orbex/sonar-components/button'
import { Card, CardLink, CardScroll } from '@orbex/sonar-components/card'
import { Checkbox } from '@orbex/sonar-components/checkbox'
import '@orbex/sonar-components/button.css'
import '@orbex/sonar-components/card.css'
import '@orbex/sonar-components/checkbox.css'
import { useState } from 'react'

const products = [
  { code: 'CB-4030', name: 'Corrugated box / Double wall', stock: 380 },
  { code: 'SF-2300', name: 'Stretch film 23 µm', stock: 560 },
  { code: 'KP-1200', name: 'Kraft paper 120 g', stock: 210 },
  { code: 'EP-5050', name: 'Edge protector 50×50', stock: 940 },
  { code: 'CB-2010', name: 'Corrugated box / Single wall', stock: 640 },
]

export function RecurringCard({ onReorder }: { onReorder: (codes: string[]) => void }) {
  const [chosen, setChosen] = useState(['CB-4030'])
  const toggle = (code: string, on: boolean) => setChosen((current) => (on ? [...current, code] : current.filter((other) => other !== code)))
  return (
    <Card
      title="Recurring orders"
      size="l"
      footer={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <CardLink href="/market">Go to Orbex Market</CardLink>
          <Button disabled={chosen.length === 0} onClick={() => onReorder(chosen)}>
            Reorder
          </Button>
        </div>
      }
    >
      <CardScroll label="Products to reorder">
        <ul role="list" style={{ display: 'grid', gap: 12, padding: 0 }}>
          {products.map(({ code, name, stock }) => (
            <li key={code}>
              <Checkbox
                label={name}
                description={`Packaging ${code} · ${stock.toLocaleString('en-US')} plt in stock`}
                checked={chosen.includes(code)}
                onChange={(event) => toggle(code, event.currentTarget.checked)}
              />
            </li>
          ))}
        </ul>
      </CardScroll>
    </Card>
  )
}
