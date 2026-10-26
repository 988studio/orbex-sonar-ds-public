import { Card, CardLink, UnitMenu } from '@orbex/sonar-components/card'
import { IconButton } from '@orbex/sonar-components/icon-button'
import { TickBar } from '@orbex/sonar-components/tick-bar'
import { useId, useRef, useState, type CSSProperties } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ExpandIcon } from '../icons.tsx'
import Calendar, { Sep, type CalendarView } from './Calendar.tsx'
import DetailsPanel, { type DetailsTarget } from './DetailsPanel.tsx'
import { balance, currencies, dues, inCurrency, money, moneyText, TODAY } from './data.ts'
import { Count } from './motion.ts'
import './cards.css'

const percent = (part: number) => `${((part / balance.total) * 100).toFixed(1)}%`

/**
 * Balance, in S, M or L. S: the overdue share and what falls due today or tomorrow. M and L add the payment
 * calendar, folded under its heading: opened, it shows the invoices of each day and the card grows to fit it. Today
 * and tomorrow come from the same invoices as the calendar, so the figures agree.
 */
export default function BalanceCard({ size = 'm', label }: { size?: 's' | 'm' | 'l'; label?: string }) {
  const [currency, setCurrency] = useState('USD')
  const [index, setIndex] = useState(0)
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState(TODAY)
  const [view, setView] = useState<CalendarView>('week')
  const [details, setDetails] = useState<DetailsTarget | null>(null)
  const calendarId = useId()
  const due = dues[index]!
  /* Today and tomorrow come in from the side of the arrow used */
  const direction = useRef(0)
  const step = (next: number) => {
    direction.current = next > index ? 1 : -1
    setIndex(next)
  }
  const usd = (dollars: number, id: string) => <Count value={inCurrency(dollars, currency)} id={id} format={(value) => moneyText(value, currency)} />
  const small = size === 's'
  const calendar = !small && open
  return (
    <Card
      titleAs="h3"
      label={label}
      size={calendar ? undefined : size}
      title="Balance"
      actions={<UnitMenu label="Currency" value={currency} options={currencies} onValueChange={setCurrency} />}
      summary={{ label: 'Total balance', value: usd(balance.total, 'total'), tone: 'default' }}
      footer={small ? undefined : <CardLink href="/patterns/overview/#card-balance">Go to Balance</CardLink>}
    >
      <div className="balance-block balance-overdue">
        <h4 className="card-heading">Overdue</h4>
        <div className="balance-amount">{usd(balance.overdue, 'overdue')}</div>
        <TickBar
          label="Overdue share of the balance"
          format={(value) => money(value, currency)}
          segments={[
            { value: balance.overdue, tone: 'accent', label: 'Overdue' },
            { value: balance.total - balance.overdue, tone: 'muted', label: 'Not due yet' },
          ]}
        />
        <p className="balance-share">{percent(balance.overdue)}</p>
      </div>
      <hr className="card-rule balance-rule" />
      <div className="balance-block balance-due-block">
        <div className="card-row">
          <h4 className="card-heading balance-due" key={index} data-enter={direction.current ? '' : undefined} style={{ '--dir': direction.current } as CSSProperties} aria-live="polite">
            {index === 0 ? 'Due today' : 'Due tomorrow'}
          </h4>
          <span className="card-steps balance-steps">
            <IconButton size="small" label="Due today" icon={<ChevronLeftIcon />} aria-disabled={index === 0 || undefined} onClick={() => index !== 0 && step(0)} />
            <IconButton size="small" label="Due tomorrow" icon={<ChevronRightIcon />} aria-disabled={index === 1 || undefined} onClick={() => index !== 1 && step(1)} />
          </span>
        </div>
        <div className="balance-amount balance-due-amount" key={index} data-enter={direction.current ? '' : undefined} style={{ '--dir': direction.current, '--i': 1 } as CSSProperties}>
          <span>{usd(due.amount, `due${index}`)}</span>
          <Sep />
          <span className="balance-due-share">{percent(due.amount)}</span>
        </div>
      </div>
      {!small && (
        <>
          <hr className="card-rule balance-rule" />
          <button type="button" className="balance-calendar-toggle" aria-expanded={open} aria-controls={calendarId} onClick={() => setOpen(!open)}>
            Payment calendar
            <ExpandIcon className="balance-calendar-chevron" />
          </button>
          <div id={calendarId} className="balance-calendar" hidden={!open}>
            {open && (
              <Calendar
                kind="payment"
                day={day}
                onDayChange={setDay}
                view={view}
                onViewChange={setView}
                unit={currency}
                openRow={details?.id}
                onDetails={(row, date) => setDetails({ kind: 'payment', id: row.id, date })}
              />
            )}
          </div>
          <DetailsPanel target={details} onClose={() => setDetails(null)} unit={currency} />
        </>
      )}
    </Card>
  )
}
