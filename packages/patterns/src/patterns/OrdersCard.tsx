import { Button } from '@orbex/sonar-components/button'
import { Card, CardLink, UnitMenu } from '@orbex/sonar-components/card'
import { ChartLegend } from '@orbex/sonar-components/chart-legend'
import { IconButton } from '@orbex/sonar-components/icon-button'
import { TickBar } from '@orbex/sonar-components/tick-bar'
import { useState } from 'react'
import { AddCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '../icons.tsx'
import { NewOrderPanel } from './OrderPanels.tsx'
import { inUnit, openOrders, orderMonths, quantity, units, withUnit, type Unit } from './data.ts'
import { Count } from './motion.ts'
import './cards.css'

const parts = [
  { key: 'shipped', label: 'Shipped', tone: 'accent' },
  { key: 'onHold', label: 'On hold', tone: 'strong' },
  { key: 'pending', label: 'Pending', tone: 'muted' },
] as const

const legend = parts.map(({ label, tone }) => ({ label, tone }))

/* Two months at a time; the overview opens on the current one and the next */
const CURRENT = 0

/**
 * Orders, in S or M. S keeps the two months and their bars, with the pager around the legend. M names the pager’s
 * steps, and adds New order, which opens its side panel, and the link to the Orders page.
 */
export default function OrdersCard({ size = 'm', label }: { size?: 's' | 'm'; label?: string }) {
  const [unit, setUnit] = useState<Unit>('plt')
  const [first, setFirst] = useState(CURRENT)
  const [ordering, setOrdering] = useState(false)
  const figure = (pallets: number, id: string) => <Count value={inUnit(pallets, unit)} id={id} format={(value) => withUnit(value, unit)} />
  const shown = orderMonths.slice(first, first + 2)
  const previous = (
    <IconButton size="small" label="Previous month" icon={<ChevronLeftIcon />} disabled={first === 0} onClick={() => setFirst(first - 1)} />
  )
  const next = (
    <IconButton size="small" label="Next month" icon={<ChevronRightIcon />} disabled={first === orderMonths.length - 2} onClick={() => setFirst(first + 1)} />
  )
  return (
    <Card
      titleAs="h3"
      label={label}
      size={size}
      title="Orders"
      actions={<UnitMenu label="Unit" value={unit} options={units} onValueChange={(value) => setUnit(value as Unit)} />}
      summary={{ label: 'Open total', value: figure(openOrders, 'open') }}
      footer={size === 'm' ? <CardLink href="/patterns/overview/#card-orders">Go to Orders</CardLink> : undefined}
    >
      <div className="orders-months">
        {shown.map((month) => (
          <div key={month.month} className="orders-month" role="group" aria-label={month.month}>
            <h4 className="card-heading">{month.month}</h4>
            <ul role="list">
              {parts.map(({ key, label, tone }) => (
                <li key={key}>
                  <span className="legend-dot" data-tone={tone} aria-hidden="true" />
                  <span className="card-figure" data-tone={tone === 'accent' ? 'accent' : undefined}>
                    {figure(month[key], month.month + key)}
                  </span>
                  <span className="visually-hidden">{label.toLowerCase()}</span>
                </li>
              ))}
            </ul>
            <TickBar label={`${month.month} orders`} format={(value) => quantity(value, unit)} segments={parts.map(({ key, label, tone }) => ({ value: month[key], tone, label }))} />
          </div>
        ))}
      </div>
      {size === 's' ? (
        <div className="card-pager orders-pager">
          {previous}
          <ChartLegend aria-hidden="true" items={legend} />
          {next}
        </div>
      ) : (
        <>
          {/* Both stay black: the one that cannot move says so to assistive technology and does nothing */}
          <div className="card-pager orders-steps">
            <Button size="small" variant="text" icon={<ChevronLeftIcon />} aria-disabled={first === 0 || undefined} onClick={() => first > 0 && setFirst(first - 1)}>
              Previous<span className="visually-hidden"> months</span>
            </Button>
            <Button size="small" variant="text" iconEnd={<ChevronRightIcon />} aria-disabled={first === orderMonths.length - 2 || undefined} onClick={() => first < orderMonths.length - 2 && setFirst(first + 1)}>
              Next<span className="visually-hidden"> months</span>
            </Button>
          </div>
          <ChartLegend className="orders-legend" aria-hidden="true" items={legend} />
          <div className="orders-new">
            <div>
              <h4 className="card-heading">New order</h4>
              <p className="card-meta">Create a new purchase order.</p>
            </div>
            <IconButton className="orders-new-add" label="New order" icon={<AddCircleIcon />} aria-haspopup="dialog" onClick={() => setOrdering(true)} />
          </div>
          <NewOrderPanel open={ordering} onClose={() => setOrdering(false)} unit={unit} />
        </>
      )}
    </Card>
  )
}
