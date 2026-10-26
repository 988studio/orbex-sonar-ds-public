import { Button } from '@orbex/sonar-components/button'
import { Card, CardLink, UnitMenu } from '@orbex/sonar-components/card'
import { TrendChart } from '@orbex/sonar-components/trend-chart'
import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '../icons.tsx'
import { inUnit, quantity, shipmentMonths, shippedIn, TODAY, units, withUnit, type Unit } from './data.ts'
import { Count } from './motion.ts'
import './cards.css'

const CURRENT = shipmentMonths.length - 1

/**
 * Daily shipments, in L or XL. The summary is the month shown: the month to date for May, the month’s total for a
 * month already closed. L shows the month’s line; XL adds its key figures above it. The pager moves between months;
 * days still to come leave the line open.
 */
export default function ShipmentsCard({ size = 'xl', label }: { size?: 'l' | 'xl'; label?: string }) {
  const [unit, setUnit] = useState<Unit>('plt')
  const [shown, setShown] = useState(CURRENT)
  const month = shipmentMonths[shown]!
  const total = shippedIn(month)
  const closed = shown !== CURRENT
  const last = closed ? month.values.length - 1 : TODAY.getDate() - 1
  const figure = (pallets: number, id: string) => <Count value={inUnit(pallets, unit)} id={id + month.short} format={(value) => withUnit(value, unit)} />
  const stats: [string, ReturnType<typeof figure>][] = [
    [closed ? 'Last day' : 'Today', figure(month.values[last] ?? 0, 'last')],
    [closed ? 'Previous day' : 'Yesterday', figure(month.values[last - 1] ?? 0, 'previous')],
    ['This month', figure(total, 'month')],
    ['Returns', figure(month.returns, 'returns')],
  ]
  const previous = shipmentMonths[shown - 1]
  const next = shipmentMonths[shown + 1]
  return (
    <Card
      titleAs="h3"
      label={label}
      size={size}
      title="Daily shipments"
      actions={<UnitMenu label="Unit" value={unit} options={units} onValueChange={(value) => setUnit(value as Unit)} />}
      summary={{ label: closed ? 'Month total' : 'Month to date', value: figure(total, 'summary') }}
      footer={<CardLink href="/patterns/overview/#card-shipments">Go to Shipments</CardLink>}
    >
      <h4 className="card-heading shipments-month" aria-live="polite">
        {month.month}
      </h4>
      <hr className="card-rule shipments-rule" />
      {size === 'xl' && (
        <>
          <dl className="shipments-stats">
            {stats.map(([term, value]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <hr className="card-rule shipments-rule" />
        </>
      )}
      <TrendChart
        label={`Daily shipments in ${month.month}, ${quantity(total, unit)} in total`}
        categories={month.days}
        series={{ name: `Shipments (${unit})`, values: month.values.map((value) => (value === null ? null : inUnit(value, unit))) }}
        cumulative={{ name: `Cumulative (${unit})` }}
        unit={unit}
        axisLabels={[0, 14, month.days.length - 1]}
        height={size === 'xl' ? 200 : 140}
      />
      <div className="card-pager shipments-pager">
        {/* Named by the month they show, with what they do before it for screen readers: “Previous month: Apr” */}
        <Button size="small" variant="text" icon={<ChevronLeftIcon />} disabled={!previous} onClick={() => setShown(shown - 1)}>
          <span className="visually-hidden">Previous month: </span>
          {previous?.short ?? 'Mar'}
        </Button>
        <Button size="small" variant="text" iconEnd={<ChevronRightIcon />} disabled={!next} onClick={() => setShown(shown + 1)}>
          <span className="visually-hidden">Next month: </span>
          {next?.short ?? 'Jun'}
        </Button>
      </div>
    </Card>
  )
}
