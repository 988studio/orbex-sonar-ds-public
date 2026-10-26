import { Button } from '@orbex/sonar-components/button'
import { Notice } from '@orbex/sonar-components/notice'

export default function Tones() {
  return (
    <>
      <Notice title="Take a look:">
        New recycled-fiber boxes are in the market.
      </Notice>
      <Notice tone="success" title="Order created.">
        PO-2210 was sent for confirmation.
      </Notice>
      <Notice tone="warning" title="Carrier changed." action={<Button size="small" variant="text">Review</Button>}>
        Delivery 04-121A now arrives with Atlas Logistics.
      </Notice>
      <Notice tone="danger" title="2 invoices overdue.">
        Pay them before May 20 to keep your credit line.
      </Notice>
    </>
  )
}
