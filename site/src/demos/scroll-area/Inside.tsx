import { ScrollArea } from '@orbex/sonar-components/scroll-area'

const updates = ['2.03 · Route progress on the delivery map', '2.02 · Recurring orders from favorites', '2.01 · Switches for the modules', '2.00 · Dark mode', '1.12 · Invoices from the overview', '1.11 · Help on delivery alerts', '1.10 · Invoices in bulk', '1.09 · Driver contact on delivery notes', '1.08 · Last quantities per product']

/* No padding beside the area: the indicator takes a lane of its own at the end, which the rows never reach */
export default function Inside() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 220, width: 'min(100%, 360px)', borderRadius: 'var(--sonar-shape-corner-medium)', background: 'var(--sonar-color-surface-card)', boxShadow: 'var(--sonar-elevation-1)' }}>
      <ScrollArea label="System updates" indicator="inside">
        <ul role="list" style={{ margin: 0, padding: '4px 16px' }}>
          {updates.map((update) => (
            <li key={update} style={{ padding: '12px 0', borderBottom: '1px solid var(--sonar-color-divider)', font: '400 12px/16px var(--sonar-font-family-sans)', color: 'var(--sonar-color-text-strong)' }}>
              {update}
            </li>
          ))}
        </ul>
      </ScrollArea>
    </div>
  )
}
