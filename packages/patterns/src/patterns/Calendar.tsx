import { Button } from '@orbex/sonar-components/button'
import { CardScroll } from '@orbex/sonar-components/card'
import { IconButton } from '@orbex/sonar-components/icon-button'
import { SegmentedControl } from '@orbex/sonar-components/segmented-control'
import { Status } from '@orbex/sonar-components/status'
import { useEffect, useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, EventBusyIcon, MonthIcon, WeekIcon } from '../icons.tsx'
import {
  addDays,
  addMonths,
  deliveriesOn,
  deliveryTone,
  FIRST_DAY,
  inCurrency,
  inRange,
  inUnit,
  LAST_DAY,
  moneyText,
  monthDay,
  monthName,
  nextWith,
  paymentsOn,
  paymentTone,
  sameDay,
  shortDay,
  TODAY,
  weekdayIndex,
  weekdayNames,
  weekdayOf,
  withUnit,
  type Tone,
  type Unit,
} from './data.ts'
import { syncBlink } from './blink.ts'
import { Count, reducedMotion } from './motion.ts'
import './panels.css'

export type CalendarKind = 'delivery' | 'payment'
export type CalendarView = 'week' | 'month'

/** One line of a day: a delivery or an invoice */
export interface DayRow {
  id: string
  /** Shown under the code: “2 items · 40 plt” or the amount */
  value: number
  items?: number
  status: string
  tone: Tone
  alert?: boolean
}

/** The rows of a day in the unit shown, and how to write their total */
function rowsOf(kind: CalendarKind, date: Date, unit: string): DayRow[] {
  if (kind === 'delivery') {
    return deliveriesOn(date).map(({ id, items, pallets, status, alert }) => ({ id, items, value: inUnit(pallets, unit as Unit), status, tone: deliveryTone[status], alert }))
  }
  return paymentsOn(date).map(({ id, amount, status }) => ({ id, value: inCurrency(amount, unit), status, tone: paymentTone[status] }))
}

const KIND = {
  delivery: { noun: 'delivery', empty: 'No deliveries scheduled', next: 'Next delivery on', format: withUnit },
  payment: { noun: 'invoice', empty: 'No payments due', next: 'Next payment due on', format: moneyText },
} as const

/** An alert mark: an incident on the way */
export function AlertMark({ blink = false }: { blink?: boolean }) {
  /* Every blinking mark keeps the same beat (1.0.0-alpha.23): its cycle follows the page's clock, not the moment it
     was drawn, so marks drawn at different moments never fall out of step. Since 1.1.4 that is a CSS animation-delay
     set once (blink.ts), never a write to the animation's startTime, which froze the mark on iOS Safari. The cycle
     itself is the product's (panels.css) */
  const mark = useRef<SVGSVGElement>(null)
  useLayoutEffect(() => {
    if (blink && mark.current) syncBlink([mark.current])
  }, [blink])
  return (
    <svg ref={mark} className="cal-alert" data-blink={blink || undefined} viewBox="0 0 24 24" role="img" aria-label="Alert">
      <path d="M12 2.2 1.2 21h21.6L12 2.2z" />
      <rect x="11" y="9" width="2" height="6" rx=".6" />
      <rect x="11" y="16.4" width="2" height="2" rx=".6" />
    </svg>
  )
}

/** The thin bar between the parts of a line of metadata: “1 item | 15 plt” */
export const Sep = () => (
  <span className="sep" aria-hidden="true">
    |
  </span>
)

