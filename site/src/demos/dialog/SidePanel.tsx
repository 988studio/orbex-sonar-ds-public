import { Button } from '@orbex/sonar-components/button'
import { Dialog } from '@orbex/sonar-components/dialog'
import { Status } from '@orbex/sonar-components/status'
import { useState } from 'react'

const rows = [
  ['Carrier', 'Iberia Freight'],
  ['Window', 'May 12, 08:00–10:00'],
  ['Pallets', '24 plt'],
  ['Dock', 'North · Gate 3'],
]

export default function SidePanel() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="tonal" onClick={() => setOpen(true)}>
        Delivery details
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        placement="end"
        modal={false}
        title="Delivery 04-127C"
        actions={<Button onClick={() => setOpen(false)}>Track delivery</Button>}
      >
        <Status tone="warning" appearance="chip">
          Due today
        </Status>
        <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 24px', margin: 0, font: 'var(--sonar-type-label-md)' }}>
          {rows.map(([term, value]) => (
            <div key={term} style={{ display: 'contents' }}>
              <dt style={{ color: 'var(--sonar-color-text-tertiary)' }}>{term}</dt>
              <dd style={{ margin: 0, color: 'var(--sonar-color-text-strong)' }}>{value}</dd>
            </div>
          ))}
        </dl>
      </Dialog>
    </>
  )
}
