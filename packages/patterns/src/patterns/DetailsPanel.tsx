import { Button } from '@orbex/sonar-components/button'
import { CardLink } from '@orbex/sonar-components/card'
import { Dialog } from '@orbex/sonar-components/dialog'
import { Status } from '@orbex/sonar-components/status'
import { ToastProvider, useToast } from '@orbex/sonar-components/toast'
import type { ReactNode } from 'react'
import { CallIcon, DownloadIcon, ExpandIcon } from '../icons.tsx'
import { AlertMark, Sep, type CalendarKind } from './Calendar.tsx'
import RouteMap, { type RouteState } from './RouteMap.tsx'
import { useHydrated } from './hydrated.ts'
import './panels.css'
import {
  addDays,
  deliveriesOn,
  deliveryTone,
  hash,
  inCurrency,
  inUnit,
  moneyText,
  monthDay,
  paymentsOn,
  paymentTone,
  pick,
  scheduledOrder,
  weekdayOf,
  withUnit,
  type Unit,
} from './data.ts'

/* Everything in a panel comes from the code, so each row has its own details and they never change */
const CARRIERS = ['Ridgeway Freight', 'Northline Haulage', 'Bluefield Logistics', 'Cascade Transport']
const DRIVERS = ['M. Silva', 'J. Okafor', 'L. Brandt', 'A. Moreau', 'T. Nakamura', 'S. Haddad']
const CUSTOMERS = ['Halvard Supply Co.', 'Brightwell Foods', 'Norvik Industrial', 'Eastgate Retail']
const CENTERS = ['Central DC', 'North Hub DC', 'Harbor DC', 'Westfield DC']
const MATERIALS = [
  ['Corrugated box / Double wall', 'CB-4030', 'Box'],
  ['Stretch film 23 µm', 'SF-2300', 'Roll'],
  ['Kraft paper 120 g', 'KP-1200', 'Roll'],
  ['Pallet top sheet', 'TS-1210', 'Unit'],
  ['Strapping band 12 mm', 'SB-1200', 'Roll'],
] as const
const time = (minutes: number) => `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

type Step = { state: 'done' | 'incident' | 'pending'; label: string; when: string }

function Steps({ steps }: { steps: Step[] }) {
  return (
    <ol className="details-steps">
      {steps.map(({ state, label, when }) => (
        <li key={label} data-state={state}>
          <i aria-hidden="true" />
          <span className="card-figure">{label}</span>
          <span className="card-meta">{when}</span>
          <span className="visually-hidden">{state === 'done' ? ', done' : state === 'incident' ? ', incident' : ', to come'}</span>
        </li>
      ))}
    </ol>
  )
}

function Fields({ list }: { list: [string, ReactNode][] }) {
  return (
    <dl className="details-fields">
      {list.map(([term, value]) => (
        <div key={term}>
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** A section that opens and closes; the first one starts open */
function Section({ title, aside, open, children }: { title: string; aside?: ReactNode; open?: boolean; children: ReactNode }) {
  return (
    <details className="details-section" open={open}>
      {/* As in the product: a 51 px band, the name in 14 px capitals with its alert beside it, the chevron at the end,
          and the rule under the section (1.0.0-alpha.17) */}
      <summary>
        <span className="details-section-title">
          <span className="card-heading">{title}</span>
          {aside}
        </span>
        <ExpandIcon className="details-section-chevron" />
      </summary>
      {children}
    </details>
  )
}

/* A panel's parts: the head (code, status and summary line) stays put under the title, as in the product; the body
   scrolls under it (1.0.0-alpha.17) */
type Parts = { head: ReactNode; body: ReactNode } | null

function deliveryParts(id: string, date: Date, unit: Unit): Parts {
  const row = deliveriesOn(date).find((delivery) => delivery.id === id)
  if (!row) return null
  const k = (salt: string) => hash(id + salt)
  const carrier = pick(CARRIERS, id + 'c')
  const driver = pick(DRIVERS, id + 'd')
  /* One number for what is shown, what is read and what is dialed */
  const phone = `+1 555 01${String(hash(id + 'ph') % 100).padStart(2, '0')}`
  const center = pick(CENTERS, id + 'x')
  const plant = `Plant 0${1 + (k('p') % 3)}`
  const material = pick(MATERIALS, id + 'm')
  const out = 120 + (k('t') % 120)
  const day = weekdayOf(date).slice(0, 3)
  const steps: Step[] =
    row.status === 'Canceled'
      ? [
          { state: 'done', label: 'Order confirmed', when: time(out - 90) },
          { state: 'done', label: `Loading scheduled at ${plant}`, when: time(out - 30) },
          { state: 'incident', label: 'Canceled by customer', when: time(out + 15) },
          { state: 'pending', label: 'Destination', when: 'Not delivered' },
        ]
      : row.status === 'Delayed'
        ? [
            { state: 'done', label: 'Departed Port Terminal', when: time(out) },
            { state: 'done', label: 'Customs cleared', when: time(out + 127) },
            { state: 'done', label: 'Route 9 checkpoint', when: time(out + 262) },
            { state: 'done', label: 'Route 12 checkpoint', when: time(out + 392) },
            { state: 'incident', label: 'Truck breakdown reported', when: time(out + 537) },
            { state: 'pending', label: 'Destination', when: 'ETA pending' },
          ]
        : row.status === 'Delivered'
          ? [
              { state: 'done', label: 'Departed Port Terminal', when: time(out) },
              { state: 'done', label: 'Customs cleared', when: time(out + 127) },
              { state: 'done', label: 'Route 9 checkpoint', when: time(out + 262) },
              { state: 'done', label: 'Route 12 checkpoint', when: time(out + 392) },
              { state: 'done', label: `Arrived at ${center}`, when: time(out + 560) },
              { state: 'done', label: 'Delivered and signed', when: time(out + 590) },
            ]
          : [
              { state: 'pending', label: `Loading at ${plant}`, when: `${day} 06:00` },
              { state: 'pending', label: 'Departure from Port Terminal', when: `${day} 08:30` },
              { state: 'pending', label: 'Customs clearance', when: `${day} 10:45` },
              { state: 'pending', label: `Destination: ${center}`, when: `ETA ${day} 16:00` },
            ]
  /* Where the truck is, from the state of the delivery */
  const km = 140 + (k('km') % 160)
  const route: RouteState =
    row.status === 'Canceled'
      ? { state: 'sched', origin: plant, cur: plant, last: '—', dest: center, km, eta: 'Canceled' }
      : row.status === 'Delayed'
        ? { state: 'late', origin: 'Port Terminal', cur: 'Near Route 12', last: 'Route 12', dest: center, km, eta: 'ETA pending' }
        : row.status === 'Delivered'
          ? { state: 'done', origin: 'Port Terminal', cur: center, last: 'Route 12', dest: center, km, eta: `Delivered ${time(out + 590)}` }
          : { state: 'sched', origin: plant, cur: plant, last: '—', dest: center, km, eta: `ETA ${day} 16:00` }
  const amount = withUnit(inUnit(row.pallets, unit), unit)
  const head = (
    <>
      <span className="details-meta">
        <strong>{id}</strong>
        <Status tone={deliveryTone[row.status]} appearance="chip">
          {row.status}
        </Status>
      </span>
      <span className="details-sub">
        <span>{`${row.items} ${row.items === 1 ? 'item' : 'items'}`}</span>
        <Sep />
        <span>{amount}</span>
        <Sep />
        <span>{monthDay(date)}</span>
      </span>
    </>
  )
  const body = (
    <>
      <RouteMap route={route} code={id} />
      {/* The alert mark as the card's row draws it: the same triangle, blinking (still with reduced motion) */}
      <Section title="Itinerary" aside={row.alert ? <AlertMark blink /> : undefined} open>
        <Steps steps={steps} />
      </Section>
      <div className="details-driver">
        <span className="details-initials" aria-hidden="true">
          {driver
            .split(' ')
            .map((word) => word[0])
            .join('')}
        </span>
        <span>
          <span className="card-figure">{driver}</span>
          <span className="card-meta">Driver · {carrier}</span>
        </span>
        <a className="details-call" href={`tel:${phone.replace(/ /g, '')}`} aria-label={`Call ${driver}, ${phone}`}>
          <span aria-hidden="true">{phone}</span>
          <CallIcon />
        </a>
      </div>
      <Section title="Destination info">
        <Fields
          list={[
            ['Customer', pick(CUSTOMERS, id + 'u')],
            ['Origin plant', plant],
            ['Destination plant', center.replace(' DC', ' Plant')],
            ['Destination', center],
          ]}
        />
      </Section>
      <Section title="Material info">
        <Fields
          list={[
            ['Product', material[0]],
            ['Reference', material[1]],
            ['Packaging', material[2]],
            ['Items', row.items],
            ['Quantity', amount],
            ['Lot', `LT-${22000 + (k('l') % 900)}`],
            ['Handling', pick(['Keep dry', 'Fragile', 'Stack max 3', 'Keep cool'], id + 'h')],
            ['Stackable', pick(['Yes', 'No'], id + 's')],
          ]}
        />
      </Section>
      <Section title="Transport info">
        <Fields
          list={[
            ['Tractor plate', `TR-${4000 + (k('a') % 999)}`],
            ['Trailer plate', `PL-${1000 + (k('b') % 999)}`],
            ['Driver', driver],
            ['Carrier', carrier],
            ['Vehicle type', pick(['Truck', 'Van', 'Truck'], id + 'v')],
            ['Departure', `${monthDay(date)} · ${time(out)}`],
            ['Trip', `TRP-${35000 + (k('tr') % 9999)}`],
          ]}
        />
      </Section>
    </>
  )
  return { head, body }
}

function invoiceParts(id: string, date: Date, currency: string): Parts {
  const row = paymentsOn(date).find((payment) => payment.id === id)
  if (!row) return null
  const k = (salt: string) => hash(id + salt)
  const terms = pick([30, 45, 60], id + 't')
  const issued = addDays(date, -terms)
  const subtotal = Math.round((row.amount / 1.08) * 100) / 100
  const tax = Math.round((row.amount - subtotal) * 100) / 100
  const first = Math.round(subtotal * 0.55)
  const second = Math.round(subtotal * 0.3)
  const lines: [string, number, number][] = [
    [pick(MATERIALS, id + 'm1')[0], 20 + (k('q1') % 90), first],
    [pick(MATERIALS, id + 'm2')[0], 10 + (k('q2') % 60), second],
    [pick(MATERIALS, id + 'm3')[0], 5 + (k('q3') % 30), Math.round((subtotal - first - second) * 100) / 100],
  ]
  const cash = (dollars: number) => moneyText(inCurrency(dollars, currency), currency)
  const settled = row.status === 'Paid'
  const steps: Step[] =
    row.status === 'Disputed'
      ? [
          { state: 'done', label: 'Invoice issued', when: monthDay(issued) },
          { state: 'done', label: 'Sent to customer', when: monthDay(addDays(issued, 1)) },
          { state: 'incident', label: 'Disputed by customer', when: monthDay(addDays(date, -2)) },
          { state: 'pending', label: 'Awaiting resolution', when: '—' },
        ]
      : [
          { state: 'done', label: 'Invoice issued', when: monthDay(issued) },
          { state: 'done', label: 'Sent to customer', when: monthDay(addDays(issued, 1)) },
          { state: settled ? 'done' : row.status === 'Scheduled' ? 'pending' : 'incident', label: 'Payment due', when: monthDay(date) },
          { state: settled ? 'done' : 'pending', label: settled ? 'Payment received' : 'Awaiting payment', when: settled ? monthDay(addDays(date, -(1 + (k('p') % 3)))) : '—' },
        ]
  const head = (
    <>
      <span className="details-meta">
        <strong>{id}</strong>
        <Status tone={paymentTone[row.status]} appearance="chip">
          {row.status}
        </Status>
      </span>
      <span className="details-amount">{cash(row.amount)}</span>
      <span className="details-sub">
        <span>{`Due ${weekdayOf(date)}, ${monthDay(date)}`}</span>
        <Sep />
        <span>{`Net ${terms}`}</span>
      </span>
    </>
  )
  const body = (
    <>
      <Section title="Invoice info" open>
        <Fields
          list={[
            ['Customer', pick(CUSTOMERS, id + 'u')],
            ['Invoice date', monthDay(issued)],
            ['Due date', monthDay(date)],
            ['Payment terms', `Net ${terms}`],
            ['PO number', `PO-${51000 + (k('po') % 9000)}`],
            ['Payment method', pick(['Bank transfer', 'ACH', 'Wire transfer'], id + 'pm')],
            ['Currency', currency],
          ]}
        />
      </Section>
      <Section title="Line items">
        <table className="details-lines">
          <thead className="visually-hidden">
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Quantity</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines.map(([product, pallets, amount]) => (
              <tr key={product + pallets}>
                <th scope="row">{product}</th>
                <td className="card-meta">{pallets} plt</td>
                <td>{cash(amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Subtotal</th>
              <td />
              <td>{cash(subtotal)}</td>
            </tr>
            <tr>
              <th scope="row">Tax (8%)</th>
              <td />
              <td>{cash(tax)}</td>
            </tr>
            <tr data-total>
              <th scope="row">Total</th>
              <td />
              <td>{cash(row.amount)}</td>
            </tr>
          </tfoot>
        </table>
      </Section>
      <Section title="Payment history">
        <Steps steps={steps} />
      </Section>
    </>
  )
  return { head, body }
}

/* Scheduled orders → Order details: an order already confirmed that has not left yet, as in the product
   (1.0.0-alpha.18). Everything comes from the code, as for deliveries and invoices. */
function orderParts(id: string, unit: Unit): Parts {
  const order = scheduledOrder(id)
  if (!order) return null
  const { date, pallets } = order
  const k = (salt: string) => hash(id + salt)
  const materials = [pick(MATERIALS, id + 'o1'), pick(MATERIALS, id + 'o2'), pick(MATERIALS, id + 'o3')].filter(
    (material, index, list) => list.findIndex((other) => other[1] === material[1]) === index,
  )
  const count = Math.min(materials.length, 1 + (k('n') % 3))
  const lines = materials.slice(0, count)
  /* The pallets of the lines always add up to the order's */
  const share = lines.map((_, index) => (index === count - 1 ? 0 : Math.round((pallets * [0.55, 0.3][index]!) / 5) * 5))
  share[count - 1] = pallets - share.reduce((sum, value) => sum + value, 0)
  const center = pick(CENTERS, id + 'x')
  const plant = `Plant 0${1 + (k('p') % 3)}`
  const placed = addDays(date, -(6 + (k('l') % 6)))
  const start = 6 + 2 * (k('w') % 3)
  const day = weekdayOf(date).slice(0, 3)
  const amount = (value: number) => withUnit(inUnit(value, unit), unit)
  const head = (
    <>
      <span className="details-meta">
        <strong>{id}</strong>
        <Status tone="neutral" appearance="chip">
          Scheduled
        </Status>
      </span>
      <span className="details-sub">
        <span>{`${count} ${count === 1 ? 'item' : 'items'}`}</span>
        <Sep />
        <span>{amount(pallets)}</span>
        <Sep />
        <span>{`${weekdayOf(date)}, ${monthDay(date)}`}</span>
      </span>
    </>
  )
  const body = (
    <>
      <Section title="Order info" open>
        <Fields
          list={[
            ['Customer', pick(CUSTOMERS, id + 'u')],
            ['PO number', `PO-${51000 + (k('po') % 9000)}`],
            ['Ordered on', monthDay(placed)],
            ['Delivery date', `${weekdayOf(date)}, ${monthDay(date)}`],
            ['Delivery window', `${time(start * 60)} – ${time((start + 4) * 60)}`],
            ['Ship to', center],
          ]}
        />
      </Section>
      <Section title="Items">
        <table className="details-lines">
          <thead className="visually-hidden">
            <tr>
              <th scope="col">Product</th>
              <th scope="col">Reference</th>
              <th scope="col">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {lines.map(([product, reference], index) => (
              <tr key={reference}>
                <th scope="row">{product}</th>
                <td className="card-meta">{reference}</td>
                <td>{amount(share[index]!)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr data-total>
              <th scope="row">Total</th>
              <td />
              <td>{amount(pallets)}</td>
            </tr>
          </tfoot>
        </table>
      </Section>
      <Section title="Schedule">
        <Steps
          steps={[
            { state: 'done', label: 'Order confirmed', when: monthDay(addDays(placed, 1)) },
            { state: 'done', label: `Stock reserved at ${plant}`, when: monthDay(addDays(placed, 2)) },
            { state: 'pending', label: `Loading at ${plant}`, when: `${day} 06:00` },
            { state: 'pending', label: `Delivery to ${center}`, when: `ETA ${day} 16:00` },
          ]}
        />
      </Section>
    </>
  )
  return { head, body }
}

export interface DetailsTarget {
  kind: CalendarKind | 'order'

  id: string
  date: Date
}

/**
 * The side panel a row’s View opens: the details of a delivery, an invoice or a scheduled order, read from its code.
 * The row stays marked while the panel is open.
 */
/* Download PDF says so, as in the product (v38 Details: «….pdf downloaded»), with the system's toast (1.0.0-alpha.21) */
function DownloadPdf({ file }: { file: string }) {
  const toast = useToast()
  return (
    <Button size="small" variant="outlined" iconEnd={<DownloadIcon />} onClick={() => toast({ message: `${file} downloaded` })}>
      Download PDF
    </Button>
  )
}

export default function DetailsPanel({ target, onClose, unit }: { target: DetailsTarget | null; onClose: () => void; unit: string }) {
  const delivery = target?.kind === 'delivery'
  const order = target?.kind === 'order'
  const hydrated = useHydrated()
  if (!hydrated) return null
  const parts = target
    ? delivery
      ? deliveryParts(target.id, target.date, unit as Unit)
      : order
        ? orderParts(target.id, unit as Unit)
        : invoiceParts(target.id, target.date, unit)
    : null
  const link = delivery
    ? ['/patterns/overview/#card-deliveries', 'Go to Deliveries']
    : order
      ? ['/patterns/cards/#optional', 'Go to Scheduled orders']
      : ['/patterns/overview/#card-balance', 'Go to Balance']
  return (
    <Dialog
      className="details-panel"
      description={parts?.head}
      open={!!target}
      onOpenChange={(open) => !open && onClose()}
      placement="end"
      modal={false}
      title={delivery ? 'Delivery details' : order ? 'Order details' : 'Invoice details'}
      actions={
        <div className="details-actions">
          <CardLink href={link[0]} onClick={onClose}>
            {link[1]}
          </CardLink>
          {!delivery && !order && (
            <ToastProvider label="Download notifications">
              <DownloadPdf file={`${target?.id ?? 'invoice'}.pdf`} />
            </ToastProvider>
          )}
        </div>
      }
    >
      {parts?.body}
    </Dialog>
  )
}
