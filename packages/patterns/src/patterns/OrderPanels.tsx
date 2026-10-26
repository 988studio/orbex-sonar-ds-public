import { Button } from '@orbex/sonar-components/button'
import { Dialog } from '@orbex/sonar-components/dialog'
import { SelectField, TextField } from '@orbex/sonar-components/field'
import { useEffect, useState, type ReactNode } from 'react'
import { useHydrated } from './hydrated.ts'
import './panels.css'
import { AddIcon, ArrowBackIcon, ArrowForwardIcon, BoxIcon, CheckIcon, CloseIcon } from '../icons.tsx'

/* The order panels of the overview: New order (Orders) and Reorder (Recurring orders). Both end the same way:
   a review of the order, then a confirmation that it was sent. Closing one with changes asks first. */

const PRODUCTS = [
  ['Corrugated cartons', 'CB-4030'],
  ['Stretch film 23 µm', 'SF-2300'],
  ['Stretch film 20 µm', 'SF-2000'],
  ['Pallet top sheets', 'TS-1210'],
  ['Strapping band 12 mm', 'SB-1200'],
] as const

/** A roll of film, paper or band, drawn like the box: products are told apart by their shape */
export function RollIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <ellipse cx="9" cy="12" rx="4" ry="7" />
      <ellipse cx="9" cy="12" rx="1.5" ry="2.6" />
      <path d="M9 5h6c2.2 0 4 3.1 4 7s-1.8 7-4 7H9" />
    </svg>
  )
}

/* Film, paper and band come in rolls; the rest in boxes or units */
const Thumb = ({ code }: { code: string }) => <span className="order-thumb">{/^(SF|SB|KP)/.test(code) ? <RollIcon /> : <BoxIcon />}</span>
const MONTHS = ['June', 'July', 'August']

const number = (value: string) => parseFloat(value) || 0
const figure = (value: number) => value.toLocaleString('en-US')
const digits = (value: string) => value.replace(/[^\d.]/g, '')

