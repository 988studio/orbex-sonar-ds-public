/* The overview: cards on a grid of columns, each as tall as its size. The grid tokens follow the window */
import { Card, CardLink } from '@orbex/sonar-components/card'
import '@orbex/sonar-components/card.css'

const columns = [
  [
    { id: 'orders', title: 'Orders', size: 'm', figure: ['Open total', '3,940 plt'] },
    { id: 'inventory', title: 'Inventory', size: 's', figure: ['Total', '2,800 plt'] },
  ],
  [
    { id: 'deliveries', title: 'Deliveries', size: 'l', figure: null },
    { id: 'balance', title: 'Balance', size: 'm', figure: ['Balance', '3,900,000 USD'] },
  ],
  [
    { id: 'shipments', title: 'Daily shipments', size: 'xl', figure: ['Month to date', '4,485 plt'] },
    { id: 'recurring', title: 'Recurring orders', size: 'l', figure: null },
  ],
] as const

export function Overview() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(var(--sonar-layout-columns), minmax(0, 1fr))',
        gap: 'var(--sonar-layout-gap)',
        alignItems: 'start',
      }}
    >
      {columns.map((cards, index) => (
        <div key={index} style={{ display: 'grid', gap: 'var(--sonar-layout-gap)' }}>
          {cards.map(({ id, title, size, figure }) => (
            <Card key={id} id={`card-${id}`} title={title} size={size} summary={figure ? { label: figure[0], value: figure[1] } : undefined} footer={<CardLink href={`/${id}`}>Go to {title}</CardLink>}>
              {/* The card’s content */}
            </Card>
          ))}
        </div>
      ))}
    </div>
  )
}
