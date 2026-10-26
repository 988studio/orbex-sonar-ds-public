/**
 * The anonymized figures of the Sonar-DB overview, shared by the pattern demos. Every card reads the same day,
 * Tuesday, May 12, 2026, so the figures agree with each other. Quantities are stored in pallets; each unit converts
 * them, so every figure in a card changes together.
 */
export type Unit = 'plt' | 'kg' | 'items'

export const units = [
  { value: 'plt', short: 'plt', name: 'Pallets' },
  { value: 'kg', short: 'kg', name: 'Kilograms' },
  { value: 'items', short: 'items', name: 'Items' },
]

/* One pallet is 2,000 kg or 500 items */
const perPallet: Record<Unit, number> = { plt: 1, kg: 2000, items: 500 }

/** A quantity in pallets, in another unit */
export const inUnit = (pallets: number, unit: Unit) => pallets * perPallet[unit]

/** A quantity in pallets, converted and written with its unit: 1,420 plt, 596,400 kg */
export const quantity = (pallets: number, unit: Unit) => `${Math.round(pallets * perPallet[unit]).toLocaleString('en-US')} ${unit}`

/** A figure already in its unit, written with it: for figures that count from one unit to another */
export const withUnit = (value: number, unit: string) => `${Math.round(value).toLocaleString('en-US')} ${unit}`

export const currencies = [
  { value: 'USD', short: 'usd', name: 'US dollars' },
  { value: 'EUR', short: 'eur', name: 'Euros' },
]

const perDollar: Record<string, number> = { USD: 1, EUR: 0.92 }

export const inCurrency = (dollars: number, currency: string) => dollars * (perDollar[currency] ?? 1)
export const moneyText = (value: number, currency: string) =>
  `${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`

export const money = (dollars: number, currency: string) =>
  `${(dollars * (perDollar[currency] ?? 1)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`

/* ---------- The day every card reads ---------- */

const DAY = 86_400_000
export const TODAY = new Date(2026, 4, 12)
/* By calendar day, so a change of daylight saving time never lands on the evening before */
export const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
export const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()


/* ---------- Orders: pallets per month of delivery ---------- */

/* The overview opens on May and June; Next shows June and July */
export const orderMonths = [
  { month: 'May 2026', shipped: 1420, onHold: 80, pending: 1100 },
  { month: 'June 2026', shipped: 1500, onHold: 160, pending: 1100 },
  { month: 'July 2026', shipped: 640, onHold: 40, pending: 1900 },
]

/** Pallets on open orders, every month */
export const openOrders = 6720

/* ---------- Inventory ---------- */

export const inventory = { available: 1960, onHold: 840 }

/* ---------- Daily shipments ---------- */

/* April, complete; May up to today. Days still to come are null and leave the line open */
const aprilShipped = [
  355, 375, 310, 510, 405, 430, 325, 305, 300, 285, 405, 455, 370, 295, 350, 445, 450, 395, 365, 335, 310, 360, 345, 285,
  485, 360, 365, 340, 330, 375,
]
const mayShipped = [320, 410, 360, 300, 455, 385, 290, 430, 470, 345, 370, 350]

export interface ShipmentMonth {
  month: string
  short: string
  days: string[]
  values: (number | null)[]
  /** Returned pallets in the month */
  returns: number
}

const monthOf = (name: string, short: string, length: number, values: number[], returns: number): ShipmentMonth => ({
  month: name,
  short,
  days: Array.from({ length }, (_, index) => `${short} ${index + 1}`),
  values: Array.from({ length }, (_, index) => values[index] ?? null),
  returns,
})

export const shipmentMonths = [monthOf('April 2026', 'Apr', 30, aprilShipped, 95), monthOf('May 2026', 'May', 31, mayShipped, 40)]
export const shippedIn = (month: ShipmentMonth) => month.values.reduce<number>((sum, value) => sum + (value ?? 0), 0)

/* ---------- Calendars: deliveries and payments, from March 1 to June 30 ---------- */

/** The first and last day the calendars of Deliveries and Balance reach */
export const FIRST_DAY = new Date(2026, 2, 1)
export const LAST_DAY = new Date(2026, 5, 30)
export const inRange = (date: Date) => date >= FIRST_DAY && date <= LAST_DAY

/** Weeks start on Monday in the month grid */
export const weekdayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const weekdayIndex = (date: Date) => (date.getDay() + 6) % 7
export const weekdayOf = (date: Date) => weekdayNames[weekdayIndex(date)] as string
export const shortDay = (date: Date) => weekdayOf(date).slice(0, 2)
export const monthDay = (date: Date) => date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
export const monthName = (date: Date) => date.toLocaleDateString('en-US', { month: 'long' })
export const addMonths = (date: Date, months: number) => {
  const first = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  return new Date(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), last))
}
export const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

