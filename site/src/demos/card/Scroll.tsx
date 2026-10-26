import { Card, CardLink, CardScroll } from '@orbex/sonar-components/card'
import { Status } from '@orbex/sonar-components/status'

const deliveries = [
  { id: '04-118B', items: 2, pallets: 40, status: 'Delivered', tone: 'positive' },
  { id: '04-121A', items: 7, pallets: 150, status: 'Delayed', tone: 'warning' },
  { id: '04-127C', items: 1, pallets: 15, status: 'Delayed', tone: 'warning' },
  { id: '04-130A', items: 8, pallets: 210, status: 'Delivered', tone: 'positive' },
] as const

/* Size S leaves no room for the whole day: the list scrolls between the heading and the footer, which stay put */
export default function Scroll() {
  return (
    <Card titleAs="h3" title="Deliveries" size="s" footer={<CardLink href="/patterns/overview/#card-deliveries">Go to Deliveries</CardLink>}>
      <p style={{ margin: '0 0 8px', font: 'var(--sonar-type-label-md)' }}>Tuesday, May 12</p>
      <CardScroll label="Deliveries of May 12">
        <ul role="list" style={{ padding: 0 }}>
          {deliveries.map(({ id, items, pallets, status, tone }) => (
            <li key={id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--sonar-color-divider)' }}>
              <span>
                {`${id} ${items} ${items === 1 ? 'item' : 'items'} · ${pallets} plt`}
              </span>
              <Status tone={tone}>{status}</Status>
            </li>
          ))}
        </ul>
      </CardScroll>
    </Card>
  )
}
