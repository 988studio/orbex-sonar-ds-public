import type { ComponentType } from 'react'
import BalanceCard from './BalanceCard.tsx'
import DeliveriesCard from './DeliveriesCard.tsx'
import InventoryCard from './InventoryCard.tsx'
import OrdersCard from './OrdersCard.tsx'
import RecurringCard from './RecurringCard.tsx'
import ShipmentsCard from './ShipmentsCard.tsx'
import './cards.css'

type Size = 's' | 'm' | 'l' | 'xl'

/** Each card with the sizes it was designed for, smallest first. The overview offers only these. */
export const cardSizes: Record<string, { title: string; card: ComponentType<{ size?: any; label?: string }>; sizes: Size[] }> = {
  orders: { title: 'Orders', card: OrdersCard, sizes: ['s', 'm'] },
  inventory: { title: 'Inventory', card: InventoryCard, sizes: ['s', 'm'] },
  balance: { title: 'Balance', card: BalanceCard, sizes: ['s', 'm', 'l'] },
  shipments: { title: 'Daily shipments', card: ShipmentsCard, sizes: ['l', 'xl'] },
  deliveries: { title: 'Deliveries', card: DeliveriesCard, sizes: ['m', 'l', 'xl'] },
  recurring: { title: 'Recurring orders', card: RecurringCard, sizes: ['m', 'l', 'xl'] },
}

/**
 * One card in every size it offers, side by side where the page is wide enough. Each copy is named with its size,
 * “Orders, size S”, so the regions of the page never share a name.
 */
export default function CardSizes({ card }: { card: keyof typeof cardSizes }) {
  const { title, card: Card, sizes } = cardSizes[card]!
  return (
    <div className="card-sizes">
      {sizes.map((size) => (
        <figure key={size}>
          <figcaption>{size.toUpperCase()}</figcaption>
          <Card size={size} label={`${title}, size ${size.toUpperCase()}`} />
        </figure>
      ))}
    </div>
  )
}