/* A stable number from a text, so generated days are the same on every visit (FNV-1a) */
export function hash(text: string) {
  let value = 2166136261
  for (let index = 0; index < text.length; index++) {
    value ^= text.charCodeAt(index)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}
export const pick = <T,>(list: readonly T[], key: string) => list[hash(key) % list.length] as T

export type Tone = 'positive' | 'warning' | 'danger' | 'neutral'

/* ---------- Deliveries ---------- */

export type DeliveryStatus = 'Delivered' | 'Delayed' | 'Scheduled' | 'Canceled'
export interface Delivery {
  id: string
  items: number
  pallets: number
  status: DeliveryStatus
  /** An incident on the way: shown with an alert mark in the list and in the details */
  alert?: boolean
}

export const deliveryTone: Record<DeliveryStatus, Tone> = { Delivered: 'positive', Delayed: 'warning', Scheduled: 'neutral', Canceled: 'danger' }

const fixedDeliveries: Record<string, Delivery[]> = {
  [dayKey(TODAY)]: [
    { id: '04-118B', items: 2, pallets: 40, status: 'Delivered' },
    { id: '04-121A', items: 7, pallets: 150, status: 'Delayed' },
    { id: '04-127C', items: 1, pallets: 15, status: 'Delayed', alert: true },
    { id: '04-130A', items: 8, pallets: 210, status: 'Delivered' },
  ],
  [dayKey(addDays(TODAY, 1))]: [
    { id: '04-133B', items: 3, pallets: 60, status: 'Scheduled' },
    { id: '04-136A', items: 5, pallets: 95, status: 'Scheduled' },
    /* 1.1 (pending #11): 1 item, as v38 DEL_FIXED (1.0 had 2) */
    { id: '04-139C', items: 1, pallets: 25, status: 'Scheduled' },
  ],
}

/* Every other weekday is filled in once. A code is the order’s month, a number and a letter: deliveries of May
   carry April orders (04-), and so on. Numbers run in date order within each month, three apart, so codes never
   repeat; around today they count down from 04-118 and up from 04-139. No deliveries at weekends. One delivery is
   canceled (May 11); a few past ones were delayed and carry an alert. */
const deliveries = new Map<string, Delivery[]>()
const isWeekday = (date: Date) => date.getDay() !== 0 && date.getDay() !== 6
const letters = 'ABC'
const prefix = (date: Date) => String(date.getMonth()).padStart(2, '0')

function generated(date: Date, past: boolean): Delivery[] {
  const key = dayKey(date)
  const count = 2 + (hash('d' + key) % 3)
  return Array.from({ length: count }, (_, index) => {
    const k = hash(key + '#' + index)
    const items = 1 + (k % 8)
    const delayed = past && k % 7 === 0
    return { id: '', items, pallets: items * (15 + (k % 4) * 5), status: past ? (delayed ? 'Delayed' : 'Delivered') : 'Scheduled', alert: delayed || undefined }
  })
}
const coded = (list: Delivery[], date: Date, numbers: () => number) => list.map((delivery) => ({ ...delivery, id: `${prefix(date)}-${numbers()}${letters[delivery.items % 3]}` }))

{
  /* May: down from today, up from tomorrow */
  let below = 118
  for (let date = addDays(TODAY, -1); date.getMonth() === TODAY.getMonth(); date = addDays(date, -1)) {
    if (!isWeekday(date)) continue
    const list = generated(date, true).reverse()
    deliveries.set(dayKey(date), coded(list, date, () => (below -= 3)).reverse())
  }
  let above = 139
  for (let date = addDays(TODAY, 2); date.getMonth() === TODAY.getMonth(); date = addDays(date, 1)) {
    if (isWeekday(date)) deliveries.set(dayKey(date), coded(generated(date, false), date, () => (above += 3)))
  }
  /* Other months: from 101 up, in date order */
  for (const month of [2, 3, 5]) {
    let next = 98
    for (let date = new Date(2026, month, 1); date.getMonth() === month; date = addDays(date, 1)) {
      if (isWeekday(date)) deliveries.set(dayKey(date), coded(generated(date, date < TODAY), date, () => (next += 3)))
    }
  }
  const eleventh = deliveries.get(dayKey(addDays(TODAY, -1)))
  const last = eleventh?.[eleventh.length - 1]
  if (last) Object.assign(last, { status: 'Canceled', alert: undefined })
}

/* 1.1 (pending #11): every other day's deliveries and invoices are v38's own (calendar.js deliveriesOn and paymentsOn:
   the same hash of the ISO date, codes, figures and states), so the cards, the smart search and the details read
   exactly the product's sample data (1.0 hashed `2026-5-12` and renumbered the codes: only May 12–13 matched v38).
   The 1.0 sequence (deliveries Map above) is no longer used. */
const v38Iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const v38Index = (date: Date) => Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(2026, 2, 1)) / DAY)
const v38Red = new Set(['04-485A', 'INV-7505'])
function v38Deliveries(date: Date): Delivery[] {
  const s = v38Iso(date)
  const h = hash('d' + s), wd = (date.getDay() + 6) % 7, idx = v38Index(date)
  const n = wd < 5 ? 2 + (h % 3) : wd === 5 && h % 4 === 0 ? 1 : 0
  const mm = s.slice(5, 7)
  return Array.from({ length: n }, (_, i) => {
    const k = hash(s + '#' + i), items = 1 + (k % 8), pallets = items * (15 + (k % 4) * 5)
    const id = `${mm === '03' ? '03' : mm === '06' ? '06' : '04'}-${200 + idx * 4 + i}${'ABC'[(k >>> 3) % 3]}`
    const status: DeliveryStatus = v38Red.has(id) ? 'Canceled' : date > TODAY ? 'Scheduled' : k % 7 === 0 ? 'Delayed' : 'Delivered'
    return { id, items, pallets, status, alert: status === 'Delayed' || undefined }
  })
}

