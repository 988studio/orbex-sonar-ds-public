import { CardLink } from '@orbex/sonar-components/card'

/* “Go to” and the name of the page the card summarizes */
export default function Links() {
  return (
    <>
      <CardLink href="/patterns/overview/#card-orders">Go to Orders</CardLink>
      <CardLink href="/patterns/overview/#card-deliveries">Go to Deliveries</CardLink>
      <CardLink href="/patterns/overview/#card-balance">Go to Balance</CardLink>
    </>
  )
}