export function Rows({ kind, rows, unit, openRow, inert, onDetails }: { kind: CalendarKind; rows: DayRow[]; unit: string; openRow?: string | null; inert?: boolean; onDetails?: (row: DayRow) => void }) {
  const { noun, format } = KIND[kind]
  return (
    <ul className="cal-rows" role="list">
      {rows.map((row) => (
        <li key={row.id} data-open={openRow === row.id || undefined}>
          {/* The code, then its figures after a thin bar, then the alert mark after the last of them */}
          <span className="cal-row-id">
            <strong>{row.id}</strong>
            <span className="cal-row-meta">
              {row.items !== undefined && <Sep />}
              {row.items !== undefined && <span>{`${row.items} ${row.items === 1 ? 'item' : 'items'}`}</span>}
              <Sep />
              {/* One text node: the server's HTML and the first render in the browser are the same string */}
              <Count value={row.value} id={row.id} format={(value) => format(value, unit)} />
            </span>
            {row.alert && <AlertMark blink />}
          </span>
          <Status tone={row.tone} hideLabel title={row.status}>
            {row.status}
          </Status>
          <Button
            size="small"
            className="cal-view"
            variant={row.tone === 'warning' ? 'filled' : 'outlined'}
            aria-label={`View ${noun} ${row.id}`}
            aria-haspopup="dialog"
            tabIndex={inert ? -1 : undefined}
            onClick={() => onDetails?.(row)}
          >
            View
          </Button>
        </li>
      ))}
    </ul>
  )
}

/** The heading of a day and its total */
function DayHead({ kind, date, rows, unit }: { kind: CalendarKind; date: Date; rows: DayRow[]; unit: string }) {
  const total = rows.reduce((sum, { value }) => sum + value, 0)
  return (
    <div className="card-row cal-dayhead">
      <span className="card-figure">
        <span>{monthDay(date)}</span>
        <Sep />
        <span>{weekdayOf(date)}</span>
      </span>
      <span className="cal-total">
        <Count value={total} id={kind + date.toDateString()} format={(value) => `Total ${KIND[kind].format(value, unit)}`} />
      </span>
    </div>
  )
}

/* ---------- The week: the chosen day stays in the middle, under a fixed dot ----------
   The strip is a native sideways scroller that snaps day by day: a swipe or a flick (with its momentum) lands on a
   day, and that day becomes the chosen one. Arrows, a tap on a day and the arrow keys glide the strip to the day.
   With a mouse, the strip can also be dragged. */

const DAYS = (() => {
  const out: Date[] = []
  for (let date = FIRST_DAY; date <= LAST_DAY; date = addDays(date, 1)) out.push(date)
  return out
})()
const indexOf = (date: Date) => DAYS.findIndex((other) => sameDay(other, date))

