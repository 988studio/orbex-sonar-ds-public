import { Card, CardLink } from '@orbex/sonar-components/card'
import { ScrollArea } from '@orbex/sonar-components/scroll-area'
import { ToastProvider, useToast } from '@orbex/sonar-components/toast'
import '@orbex/sonar-components/scroll-area.css'
import { useId, useState, type ReactNode } from 'react'
import { CheckIcon, DownloadIcon, ExpandIcon, LightbulbIcon, OpenInNewIcon, PriorityIcon, ShippingIcon } from '../icons.tsx'
import { scheduledOrders, TODAY, weekdayOf, monthDay } from './data.ts'
import DetailsPanel, { type DetailsTarget } from './DetailsPanel.tsx'
import './optional-cards.css'

/*
 * The modules New element adds to the overview: Invoices, Credit notes, Notifications, Latest documents and Scheduled
 * orders. They come in one size, L, and are drawn here as the overview shows them when they arrive, with the
 * product's sample data. As in the product, the list scrolls between the header and the footer (fading at the edge
 * that has more) and the groups of Latest documents and Scheduled orders open and close (1.0.0-alpha.17).
 */

/* The list scrolls between the header and the footer: no scrollbar of the system (on a phone it was drawn over the
   download buttons, white in dark mode), a fade at the edge that has more and the product's thin indicator in the
   card's padding, never over a row (1.0.0-alpha.18) */
const Scroller = ({ label, className, children }: { label: string; className?: string; children: ReactNode }) => (
  <ScrollArea label={label} className={'module-scroll' + (className ? ' ' + className : '')}>
    {children}
  </ScrollArea>
)

const INVOICES = [
  ['Tuesday, May 12', 'INV-0025698', '04-118B'],
  ['Monday, May 11', 'INV-0025677', '04-121A'],
  ['Monday, May 11', 'INV-0025671', '04-130A'],
  ['Friday, May 8', 'INV-0025664', '04-112B'],
  ['Thursday, May 7', 'INV-0025642', '04-109C'],
  ['Wednesday, May 6', 'INV-0025631', '04-104A'],
  ['Monday, May 4', 'INV-0025615', '04-101B'],
  ['Friday, May 1', 'INV-0025602', '04-097A'],
].map(([date, number, order]) => [date!, number!, order!, 'Northwind Ltd'] as const)

const CREDITS = [
  ['Wednesday, May 13', 'CN-0004518', '04-118B', 'Damaged pallets'],
  ['Tuesday, May 12', 'CN-0004502', '04-127C', 'Late delivery'],
  ['Friday, May 8', 'CN-0004487', '04-112B', 'Price adjustment'],
  ['Thursday, May 7', 'CN-0004463', '04-104A', 'Returned items'],
  ['Tuesday, May 5', 'CN-0004441', '04-101B', 'Damaged pallets'],
  ['Friday, May 1', 'CN-0004428', '04-097A', 'Price adjustment'],
  ['Wednesday, April 29', 'CN-0004410', '04-090C', 'Returned items'],
  ['Friday, April 24', 'CN-0004397', '04-086A', 'Late delivery'],
] as const

const NOTICES = [
  ['ok', 'Tuesday, May 12', '17:23', 'Delivery 04-121A has arrived at its destination.'],
  ['alert', 'Tuesday, May 12', '12:05', '04-127C'],
  ['info', 'Monday, May 11', '07:00', 'Delivery 04-118B has left its origin.'],
  ['info', 'Monday, May 11', '07:00', 'Delivery 04-130A has left its origin.'],
  ['ok', 'Friday, May 8', '16:48', 'Delivery 04-109D has arrived at its destination.'],
  ['info', 'Friday, May 8', '08:15', 'Delivery 04-112B has left its origin.'],
  ['info', 'Friday, May 8', '16:40', 'Delivery 04-112B has arrived at its destination.'],
  ['info', 'Friday, May 8', '06:55', 'Delivery 04-112B has left its origin.'],
  ['info', 'Thursday, May 7', '15:10', 'Delivery 04-109C has arrived at its destination.'],
] as const

