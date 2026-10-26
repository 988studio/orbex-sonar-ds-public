import { SearchField, SearchResult } from '@orbex/sonar-components/search'
import { Status } from '@orbex/sonar-components/status'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AddCircleIcon, BankIcon, InventoryIcon, NorthEastIcon, ReceiptIcon, ShippingIcon, SparkleIcon, TuneIcon } from '../icons.tsx'
import { Sep } from './Calendar.tsx'
import DetailsPanel, { type DetailsTarget } from './DetailsPanel.tsx'
import { NewOrderPanel } from './OrderPanels.tsx'
import { addDays, deliveriesOn, deliveryTone, money, monthDay, paymentsOn, paymentTone, sameDay, TODAY, weekdayOf, type Tone } from './data.ts'

/*
 * Smart search, as in the top bar of the product: people type in plain words (“delayed deliveries this week”,
 * “overdue invoices”, “INV-77”) and the search reads a kind, a state, a date or a month and a code out of the text.
 * Results are the deliveries and invoices that match, nearest to today first, then the actions whose name matches.
 */

type Kind = 'delivery' | 'payment'
type State = 'attention' | 'done' | 'upcoming'

export type Item =
  | { type: 'suggestion'; text: string }
  | { type: Kind; id: string; date: Date; status: string; tone: Tone; state: State | null; text: string }
  | { type: 'action'; label: string; detail: string; icon: ReactNode; words: string; to?: string }

/* Every delivery and invoice from April 25 to June 10, once */
const INDEX = (() => {
  const out: Extract<Item, { type: Kind }>[] = []
  for (let date = new Date(2026, 3, 25); date <= new Date(2026, 5, 10); date = addDays(date, 1)) {
    for (const { id, items, pallets, status } of deliveriesOn(date)) {
      const state = status === 'Delayed' ? 'attention' : status === 'Delivered' ? 'done' : status === 'Scheduled' ? 'upcoming' : null
      out.push({ type: 'delivery', id, date, status, tone: deliveryTone[status], state, text: `${id} ${items} ${items === 1 ? 'item' : 'items'} · ${pallets} plt` })
    }
    for (const { id, amount, status } of paymentsOn(date)) {
      const state = status === 'Overdue' || status === 'Due today' ? 'attention' : status === 'Paid' ? 'done' : status === 'Scheduled' ? 'upcoming' : null
      out.push({ type: 'payment', id, date, status, tone: paymentTone[status], state, text: `${id} · ${money(amount, 'USD')}` })
    }
  }
  return out
})()

const ACTIONS: Extract<Item, { type: 'action' }>[] = [
  { type: 'action', label: 'New order', detail: 'Action · Orders', icon: <AddCircleIcon />, words: 'new order create purchase add buy' },
  /* In this documentation, a page of the product is its card on the Overview page; customizing is Editing the overview */
  { type: 'action', label: 'Release stock', detail: 'Action · Inventory', icon: <InventoryIcon />, words: 'release stock inventory warehouse', to: 'overview/#card-inventory' },
  { type: 'action', label: 'Customize overview', detail: 'Action · Overview', icon: <TuneIcon />, words: 'customize overview layout widgets cards personalize', to: 'editing/' },
  { type: 'action', label: 'Deliveries', detail: 'Page', icon: <ShippingIcon />, words: 'deliveries delivery shipments shipping', to: 'overview/#card-deliveries' },
  { type: 'action', label: 'Balance', detail: 'Page', icon: <BankIcon />, words: 'balance payments invoices billing finance', to: 'overview/#card-balance' },
  { type: 'action', label: 'Orders', detail: 'Page', icon: <ReceiptIcon />, words: 'orders order history', to: 'overview/#card-orders' },
]

export const SUGGESTIONS: Item[] = ['Delayed deliveries this week', 'Overdue invoices', 'Deliveries tomorrow', 'Paid invoices in April', 'New order'].map((text) => ({ type: 'suggestion', text }))