function Review({ rows, fields }: { rows: { name: string; code: string; quantity: ReactNode }[]; fields: [string, ReactNode][] }) {
  return (
    <>
      <ul className="order-review" role="list">
        {rows.map(({ name, code, quantity }) => (
          <li key={code}>
            <Thumb code={code} />
            <span>
              <span className="card-figure">{name}</span>
              <span className="card-meta">{`Packaging ${code}`}</span>
            </span>
            <span className="order-review-quantity">{quantity}</span>
          </li>
        ))}
      </ul>
      <dl className="order-summary">
        {fields.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </>
  )
}

function Placed({ lead, fields }: { lead: string; fields: [string, ReactNode][] }) {
  return (
    <div className="order-placed">
      <span className="order-placed-mark" aria-hidden="true">
        <CheckIcon />
      </span>
      <p>{lead}</p>
      <dl className="details-fields">
        {fields.map(([term, value]) => (
          <div key={term}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** Asks before closing an order with changes */
function Discard({ open, what, onKeep, onDiscard }: { open: boolean; what: string; onKeep: () => void; onDiscard: () => void }) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && onKeep()}
      title={`Discard this ${what}?`}
      description={what === 'order' ? 'The products and quantities you entered will be lost.' : 'The quantities you changed will be lost.'}
      actions={
        <>
          <Button variant="text" onClick={onKeep}>
            Keep editing
          </Button>
          <Button variant="tonal" onClick={onDiscard}>
            Discard
          </Button>
        </>
      }
    />
  )
}

type Line = { product: string; quantity: string }
const fresh = () => ({ lines: [{ product: PRODUCTS[0][0], quantity: '250' }] as Line[], month: MONTHS[0]!, reference: 'PO-2210' })

/** New order: the form, its review and the confirmation, in a side panel that leaves the overview in view */
export function NewOrderPanel({ open, onClose, unit }: { open: boolean; onClose: () => void; unit: string }) {
  const [step, setStep] = useState<'form' | 'review' | 'placed'>('form')
  const [order, setOrder] = useState(fresh)
  const [asking, setAsking] = useState(false)
  useEffect(() => {
    if (!open) return
    setStep('form')
    setOrder(fresh())
  }, [open])
  const total = order.lines.reduce((sum, line) => sum + number(line.quantity), 0)
  const valid = order.lines.every((line) => number(line.quantity) > 0) && order.reference.trim() !== ''
  const dirty = step === 'review' || (step === 'form' && JSON.stringify(order) !== JSON.stringify(fresh()))
  const close = () => (dirty ? setAsking(true) : onClose())
  const setLine = (index: number, change: Partial<Line>) => setOrder((current) => ({ ...current, lines: current.lines.map((line, other) => (other === index ? { ...line, ...change } : line)) }))
  const code = (name: string) => PRODUCTS.find(([product]) => product === name)?.[1] ?? ''

  const hydrated = useHydrated()
  if (!hydrated) return null
  const titles = { form: 'New order', review: 'Confirm order', placed: 'Order placed' }
  const descriptions = { form: 'Create a new purchase order.', review: 'Review your purchase order before sending it.', placed: undefined }
  return (
    <>
      <Dialog
        className="order-panel"
        open={open}
        onOpenChange={(next) => !next && (step === 'placed' ? onClose() : close())}
        placement="end"
        modal={false}
        dismissible={!dirty}
        title={titles[step]}
        description={descriptions[step]}
        actions={
          step === 'form' ? (
            <div className="order-actions">
              <p className="order-total">
                <span>Total</span>
                <strong>{`${figure(total)} ${unit}`}</strong>
              </p>
              <Button size="small" variant="outlined" className="order-cancel" onClick={close}>
                Cancel
              </Button>
              <Button size="small" className="order-main" disabled={!valid} iconEnd={<ArrowForwardIcon />} onClick={() => setStep('review')}>
                Create order
              </Button>
            </div>
          ) : step === 'review' ? (
            <div className="order-actions">
              <Button size="small" variant="text" className="order-back" icon={<ArrowBackIcon />} onClick={() => setStep('form')}>
                Back
              </Button>
              <Button size="small" variant="outlined" className="order-cancel" onClick={close}>
                Cancel
              </Button>
              <Button size="small" className="order-main" iconEnd={<CheckIcon />} onClick={() => setStep('placed')}>
                Confirm order
              </Button>
            </div>
          ) : (
            <Button variant="tonal" onClick={onClose}>
              Continue
            </Button>
          )
        }
      >
        {step === 'form' && (
          <div className="order-form">
            {order.lines.map((line, index) => (
              <div key={index} className="order-line">
                <SelectField size="small" label={order.lines.length > 1 ? `Product ${index + 1}` : 'Product'} value={line.product} onChange={(event) => setLine(index, { product: event.target.value })}>
                  {PRODUCTS.map(([name]) => (
                    <option key={name}>{name}</option>
                  ))}
                </SelectField>
                <div className="order-quantity-cell">
                  <TextField
                    size="small"
                    label={order.lines.length > 1 ? `Quantity ${index + 1}` : 'Quantity'}
                    suffix={unit}
                    inputMode="decimal"
                    value={line.quantity}
                    onChange={(event) => setLine(index, { quantity: digits(event.target.value) })}
                    error={line.quantity !== '' && number(line.quantity) <= 0 ? 'Enter a quantity above zero.' : undefined}
                  />
                  {/* With two products or more, each can be taken out: a red ring beside its quantity's label */}
                  {order.lines.length > 1 && (
                    <button
                      type="button"
                      className="order-remove"
                      aria-label={`Remove product ${index + 1}`}
                      onClick={() => setOrder((current) => ({ ...current, lines: current.lines.filter((_, other) => other !== index) }))}
                    >
                      <CloseIcon />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="order-add"
              onClick={() => setOrder((current) => ({ ...current, lines: [...current.lines, { product: PRODUCTS[current.lines.length % PRODUCTS.length]![0], quantity: '' }] }))}
            >
              <AddIcon aria-hidden="true" />
              Add product
            </button>
            <div className="order-line order-meta">
              <SelectField size="small" label="Delivery month" value={order.month} onChange={(event) => setOrder((current) => ({ ...current, month: event.target.value }))}>
                {MONTHS.map((month) => (
                  <option key={month}>{month}</option>
                ))}
              </SelectField>
              <TextField
                size="small"
                label="Reference"
                value={order.reference}
                onChange={(event) => setOrder((current) => ({ ...current, reference: event.target.value }))}
                error={order.reference.trim() ? undefined : 'Enter a reference.'}
              />
            </div>
          </div>
        )}
        {step === 'review' && (
          <Review
            rows={order.lines.map((line) => ({ name: line.product, code: code(line.product), quantity: <strong>{`${figure(number(line.quantity))} ${unit}`}</strong> }))}
            fields={[
              ['Delivery month', order.month],
              ['Total quantity', `${figure(total)} ${unit}`],
              ['Deliver to', 'Central DC'],
              ['Reference', order.reference],
            ]}
          />
        )}
        {step === 'placed' && (
          <Placed
            lead={`Your purchase order ${order.reference} was sent for confirmation.`}
            fields={[
              ['Order', order.reference],
              ['Products', `${order.lines.length} · ${figure(total)} ${unit}`],
              ['Delivery', order.month],
            ]}
          />
        )}
      </Dialog>
      <Discard
        open={asking}
        what="order"
        onKeep={() => setAsking(false)}
        onDiscard={() => {
          setAsking(false)
          onClose()
        }}
      />
    </>
  )
}

/* The quantities used last time */
const LAST: Record<string, number> = { 'CB-4030': 120, 'SF-2300': 60, 'SF-2000': 60, 'KP-1200': 60, 'CB-2010': 80, 'SF-1700': 40, 'TS-1210': 30, 'SB-1200': 25, 'EP-5050': 50 }
const REFERENCE = 'RO-3102'

/** Reorder: the products chosen in the card arrive ready, so it starts at the review, with last time’s quantities */
export function ReorderPanel({ items, onClose, unit }: { items: { name: string; code: string }[] | null; onClose: () => void; unit: string }) {
  const [step, setStep] = useState<'review' | 'placed'>('review')
  const [quantities, setQuantities] = useState<Record<string, string>>({})
  const [asking, setAsking] = useState(false)
  const list = items ?? []
  const last = (code: string) => String(LAST[code] ?? 50)
  useEffect(() => {
    if (!items) return
    setStep('review')
    setQuantities(Object.fromEntries(items.map(({ code }) => [code, last(code)])))
  }, [items])
  const total = list.reduce((sum, { code }) => sum + number(quantities[code] ?? ''), 0)
  const valid = list.length > 0 && list.every(({ code }) => number(quantities[code] ?? '') > 0)
  const dirty = step === 'review' && list.some(({ code }) => (quantities[code] ?? '') !== last(code))
  const close = () => (dirty ? setAsking(true) : onClose())
  const hydrated = useHydrated()
  if (!hydrated) return null
  return (
    <>
      <Dialog
        className="order-panel"
        open={!!items}
        onOpenChange={(next) => !next && close()}
        placement="end"
        modal={false}
        dismissible={!dirty}
        title={step === 'review' ? 'Confirm reorder' : 'Reorder placed'}
        description={step === 'review' ? 'Review your recurring order. Quantities are the ones you used last time.' : undefined}
        actions={
          step === 'review' ? (
            <div className="order-actions">
              <Button size="small" variant="outlined" className="order-cancel" onClick={close}>
                Cancel
              </Button>
              <Button size="small" className="order-main" disabled={!valid} iconEnd={<CheckIcon />} onClick={() => setStep('placed')}>
                Confirm reorder
              </Button>
            </div>
          ) : (
            <Button variant="tonal" onClick={onClose}>
              Continue
            </Button>
          )
        }
      >
        {step === 'review' ? (
          <Review
            rows={list.map(({ name, code }) => ({
              name,
              code,
              quantity: (
                <TextField
                  className="order-quantity"
                  size="small"
                  label={`Quantity of ${name}`}
                  suffix={unit}
                  inputMode="decimal"
                  value={quantities[code] ?? ''}
                  onChange={(event) => setQuantities((current) => ({ ...current, [code]: digits(event.target.value) }))}
                />
              ),
            }))}
            fields={[
              ['Delivery date', 'May 18'],
              ['Total quantity', `${figure(total)} ${unit}`],
              ['Deliver to', 'Main warehouse'],
              ['Reference', REFERENCE],
            ]}
          />
        ) : (
          <Placed
            lead={`Your recurring order ${REFERENCE} was sent for confirmation.`}
            fields={[
              ['Order', REFERENCE],
              ['Products', `${list.length} · ${figure(total)} ${unit}`],
              ['Delivery date', 'May 18'],
            ]}
          />
        )}
      </Dialog>
      <Discard
        open={asking}
        what="reorder"
        onKeep={() => setAsking(false)}
        onDiscard={() => {
          setAsking(false)
          onClose()
        }}
      />
    </>
  )
}