const FILES = ['Invoice', 'Delivery note', 'ISO certificate', 'Packing list', 'CMR waybill', 'Quality report', 'Pallet label', 'Customs form']
const DOCUMENTS = [
  ['04-118B', 'Tuesday, May 12', 4],
  ['04-121A', 'Monday, May 11', 3],
  ['04-130A', 'Friday, May 8', 8],
  ['04-112B', 'Friday, May 8', 5],
  ['04-109C', 'Thursday, May 7', 3],
  ['04-104A', 'Wednesday, May 6', 6],
] as const


const plt = (value: number) => `${value.toLocaleString('en-US')} plt`

function Module({ title, link, actions, children }: { title: string; link: string; actions?: ReactNode; children: ReactNode }) {
  return (
    <Card titleAs="h3" title={title} size="l" actions={actions} className="module-card" footer={<CardLink href="/patterns/editing/#desktop">{link}</CardLink>}>
      {children}
    </Card>
  )
}

/* A download says so, as in the product (v38: «INV-0025698.pdf downloaded»): the system's toast (1.0.0-alpha.21) */
function Download({ className, label, file }: { className: string; label: string; file: string }) {
  const toast = useToast()
  return (
    <button type="button" className={className} aria-label={label} onClick={() => toast({ message: `${file} downloaded` })}>
      <DownloadIcon />
    </button>
  )
}

function DocumentList({ title, link, rows }: { title: string; link: string; rows: readonly (readonly [string, string, string, string])[] }) {
  return (
    <ToastProvider label={`${title} notifications`}>
    <Module title={title} link={link}>
      <Scroller label={title}>
        {rows.map(([date, number, order, extra]) => (
          <div key={number} className="module-doc">
            <div>
              <div className="module-meta">{date}</div>
              <div className="module-name">{number}</div>
              <div className="module-meta">{`Order ${order} | ${extra}`}</div>
            </div>
            <Download className="module-download" label={`Download ${number}`} file={`${number}.pdf`} />
          </div>
        ))}
      </Scroller>
    </Module>
    </ToastProvider>
  )
}

export const Invoices = () => <DocumentList title="Invoices" link="Go to Invoices" rows={INVOICES} />
export const Credits = () => <DocumentList title="Credit notes" link="Go to Credit notes" rows={CREDITS} />