const MONTHS: Record<string, number> = { march: 2, mar: 2, april: 3, apr: 3, may: 4, june: 5, jun: 5 }
const STOP = new Set(
  'show me the all my any of in on for to a an and with that are is were was which what when where this last next week today tomorrow yesterday late delayed delay overdue unpaid paid pending invoices invoice payments payment deliveries delivery shipments upcoming scheduled find get list'.split(' '),
)
const has = (text: string, ...words: string[]) => words.some((word) => new RegExp(`\\b${word}`).test(text))

interface Reading {
  kind: Kind | null
  state: State | null
  /** “Overdue” means past its date: an invoice due today is not overdue yet */
  pastDue: boolean
  days: [Date, Date] | null
  month: number | null
  free: string[]
}

/** What the text asks for: a kind, a state, a date or a month, and any code */
function read(raw: string): Reading {
  const text = raw.toLowerCase().trim()
  const reading: Reading = { kind: null, state: null, pastDue: has(text, 'overdue'), days: null, month: null, free: [] }
  if (has(text, 'deliver', 'shipment', 'shipping', 'pallet', 'plt', 'truck')) reading.kind = 'delivery'
  if (has(text, 'invoice', 'inv\\b', 'payment', 'bill', 'usd', 'owe')) reading.kind = 'payment'
  if (has(text, 'late', 'delay', 'problem', 'issue', 'stuck', 'overdue', 'unpaid', 'pending', 'due', 'attention', 'wrong')) reading.state = 'attention'
  else if (has(text, 'paid', 'settled', 'done', 'delivered', 'completed', 'ok\\b')) reading.state = 'done'
  else if (has(text, 'upcoming', 'scheduled', 'next', 'future', 'soon', 'coming')) reading.state = 'upcoming'
  if (has(text, 'today')) reading.days = [TODAY, TODAY]
  else if (has(text, 'tomorrow')) reading.days = [addDays(TODAY, 1), addDays(TODAY, 1)]
  else if (has(text, 'yesterday')) reading.days = [addDays(TODAY, -1), addDays(TODAY, -1)]
  else if (has(text, 'this week')) reading.days = [addDays(TODAY, -3), addDays(TODAY, 3)]
  else if (has(text, 'last week')) reading.days = [addDays(TODAY, -10), addDays(TODAY, -4)]
  else if (has(text, 'next week')) reading.days = [addDays(TODAY, 4), addDays(TODAY, 10)]
  for (const [name, month] of Object.entries(MONTHS)) if (new RegExp(`\\b${name}\\b`).test(text)) reading.month = month
  reading.free = text.split(/[^a-z0-9-]+/).filter((word) => word.length > 1 && !STOP.has(word) && !(word in MONTHS))
  return reading
}

/** The reading in words, for the status line: “delayed deliveries · May 9 – May 15” */
export function describe({ kind, state, days, month, free }: Reading) {
  const parts: string[] = []
  if (state) parts.push(state === 'attention' ? (kind === 'payment' ? 'overdue' : 'delayed') : state === 'done' ? (kind === 'payment' ? 'paid' : 'completed') : 'upcoming')
  parts.push(kind === 'payment' ? 'invoices' : kind === 'delivery' ? 'deliveries' : 'deliveries & invoices') /* 1.1: v38's words */
  if (days) parts.push(sameDay(days[0], days[1]) ? monthDay(days[0]) : `${monthDay(days[0])} – ${monthDay(days[1])}`)
  if (month !== null) parts.push(new Date(2026, month, 1).toLocaleDateString('en-US', { month: 'short' }))
  if (free.length) parts.push(`matching “${free.join(' ')}”`)
  return parts.join(' · ')
}

export function search(raw: string) {
  const reading = read(raw)
  const text = raw.toLowerCase().trim()
  const structured = reading.kind || reading.state || reading.days || reading.month !== null
  const rows = INDEX.filter((row) => {
    if (reading.kind && row.type !== reading.kind) return false
    if (reading.state && row.state !== reading.state) return false
    /* 1.1: as v38, “overdue” also finds what is due today (INV-7712); 1.0 left it out */
    if (reading.days && (row.date < reading.days[0] || row.date > reading.days[1])) return false
    if (reading.month !== null && row.date.getMonth() !== reading.month) return false
    if (reading.free.length && !reading.free.every((word) => row.id.toLowerCase().includes(word))) return false
    return Boolean(structured || reading.free.length)
  })
  /* Nearest to today first; what needs attention weighs more */
  const distance = (date: Date) => Math.abs(date.getTime() - TODAY.getTime())
  rows.sort((a, b) => distance(a.date) - distance(b.date) || (a.state === 'attention' ? -1 : 1))
  const words = text.split(/\s+/).filter((word) => word.length > 2)
  const actions = ACTIONS.filter((action) => text.length > 1 && (action.label.toLowerCase().includes(text) || action.words.split(' ').some((word) => words.some((typed) => word.startsWith(typed))))).slice(0, 3)
  return { reading, rows: rows.slice(0, 6), total: rows.length, actions }
}