export function deliveriesOn(date: Date): Delivery[] {
  const key = dayKey(date)
  if (fixedDeliveries[key]) return fixedDeliveries[key]
  if (!inRange(date) || key === dayKey(addDays(TODAY, 4)) || key === dayKey(addDays(TODAY, 5))) return []
  return v38Deliveries(date)
}

export const palletsOf = (list: Delivery[]) => list.reduce((sum, { pallets }) => sum + pallets, 0)

/* ---------- Payments, in US dollars ---------- */

export type PaymentStatus = 'Paid' | 'Overdue' | 'Due today' | 'Scheduled' | 'Disputed'
export interface Payment {
  id: string
  amount: number
  status: PaymentStatus
}

export const paymentTone: Record<PaymentStatus, Tone> = { Paid: 'positive', Overdue: 'warning', 'Due today': 'warning', Scheduled: 'neutral', Disputed: 'danger' }

const fixedPayments: Record<string, Payment[]> = {
  [dayKey(TODAY)]: [
    { id: 'INV-7712', amount: 30_000, status: 'Due today' },
    { id: 'INV-7716', amount: 16_800, status: 'Paid' },
  ],
}

/* One to three invoices fall due each weekday; codes count up three a day from March 1. One is disputed (May 8). */
export function paymentsOn(date: Date): Payment[] {
  const key = dayKey(date)
  if (fixedPayments[key]) return fixedPayments[key]
  if (!isWeekday(date) || !inRange(date)) return []
  /* 1.1: v38 paymentsOn, hashed on the ISO date (see v38Deliveries) */
  const iso = v38Iso(date)
  const index = v38Index(date)
  return Array.from({ length: 1 + (hash('p' + iso) % 3) }, (_, position) => {
    const k = hash(iso + '$' + position)
    const id = `INV-${7300 + index * 3 + position}`
    const status: PaymentStatus = id === 'INV-7505' ? 'Disputed' : date > TODAY ? 'Scheduled' : k % 6 === 0 ? 'Overdue' : 'Paid'
    return { id, amount: (4 + (k % 40)) * 1000 + (k % 7) * 100, status }
  })
}

export const amountOf = (list: Payment[]) => list.reduce((sum, { amount }) => sum + amount, 0)

/** The next day after this one with something in the calendar, to point to it from an empty day */
export function nextWith(kind: 'delivery' | 'payment', date: Date) {
  for (let day = addDays(date, 1); inRange(day); day = addDays(day, 1)) {
    if ((kind === 'delivery' ? deliveriesOn(day) : paymentsOn(day)).length) return day
  }
  return null
}

/* ---------- Balance ---------- */

export const balance = { total: 3_900_000, overdue: 2_230_800 }

/** What falls due today and tomorrow: the same invoices as the payment calendar */
export const dues = [TODAY, addDays(TODAY, 1)].map((date) => ({ date, amount: amountOf(paymentsOn(date)) }))

/* ---------- Scheduled orders: confirmed, not yet out (the Scheduled orders module and Order details) ---------- */

export const scheduledOrders: [Date, [string, number][]][] = [
  [new Date(2026, 4, 14), [['05-201A', 120], ['05-202C', 95], ['05-204B', 195]]],
  [new Date(2026, 4, 15), [['05-209A', 240], ['05-210B', 60]]],
  [new Date(2026, 4, 19), [['05-214C', 150], ['05-215A', 80], ['05-217B', 110], ['05-218A', 45]]],
  [new Date(2026, 4, 21), [['05-221B', 300]]],
  [new Date(2026, 4, 25), [['05-226A', 175], ['05-228C', 90]]],
  [new Date(2026, 4, 27), [['05-231A', 130], ['05-233B', 210], ['05-234C', 60]]],
]

export function scheduledOrder(code: string) {
  for (const [date, rows] of scheduledOrders) {
    const row = rows.find(([id]) => id === code)
    if (row) return { code, date, pallets: row[1] }
  }
  return null
}
