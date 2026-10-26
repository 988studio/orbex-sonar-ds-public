import { Button } from '@orbex/sonar-components/button'
import { useState } from 'react'
import DetailsPanel, { type DetailsTarget } from './DetailsPanel.tsx'
import { NewOrderPanel, ReorderPanel } from './OrderPanels.tsx'
import SystemPanel, { useSystemNotices } from './SystemPanel.tsx'
import { scheduledOrders, TODAY } from './data.ts'

/*
 * Patterns › Panels: one button that opens one of the overview's panels, the same component the cards and the app
 * shell open, with the same data. The button is the panel's opener (data-panel), so pressing it again closes it.
 */
export type PanelName = 'new-order' | 'reorder' | 'invoice' | 'order' | 'delivery' | 'system'

const LABELS: Record<PanelName, string> = {
  'new-order': 'New order',
  reorder: 'Reorder',
  invoice: 'Invoice details',
  order: 'Order details',
  delivery: 'Delivery details',
  system: 'System notifications',
}

/* Two favorites chosen in Recurring orders, as the card hands them over */
const REORDER = [
  { name: 'Stretch film 23 µm / SF-2300', code: 'SF-2300' },
  { name: 'Kraft paper 120 g / KP-1200', code: 'KP-1200' },
]
const [firstDay, firstRows] = scheduledOrders[0]!
const TARGETS: Partial<Record<PanelName, DetailsTarget>> = {
  invoice: { kind: 'payment', id: 'INV-7712', date: TODAY },
  order: { kind: 'order', id: firstRows[0]![0], date: firstDay },
  delivery: { kind: 'delivery', id: '04-127C', date: TODAY },
}

export default function PanelDemo({ panel }: { panel: PanelName }) {
  const [open, setOpen] = useState(false)
  const [notices, setNotices] = useSystemNotices()
  const close = () => setOpen(false)
  const target = TARGETS[panel]
  return (
    <div className="panel-demo">
      <Button variant="filled" size="small" data-panel="" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((on) => !on)}>
        {`Open ${LABELS[panel]}`}
      </Button>
      {panel === 'new-order' && <NewOrderPanel open={open} onClose={close} unit="plt" />}
      {panel === 'reorder' && <ReorderPanel items={open ? REORDER : null} onClose={close} unit="plt" />}
      {target && <DetailsPanel target={open ? target : null} onClose={close} unit={panel === 'invoice' ? 'USD' : 'plt'} />}
      {panel === 'system' && <SystemPanel open={open} onClose={close} notices={notices} setNotices={setNotices} />}
    </div>
  )
}