/* A page of this site, beside the Search page. Where pages are served as files (…/search/index.html), the link
   names the file too */
export const pageUrl = (to: string) => {
  const [path = '', hash] = to.split('#')
  const file = location.pathname.endsWith('.html') ? `${path}index.html` : path
  return new URL(`../${file}${hash ? `#${hash}` : ''}`, location.href).href
}

export const keyOf = (item: Item) => (item.type === 'suggestion' ? item.text : item.type === 'action' ? item.label : item.id)

export function render(item: Item) {
  if (item.type === 'suggestion') return <SearchResult icon={<NorthEastIcon />} title={item.text} />
  if (item.type === 'action') return <SearchResult icon={item.icon} title={item.label} description={item.detail} />
  return (
    <SearchResult
      icon={item.type === 'delivery' ? <ShippingIcon /> : <ReceiptIcon />}
      title={item.text}
      description={`${item.type === 'delivery' ? 'Delivery' : 'Invoice'} · ${weekdayOf(item.date).slice(0, 3)} ${monthDay(item.date)}`}
      trailing={<Status tone={item.tone} hideLabel>{item.status}</Status>}
    />
  )
}

export default function SmartSearch() {
  const [value, setValue] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<ReturnType<typeof search> | null>(null)
  const [details, setDetails] = useState<DetailsTarget | null>(null)
  const [ordering, setOrdering] = useState(false)

  /* The search waits for a pause in typing, as a real one would */
  useEffect(() => {
    if (!value.trim()) {
      setResult(null)
      setBusy(false)
      return
    }
    setBusy(true)
    const timer = setTimeout(() => {
      setResult(search(value))
      setBusy(false)
    }, 380)
    return () => clearTimeout(timer)
  }, [value])

  const items = useMemo<Item[]>(() => (result ? [...result.rows, ...result.actions] : value.trim() ? [] : SUGGESTIONS), [result, value])
  const status = busy ? (
    <>
      <SparkleIcon aria-hidden="true" />
      <span className="sonar-shimmer">Understanding “{value}”…</span>
    </>
  ) : result ? (
    <>
      <SparkleIcon aria-hidden="true" />
      <span>Smart search</span>
      <Sep />
      <span>{describe(result.reading)}</span>
      {result.total > result.rows.length ? ` (${result.total})` : ''}
    </>
  ) : (
    'Try asking in plain words'
  )

  const choose = (item: Item) => {
    if (item.type === 'suggestion') {
      setValue(item.text)
      return true
    }
    setValue('')
    if (item.type === 'action') {
      if (item.to) location.assign(pageUrl(item.to))
      else setOrdering(true)
      return
    }
    setDetails({ kind: item.type, id: item.id, date: item.date })
  }

  return (
    <div className="smart-search">
      <div className="smart-search-bar">
        <SearchField
          label="Search orders, deliveries and invoices"
          placeholder="Search…"
          value={value}
          onValueChange={setValue}
          items={items}
          itemToString={keyOf}
          renderItem={render}
          onItemChoose={choose}
          status={status}
          busy={busy}
          busyIcon={<SparkleIcon />}
          empty={result && !busy ? 'No results. Try “late deliveries” or “INV-77”.' : undefined}
        />
      </div>
      <DetailsPanel target={details} onClose={() => setDetails(null)} unit={details?.kind === 'payment' ? 'USD' : 'plt'} />
      <NewOrderPanel open={ordering} onClose={() => setOrdering(false)} unit="plt" />
    </div>
  )
}