function Week({ day, onDay, kind }: { day: Date; onDay: (day: Date) => void; kind: CalendarKind }) {
  const strip = useRef<HTMLDivElement>(null)
  const keyboard = useRef(false)
  /* The day the strip is gliding to on its own, so the scroll it causes is not read as the person’s */
  const target = useRef<number | null>(null)
  const dragged = useRef(false)
  const chosen = indexOf(day)
  const cell = () => (strip.current?.clientWidth ?? 280) / 7

  /* The strip follows the chosen day: at once the first time, gliding after */
  const placed = useRef(false)
  useLayoutEffect(() => {
    const element = strip.current
    if (!element) return
    const left = chosen * cell()
    if (Math.abs(element.scrollLeft - left) > 1) {
      target.current = chosen
      element.scrollTo({ left, behavior: placed.current && !reducedMotion() ? 'smooth' : 'auto' })
      if (!placed.current) target.current = null
    }
    placed.current = true
    if (keyboard.current) {
      keyboard.current = false
      element.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus({ preventScroll: true })
    }
  }, [chosen])

  /* Keep the chosen day in the middle when the strip changes width. The cells change width with it, so the scroll
     the browser keeps would point at another day: the strip is placed again, without snapping, and the scroll that
     causes is not read as a choice. Snapping comes back on the next frame. */
  const current = useRef(day)
  current.current = day
  useEffect(() => {
    const element = strip.current
    if (!element) return
    let frame = 0
    let width = element.clientWidth
    const place = () => {
      const index = indexOf(current.current)
      target.current = index
      element.scrollLeft = index * cell()
    }
    const observer = new ResizeObserver(() => {
      if (element.clientWidth === width) return
      width = element.clientWidth
      element.style.scrollSnapType = 'none'
      place()
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        place()
        element.style.scrollSnapType = ''
      })
    })
    observer.observe(element)
    /* Anything the person does with the strip is theirs again */
    const release = () => (target.current = null)
    for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) element.addEventListener(type, release, { passive: true })
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
      for (const type of ['wheel', 'touchstart', 'pointerdown', 'keydown']) element.removeEventListener(type, release)
    }
  }, [])

  /* When a scroll the person made settles on a day, that day is chosen */
  useEffect(() => {
    const element = strip.current
    if (!element) return
    let timer = 0
    const settle = () => {
      const landed = Math.max(0, Math.min(DAYS.length - 1, Math.round(element.scrollLeft / cell())))
      if (target.current !== null) {
        if (landed === target.current) target.current = null
        return
      }
      if (landed !== chosen) onDay(DAYS[landed]!)
    }
    const onScroll = () => {
      clearTimeout(timer)
      timer = window.setTimeout(settle, 140) // where scrollend is not supported
    }
    const onEnd = () => {
      clearTimeout(timer)
      settle()
    }
    element.addEventListener('scroll', onScroll, { passive: true })
    element.addEventListener('scrollend', onEnd)
    return () => {
      clearTimeout(timer)
      element.removeEventListener('scroll', onScroll)
      element.removeEventListener('scrollend', onEnd)
    }
  }, [chosen, onDay])

  /* A mouse drags the strip; on release it lands on the nearest day, a quick throw carrying it further */
  const drag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !strip.current) return
    const element = strip.current
    const startX = event.clientX
    const startLeft = element.scrollLeft
    const startTime = performance.now()
    let moved = false
    const move = (next: globalThis.PointerEvent) => {
      const dx = next.clientX - startX
      if (!moved && Math.abs(dx) < 4) return
      if (!moved) element.style.scrollSnapType = 'none'
      moved = true
      element.scrollLeft = startLeft - dx
    }
    const up = (last: globalThis.PointerEvent) => {
      removeEventListener('pointermove', move)
      removeEventListener('pointerup', up)
      if (!moved) return
      dragged.current = true
      setTimeout(() => (dragged.current = false), 60)
      const velocity = (last.clientX - startX) / Math.max(1, performance.now() - startTime)
      const landed = Math.max(0, Math.min(DAYS.length - 1, Math.round((element.scrollLeft - velocity * 140) / cell())))
      element.style.scrollSnapType = ''
      target.current = landed
      element.scrollTo({ left: landed * cell(), behavior: reducedMotion() ? 'auto' : 'smooth' })
      if (landed !== chosen) onDay(DAYS[landed]!)
    }
    addEventListener('pointermove', move)
    addEventListener('pointerup', up)
  }

  const go = (days: number) => {
    const next = addDays(day, days)
    if (inRange(next)) onDay(next)
  }
  const onKey = (event: KeyboardEvent) => {
    const step = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0
    if (!step) return
    event.preventDefault()
    if (!inRange(addDays(day, step))) return
    keyboard.current = true
    go(step)
  }

  const empty = (date: Date) => (kind === 'delivery' ? deliveriesOn(date) : paymentsOn(date)).length === 0
  return (
    <div className="cal-week">
      <IconButton size="small" label="Previous day" icon={<ChevronLeftIcon />} disabled={!inRange(addDays(day, -1))} onClick={() => go(-1)} />
      <div className="cal-frame">
        <div className="cal-strip" ref={strip} onPointerDown={drag}>
          <div className="cal-track" role="group" aria-label="Days">
            {DAYS.map((date, index) => {
              const offset = index - chosen
              return (
                <button
                  key={index}
                  type="button"
                  className="cal-cell cal-day"
                  aria-pressed={offset === 0}
                  aria-current={sameDay(date, TODAY) ? 'date' : undefined}
                  aria-hidden={Math.abs(offset) <= 3 ? undefined : true}
                  tabIndex={offset === 0 ? 0 : -1}
                  onClick={() => !dragged.current && offset && onDay(date)}
                  onKeyDown={onKey}
                >
                  <span className="cal-wd" aria-hidden="true">
                    {shortDay(date)}
                  </span>
                  <span className="cal-dn" aria-hidden="true">
                    {String(date.getDate()).padStart(2, '0')}
                  </span>
                  <span className="visually-hidden">
                    {`${weekdayOf(date)}, ${monthDay(date)}${empty(date) ? `, ${kind === 'delivery' ? 'no deliveries' : 'no payments'}` : ''}`}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <IconButton size="small" label="Next day" icon={<ChevronRightIcon />} disabled={!inRange(addDays(day, 1))} onClick={() => go(1)} />
    </div>
  )
}

/* ---------- The month: a grid from Monday; days of other months leave their cell empty ---------- */

function Month({ day, onDay }: { day: Date; onDay: (day: Date) => void }) {
  const grid = useRef<HTMLDivElement>(null)
  const keyboard = useRef(false)
  const first = new Date(day.getFullYear(), day.getMonth(), 1)
  const start = addDays(first, -weekdayIndex(first))
  useEffect(() => {
    if (!keyboard.current) return
    keyboard.current = false
    grid.current?.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus()
  }, [day])
  const onKey = (event: KeyboardEvent) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key]
    if (!step) return
    event.preventDefault()
    const next = addDays(day, step)
    if (!inRange(next)) return
    keyboard.current = true
    onDay(next)
  }
  return (
    <div className="cal-month" ref={grid} role="group" aria-label={`Days of ${monthName(day)}`}>
      {weekdayNames.map((name) => (
        <abbr key={name} className="cal-wd" title={name}>
          {name.slice(0, 2)}
        </abbr>
      ))}
      {Array.from({ length: 42 }, (_, index) => {
        const date = addDays(start, index)
        /* The days of the months around it fill the six weeks, greyed; they lead to that month */
        const out = date.getMonth() !== day.getMonth()
        const chosen = sameDay(date, day)
        if (out && !inRange(date)) return <span key={index} className="cal-date" data-out="" aria-hidden="true">{date.getDate()}</span>
        return (
          <button
            key={index}
            type="button"
            className="cal-date"
            data-out={out || undefined}
            aria-pressed={chosen}
            aria-current={sameDay(date, TODAY) ? 'date' : undefined}
            aria-label={`${weekdayOf(date)}, ${monthDay(date)}`}
            tabIndex={chosen ? 0 : -1}
            onClick={() => !chosen && onDay(date)}
            onKeyDown={onKey}
          >
            {date.getDate()}
          </button>
        )
      })}
    </div>
  )
}

export interface CalendarProps {
  kind: CalendarKind
  day: Date
  onDayChange: (day: Date) => void
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  /** The unit (deliveries) or currency (payments) the figures are shown in */
  unit: string
  /** Week view only: under the day, the next day with something in it, faded, to fill a tall card */
  peek?: boolean
  /** The row whose details are open: it stays marked */
  openRow?: string | null
  onDetails: (row: DayRow, day: Date) => void
}

/**
 * The calendar of Deliveries and of Balance’s payments: a week whose chosen day stays in the middle, or the whole
 * month, and the rows of the chosen day. A day without rows points to the next one that has some.
 */
export default function Calendar({ kind, day, onDayChange, view, onViewChange, unit, peek, openRow, onDetails }: CalendarProps) {
  /* Which way the day moved, so its rows come in from that side */
  const last = useRef(day)
  const direction = useRef(0)
  if (!sameDay(last.current, day)) {
    direction.current = day > last.current ? 1 : -1
    last.current = day
  }
  const rows = rowsOf(kind, day, unit)
  const { empty, next } = KIND[kind]
  const following = nextWith(kind, day)
  const preview = view === 'month' ? (rowsOf(kind, addDays(day, 1), unit).length ? addDays(day, 1) : null) : peek ? following : null
  const enter = { '--dir': direction.current } as CSSProperties
  /* When the rows do not all fit, the list stops at the rule under the last whole row: never a row cut
     through its text. Measured again whenever the card or the day changes. */
  const root = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const frame = root.current
    const scroll = list.current
    if (!frame || !scroll) return
    const fit = () => {
      scroll.style.maxHeight = ''
      const rows = [...scroll.querySelectorAll<HTMLElement>('.cal-rows > li')]
      /* Measured on screen; a card drawn scaled (the editing demo) is measured in its own pixels instead, where the
         scale’s rounding does not cost a row */
      const scale = frame.offsetHeight ? frame.getBoundingClientRect().height / frame.offsetHeight : 1
      const scaled = Math.abs(scale - 1) > 0.01
      const room = (frame.getBoundingClientRect().bottom - scroll.getBoundingClientRect().top) / (scaled ? scale : 1)
      let used = 0
      let shown = 0
      for (const row of rows) {
        const height = scaled ? row.offsetHeight : row.getBoundingClientRect().height
        /* Scaled, every row may round up by a pixel */
        if (used + height > room + (scaled ? rows.length : 0.5)) break
        used += height
        shown++
      }
      if (shown < rows.length && shown > 0) scroll.style.maxHeight = `${Math.floor(used)}px`
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(frame)
    return () => observer.disconnect()
  }, [day, view, unit])
  return (
    <div className="cal" data-kind={kind} ref={root}>
      <div className="cal-head">
        <h4 className="card-heading" aria-live="polite">
          {`${monthName(day).slice(0, 3)} ${day.getFullYear()}`}
        </h4>
        <SegmentedControl
          className="cal-view"
          legend="Calendar view"
          hideLegend
          iconOnly
          size="small"
          value={view}
          onValueChange={(value) => onViewChange(value as CalendarView)}
          options={[
            { value: 'week', label: 'Week', icon: <WeekIcon /> },
            { value: 'month', label: 'Month', icon: <MonthIcon /> },
          ]}
        />
        <span className="card-steps cal-months">
          <IconButton size="small" label="Previous month" icon={<ChevronLeftIcon />} disabled={new Date(day.getFullYear(), day.getMonth(), 0) < FIRST_DAY} onClick={() => onDayChange(addMonths(day, -1))} />
          <IconButton size="small" label="Next month" icon={<ChevronRightIcon />} disabled={new Date(day.getFullYear(), day.getMonth() + 1, 1) > LAST_DAY} onClick={() => onDayChange(addMonths(day, 1))} />
        </span>
      </div>
      {view === 'week' ? <Week day={day} onDay={onDayChange} kind={kind} /> : <Month day={day} onDay={onDayChange} />}
      <div className="cal-day-block" key={day.toDateString() + view} style={enter} data-enter={direction.current ? '' : undefined}>
        <DayHead kind={kind} date={day} rows={rows} unit={unit} />
        {rows.length ? (
          view === 'week' ? (
            <CardScroll ref={list} label={`${kind === 'delivery' ? 'Deliveries' : 'Payments'} of ${monthDay(day)}`}>
              <Rows kind={kind} rows={rows} unit={unit} openRow={openRow} onDetails={(row) => onDetails(row, day)} />
            </CardScroll>
          ) : (
            <Rows kind={kind} rows={rows} unit={unit} openRow={openRow} onDetails={(row) => onDetails(row, day)} />
          )
        ) : (
          <div className="cal-empty">
            <EventBusyIcon aria-hidden="true" />
            <p className="card-figure">{empty}</p>
            {following && (
              <p className="card-meta">
                {`${next} ${weekdayOf(following)}, ${monthDay(following)}`}
              </p>
            )}
          </div>
        )}
      </div>
      {preview && (
        <div className="cal-peek" data-view={view} inert aria-hidden="true">
          <DayHead kind={kind} date={preview} rows={rowsOf(kind, preview, unit)} unit={unit} />
          <Rows kind={kind} rows={rowsOf(kind, preview, unit)} unit={unit} inert />
        </div>
      )}
    </div>
  )
}