export function Notifications() {
  /* As in the product, the delayed delivery's code opens its details in the side panel, and a press anywhere else on
     the delay unfolds its help, «What to do in this case?», with its four ways out (1.0.0-alpha.22, from v38) */
  const [details, setDetails] = useState<DetailsTarget | null>(null)
  const [help, setHelp] = useState(false)
  const helpId = useId()
  return (
    <>
    <Module
      title="Notifications"
      link="Go to Notifications"
      actions={
        <span className="module-new">
          <i aria-hidden="true" />
          2 new
        </span>
      }
    >
      <Scroller label="Notifications" className="module-notices">
        {NOTICES.map(([tone, day, time, message], index) => (
          <div key={index} className="module-notice" data-tone={tone} data-open={(tone === 'alert' && help) || undefined}>
            {tone === 'alert' && (
              <button
                type="button"
                className="module-notice-toggle"
                aria-expanded={help}
                aria-controls={helpId}
                aria-label={`Delivery ${message} has been delayed. What to do in this case?`}
                onClick={() => setHelp((open) => !open)}
              />
            )}
            <span className="module-notice-icon">{tone === 'ok' ? <CheckIcon /> : tone === 'alert' ? <PriorityIcon /> : <ShippingIcon />}</span>
            <div>
              <div className="module-notice-time">
                <span>{day}</span>
                <span>{time}</span>
              </div>
              {tone === 'alert' ? (
                <div className="module-notice-text">
                  <span>{'Delivery '}</span>
                  <a
                    href="#"
                    aria-label={`Open delivery ${message} details`}
                    aria-haspopup="dialog"
                    data-panel=""
                    onClick={(event) => {
                      event.preventDefault()
                      setDetails({ kind: 'delivery', id: message, date: TODAY })
                    }}
                  >
                    {message}
                  </a>
                  <span>{' has been delayed.'}</span>
                </div>
              ) : (
                <div className="module-notice-text">{message}</div>
              )}
            </div>
            {tone === 'alert' && (
              <div className="module-help-wrap" id={helpId} inert={!help || undefined}>
                <div className="module-help-clip">
                  <div className="module-help">
                    <span className="module-notice-icon module-help-icon">
                      <LightbulbIcon />
                    </span>
                    <div>
                      <div className="module-help-question">What to do in this case?</div>
                      <div className="module-help-links">
                        <a href="#" onClick={(event) => event.preventDefault()}>FAQs</a>
                        <a href="#" onClick={(event) => event.preventDefault()}>Support</a>
                        <a href="#" onClick={(event) => event.preventDefault()}>Contact</a>
                        <a href="#" onClick={(event) => event.preventDefault()}>Call the driver</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </Scroller>
    </Module>
    <DetailsPanel target={details} onClose={() => setDetails(null)} unit="plt" />
    </>
  )
}

function Group({ count, unit, title, sub, open: first, children }: { count: number; unit: string; title: string; sub: string; open?: boolean; children: ReactNode }) {
  /* Each group opens and closes on its own, several can be open, as in the product */
  const [open, setOpen] = useState(!!first)
  const id = useId()
  /* The product's height animation (1.0.0-alpha.18): the files unfold on the spatial spring in 300 ms and fold back
     faster, in 240 ms, without bounce, and the chevron turns with them (optional-cards.css). The list stays in the
     page while it folds, then leaves the tab order. With reduced motion it opens and closes at once. */
  return (
    <div className="module-group" data-open={open || undefined}>
      <button type="button" className="module-group-head" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <span className="module-count">
          <b>{String(count)}</b>
          <i>{unit}</i>
        </span>
        <span>
          <span className="module-name">{title}</span>
          <span className="module-meta">{sub}</span>
        </span>
        <ExpandIcon className="module-chevron" />
      </button>
      <div className="module-files-wrap" id={id} inert={!open || undefined}>
        <div className="module-files">{children}</div>
      </div>
    </div>
  )
}

export function Documents() {
  return (
    <ToastProvider label="Latest documents notifications">
    <Module title="Latest documents" link="Go to Documents">
      <Scroller label="Latest documents">
        {DOCUMENTS.map(([order, date, count], group) => (
          <Group key={order} count={count} unit="DOCS" title={`Order ${order}`} sub={date} open={order === '04-121A'}>
            {FILES.slice(0, count).map((file, index) => (
              <div key={file} className="module-file" data-scroll-row="">
                <span>
                  <span>{`${file} | `}</span>
                  <span className="module-faint">{`${String(1 + group * 10 + index).padStart(9, '0')}.pdf`}</span>
                </span>
                <Download className="module-file-action" label={`Download ${file}, order ${order}`} file={`${String(1 + group * 10 + index).padStart(9, '0')}.pdf`} />
              </div>
            ))}
          </Group>
        ))}
      </Scroller>
    </Module>
    </ToastProvider>
  )
}

export function Scheduled() {
  /* «Open order» opens Order details in the side panel, as in the product; the row stays marked while it is open */
  const [details, setDetails] = useState<DetailsTarget | null>(null)
  return (
    <>
      <Module title="Scheduled orders" link="Go to Scheduled orders">
        <Scroller label="Scheduled orders">
          {scheduledOrders.map(([date, rows]) => {
            const day = `${weekdayOf(date)}, ${monthDay(date)}`
            return (
              <Group key={day} count={rows.length} unit="ORDERS" title={day} sub={`Total ${plt(rows.reduce((sum, [, quantity]) => sum + quantity, 0))}`} open={day === 'Thursday, May 14'}>
                {rows.map(([code, quantity]) => (
                  <div key={code} className="module-file" data-scroll-row="" data-current={details?.id === code || undefined}>
                    <span>
                      <span>{`Order ${code} | `}</span>
                      <span className="module-faint">{plt(quantity)}</span>
                    </span>
                    <button
                      type="button"
                      className="module-file-action"
                      aria-label={`Open order ${code}`}
                      aria-haspopup="dialog"
                      data-panel=""
                      onClick={() => setDetails({ kind: 'order', id: code, date })}
                    >
                      <OpenInNewIcon />
                    </button>
                  </div>
                ))}
              </Group>
            )
          })}
        </Scroller>
      </Module>
      <DetailsPanel target={details} onClose={() => setDetails(null)} unit="plt" />
    </>
  )
}
