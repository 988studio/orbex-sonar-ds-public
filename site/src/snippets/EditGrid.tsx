import { Button } from '@orbex/sonar-components/button'
import { Card, CardLink } from '@orbex/sonar-components/card'
import { Dialog } from '@orbex/sonar-components/dialog'
import { IconButton } from '@orbex/sonar-components/icon-button'
import { SegmentedControl } from '@orbex/sonar-components/segmented-control'
import { ToastProvider, useToast } from '@orbex/sonar-components/toast'
import { useEffect, useLayoutEffect, useRef, useState, type ComponentType, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from 'react'
import {
  AddCircleIcon,
  AddIcon,
  AutorenewIcon,
  BankIcon,
  CheckIcon,
  CloseIcon,
  DescriptionIcon,
  DragIcon,
  EditIcon,
  EventRepeatIcon,
  InStockIcon,
  ListAltIcon,
  MonitoringIcon,
  NotificationsIcon,
  ReceiptIcon,
  RequestQuoteIcon,
  ShippingIcon,
  UnfoldIcon,
  WarehouseIcon,
} from '@orbex/sonar-patterns/icons.tsx'

/*
 * Editing the overview at its real size: the six cards of the default overview, each with its content, in three
 * columns of 370 px as on a 1440 px desktop, or two of 346 px after the 60 px rail as on an 820 px tablet. The frame scrolls sideways when
 * the page is narrower. Edit layout turns the grid into a draft. Drag a card by its top handle (or focus it, press Space and move it
 * with the arrow keys), pull its bottom handle to change its size, remove it with ×, bring it back from New element,
 * then Save layout, Cancel or Reset to default from the bar at the foot.
 */

export type Size = 'S' | 'M' | 'L' | 'XL'
export interface Entry {
  id: string
  size: Size
  hidden?: boolean
}
export type Layout = Record<string, Entry[]>

/* The overview's heights and gap, in pixels, drawn at 1:1 */
const HEIGHTS: Record<Size, number> = { S: 245, M: 375, L: 405, XL: 535 }
const GAP = 20

/* Two grids: a 1440 px desktop has three columns of 370 px; an 820 px tablet, after its 60 px rail and 24 px margins,
   two of 346 px */
type Mode = 'desktop' | 'tablet'
const GRIDS: Record<Mode, { columns: string[]; width: number }> = {
  desktop: { columns: ['c1', 'c2', 'c3'], width: 370 },
  tablet: { columns: ['t1', 't2'], width: 346 },
}

/* Motion, from the product */
const NEIGHBOURS = 320
const REFLOW = 620
const SETTLE = 500

const CARDS: Record<string, { title: string; sizes: Size[] }> = {
  orders: { title: 'Orders', sizes: ['S', 'M'] },
  deliveries: { title: 'Deliveries', sizes: ['M', 'L', 'XL'] },
  shipments: { title: 'Daily shipments', sizes: ['L', 'XL'] },
  inventory: { title: 'Inventory', sizes: ['S', 'M'] },
  balance: { title: 'Balance', sizes: ['S', 'M', 'L'] },
  recurring: { title: 'Recurring orders', sizes: ['M', 'L', 'XL'] },
  /* Modules that can be added from New element; they come in one size */
  notifications: { title: 'Notifications', sizes: ['L'] },
  invoices: { title: 'Invoices', sizes: ['L'] },
  documents: { title: 'Latest documents', sizes: ['L'] },
  credits: { title: 'Credit notes', sizes: ['L'] },
  scheduled: { title: 'Scheduled orders', sizes: ['L'] },
}
const OPTIONAL = ['invoices', 'documents', 'notifications', 'credits', 'scheduled']

/* What each card shows: here its title, at its size; in the product, the card itself with its content */
const BODIES: Record<string, ComponentType<{ size?: any }>> = Object.fromEntries(
  Object.entries(CARDS).map(([id, { title }]) => [id, ({ size }: { size?: any }) => <Card titleAs="h3" title={title} size={size} />]),
)

/* New element's list: an icon and a line for every module */
const INFO: Record<string, [ComponentType, string]> = {
  invoices: [ReceiptIcon, 'Latest invoices with direct download'],
  documents: [DescriptionIcon, 'Documents grouped by order'],
  notifications: [NotificationsIcon, 'Delivery alerts and updates'],
  credits: [RequestQuoteIcon, 'Credits issued to your account'],
  scheduled: [EventRepeatIcon, 'Upcoming orders by date'],
  orders: [ListAltIcon, 'Open orders by month'],
  deliveries: [ShippingIcon, 'Deliveries by day'],
  shipments: [MonitoringIcon, 'Shipments this month'],
  inventory: [WarehouseIcon, 'Stock on hold and available'],
  balance: [BankIcon, 'Overdue, due today and payment calendar'],
  recurring: [AutorenewIcon, 'Quick reorder of favourite products'],
}

const DEFAULT: Layout = {
  c1: [{ id: 'orders', size: 'M' }, { id: 'deliveries', size: 'L' }],
  c2: [{ id: 'shipments', size: 'XL' }, { id: 'inventory', size: 'S' }],
  c3: [{ id: 'balance', size: 'M' }, { id: 'recurring', size: 'L' }],
}

/* The tablet's layout comes from the desktop's: cards are read top to bottom (left to right at the same height) and
   each goes into the shorter column. Orders, Balance and Recurring orders on the left; Daily shipments, Deliveries and
   Inventory on the right. */
function deriveTablet(desk: Layout): Layout {
  const items: { entry: Entry; y: number; column: number }[] = []
  Object.values(desk).forEach((column, index) => {
    let y = 0
    for (const entry of column) {
      items.push({ entry, y, column: index })
      if (!entry.hidden) y += HEIGHTS[entry.size] + GAP
    }
  })
  const out: Layout = { t1: [], t2: [] }
  for (const { entry } of items.sort((a, b) => a.y - b.y || a.column - b.column)) out[shortest(out)]!.push({ ...entry })
  return out
}
const DEFAULTS_FOR: Record<Mode, () => Layout> = { desktop: () => clone(DEFAULT), tablet: () => deriveTablet(DEFAULT) }

const clone = (layout: Layout): Layout => JSON.parse(JSON.stringify(layout))
const visible = (column: Entry[]) => column.filter((entry) => !entry.hidden)
const bottomOf = (column: Entry[]) => visible(column).reduce((sum, entry, index) => sum + HEIGHTS[entry.size] + (index ? GAP : 0), 0)
const shortest = (layout: Layout) => Object.keys(layout).reduce((a, b) => (bottomOf(layout[b]!) < bottomOf(layout[a]!) ? b : a))
const columnOf = (layout: Layout, id: string) => Object.keys(layout).find((column) => layout[column]!.some((entry) => entry.id === id))!
const DEFAULTS = Object.values(DEFAULT).flatMap((column) => column.map(({ id }) => id))

/** The pills and the remove button of a card in edit mode, as the product draws them */
export function Handles({
  title,
  size,
  preview,
  guide,
  moveProps,
  resizeProps,
  onRemove,
}: {
  title: string
  size: Size
  /** Draw a state without interaction: a handle hovered or focused, or held */
  preview?: { move?: 'hover' | 'focus' | 'on'; resize?: 'on'; remove?: 'hover' }
  guide?: ReactNode
  moveProps?: Record<string, unknown>
  resizeProps?: Record<string, unknown>
  onRemove?: () => void
}) {
  const state = (value?: string) => (value === 'on' ? { 'data-on': '' } : {})
  return (
    <>
      <span style={{ display: 'contents' }} data-preview={preview?.move !== 'on' ? preview?.move : undefined}>
        <button type="button" className="edit-handle" data-handle="move" aria-label={`Move ${title}`} {...state(preview?.move)} {...moveProps}>
          <DragIcon />
        </button>
      </span>
      <span style={{ display: 'contents' }} data-preview={preview?.remove}>
        <button type="button" className="edit-remove" aria-label={`Remove ${title} from the overview`} onClick={onRemove}>
          <CloseIcon />
        </button>
      </span>
      {guide}
      <span className="edit-size" aria-hidden="true">
        {size}
      </span>
      <button type="button" className="edit-handle" data-handle="resize" aria-label={`Resize ${title}. Current size ${size}. Use arrow up or down.`} {...state(preview?.resize)} {...resizeProps}>
        <UnfoldIcon />
      </button>
    </>
  )
}

/** The label over the bottom pill while a card is resized */
export const Guide = ({ size, aligned }: { size: Size; aligned: boolean }) => (
  <span className="edit-guide" aria-live="polite">
    {aligned ? (
      <>
        <CheckIcon aria-hidden="true" />
        Aligned · {size}
      </>
    ) : (
      `${size} · ${HEIGHTS[size]} px`
    )}
  </span>
)

/* Cards travel from where they were to where they are: 320 ms while editing, 620 ms when the number of columns changes.
   The card under the pointer is left alone; it follows the pointer. Each grid watches only its own cards, so several
   grids on one page (the app shell's three frames) never animate each other's. */
function useTravel(root: RefObject<HTMLElement | null>, key: string, mode: string, skip: string | undefined, zoom = 1) {
  const rects = useRef(new Map<string, DOMRect>())
  const lastMode = useRef(mode)
  useLayoutEffect(() => {
    const cards = [...(root.current?.querySelectorAll<HTMLElement>('[data-edit-id]') ?? [])]
    const reflow = lastMode.current !== mode
    lastMode.current = mode
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const spring = getComputedStyle(document.documentElement).getPropertyValue('--sonar-motion-spatial-default-easing').trim() || 'ease-out'
    const next = new Map<string, DOMRect>()
    for (const card of cards) {
      const id = card.dataset.editId!
      const now = card.getBoundingClientRect()
      next.set(id, now)
      const was = rects.current.get(id)
      if (still || !was || id === skip) continue
      /* Rectangles are on screen; the translation is inside the zoomed canvas */
      const [dx, dy] = [(was.left - now.left) / zoom, (was.top - now.top) / zoom]
      if (!dx && !dy) continue
      card.getAnimations().forEach((animation) => animation.cancel())
      card.animate([{ translate: `${dx}px ${dy}px` }, { translate: '0 0' }], {
        duration: reflow ? REFLOW : NEIGHBOURS,
        easing: reflow ? 'cubic-bezier(.2,0,0,1)' : spring,
      })
    }
    rects.current = next
  }, [key, mode, skip, zoom])
}

/* The nearest box that scrolls up and down: the app frame's own overview, or else the page */
function scrollerOf(element: HTMLElement): HTMLElement | null {
  for (let node = element.parentElement; node && node !== document.body; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node)
    if (/(auto|scroll)/.test(overflowY) && node.scrollHeight > node.clientHeight + 1) return node
  }
  return null
}

export interface EditCardsProps {
  /** The layout drawn: the draft while editing, the saved one otherwise */
  layout: Layout
  /** Changes the draft (only called while editing) */
  setLayout: (update: (current: Layout) => Layout) => void
  editing: boolean
  /** The scale the grid is drawn at (a fitted canvas or a scaled device frame); pointer moves are divided by it */
  zoom?: number
  /** Changing it (a new number of columns) makes the cards travel on the slower reflow */
  mode?: string
  onAnnounce: (text: string) => void
  className?: string
  style?: CSSProperties
  /** Where New element's Customize overview link goes */
  customizeHref?: string
  /** The cards' own buttons work while the layout is not edited (the app shell); the editing demo draws them still */
  interactive?: boolean
}

/**
 * The overview's grid, and Edit layout on it. Shared by the editing demo and the app shell's frames.
 *
 * Moving a card: the pointer is held by the grid itself (pointer capture), which is never redrawn. A card that changes
 * column is drawn anew, and on iPhone and iPad a finger stays tied to the element it first touched: when that element
 * left the page, the moves stopped reaching the page and the card froze, lifted, until the next touch. Where the card
 * lands is worked out from the layout (each card's height and the gap), not from what is under the finger, so the
 * card never jumps to the end of its own column and the neighbours never shake while they travel. The card is placed
 * under the finger again after every redraw, from its new slot, so it never drifts. Near the top or bottom edge the
 * overview (or the page) scrolls.
 */
export function EditCards({ layout, setLayout, editing, zoom = 1, mode = '', onAnnounce, className = 'edit-grid', style, customizeHref = '/patterns/editing/#list', interactive = false }: EditCardsProps) {
  const grid = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<string | null>(null)
  const [settling, setSettling] = useState<string | null>(null)
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [picked, setPicked] = useState<{ id: string; before: Layout } | null>(null)
  const [resizing, setResizing] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [chosen, setChosen] = useState<string[]>([])
  const resizeStart = useRef<{ y: number; height: number } | null>(null)
  const gesture = useRef<{ id: string; pointerId: number; x: number; y: number; grabX: number; grabY: number; scroller: HTMLElement | null; frame: number; stop: () => void } | null>(null)
  /* What the window listeners read: always this render's values */
  const now = useRef({ layout, zoom })
  now.current = { layout, zoom }
  useTravel(grid, JSON.stringify(layout), mode, drag ?? undefined, zoom)
  useEffect(() => {
    if (editing) return
    setPicked(null)
    setAdding(false)
    setChosen([])
  }, [editing])
  useEffect(() => () => gesture.current?.stop(), [])

  const shown = Object.values(layout).flatMap((column) => visible(column).map(({ id }) => id))
  const removed = DEFAULTS.filter((id) => !shown.includes(id))
  const change = (fn: (next: Layout) => void) =>
    setLayout((current) => {
      const next = clone(current)
      fn(next)
      return next
    })
  const entryOf = (next: Layout, id: string) => next[columnOf(next, id)]!.find((entry) => entry.id === id)!
  const cardOf = (id: string) => grid.current?.querySelector<HTMLElement>(`[data-edit-id="${id}"]`) ?? null

  /* Moves a card to a column, before another card or at its end */
  const moveTo = (id: string, column: string, before?: string) =>
    change((next) => {
      const from = next[columnOf(next, id)]!
      const [entry] = from.splice(from.findIndex((other) => other.id === id), 1)
      const target = next[column]!
      const index = before ? target.findIndex((other) => other.id === before) : target.length
      target.splice(index < 0 ? target.length : index, 0, entry!)
    })

  const position = (id: string, from = layout) => {
    const column = columnOf(from, id)
    return `column ${Object.keys(from).indexOf(column) + 1}, position ${visible(from[column]!).findIndex((entry) => entry.id === id) + 1}`
  }

  /* ---------- Moving: the top handle ---------- */
  /* The lifted card is drawn where the finger holds it, measured from its slot as it is now */
  const place = () => {
    const g = gesture.current
    const card = g && cardOf(g.id)
    if (!g || !card) return
    const slot = card.getBoundingClientRect()
    card.style.setProperty('--drag-x', `${(g.x - g.grabX - slot.left) / now.current.zoom}px`)
    card.style.setProperty('--drag-y', `${(g.y - g.grabY - slot.top) / now.current.zoom}px`)
  }
  useLayoutEffect(place)

  /* Where the card would land: the column nearest its middle, and in it, before the first card whose middle is below
     the lifted card's middle, counted as if the lifted card had already left (so the answer never flips back and forth) */
  const aim = () => {
    const g = gesture.current
    const root = grid.current
    const card = g && cardOf(g.id)
    if (!g || !root || !card) return
    const { layout: current, zoom: k } = now.current
    const me = entryOf(current, g.id)
    const cx = g.x - g.grabX + (card.offsetWidth * k) / 2
    const cy = g.y - g.grabY + (HEIGHTS[me.size] * k) / 2
    let best: HTMLElement | null = null
    let distance = Infinity
    for (const column of root.querySelectorAll<HTMLElement>('[data-edit-column]')) {
      const box = column.getBoundingClientRect()
      const d = cx < box.left ? box.left - cx : cx > box.right ? cx - box.right : 0
      if (d < distance) [best, distance] = [column, d]
    }
    if (!best) return
    const column = best.dataset.editColumn!
    let y = best.getBoundingClientRect().top
    let before: string | undefined
    for (const other of visible(current[column]!)) {
      if (other.id === g.id) continue
      const height = HEIGHTS[other.size] * k
      if (cy < y + height / 2) {
        before = other.id
        break
      }
      y += height + GAP * k
    }
    const from = columnOf(current, g.id)
    const list = visible(current[from]!)
    if (from === column && list[list.findIndex((entry) => entry.id === g.id) + 1]?.id === before) return
    moveTo(g.id, column, before)
  }

  /* Near an edge the overview scrolls, faster the closer the finger is */
  const scroll = () => {
    const g = gesture.current
    if (!g) return
    const edge = 56
    const box = g.scroller?.getBoundingClientRect()
    const top = Math.max(box?.top ?? 0, 0)
    const bottom = Math.min(box?.bottom ?? innerHeight, innerHeight)
    const dy = g.y < top + edge ? -Math.min(18, Math.ceil((top + edge - g.y) / 3)) : g.y > bottom - edge ? Math.min(18, Math.ceil((g.y - bottom + edge) / 3)) : 0
    if (dy) {
      const before = g.scroller ? g.scroller.scrollTop : scrollY
      if (g.scroller) g.scroller.scrollTop += dy
      else scrollBy(0, dy)
      if ((g.scroller ? g.scroller.scrollTop : scrollY) !== before) {
        place()
        aim()
      }
    }
    g.frame = requestAnimationFrame(scroll)
  }

  /* While the layout is edited, a document-wide touchmove listener that can refuse the move is in place before any
     finger lands (1.0.0-alpha.21). iOS decides when a touch starts whether its moves may be cancelled; a listener added
     on pointerdown came too late, and in the App shell's frames, drawn scaled, the handle's touch-action region did not
     follow the scale on the iPad: the frame scrolled under the finger and the drag was cancelled */
  useEffect(() => {
    if (!editing) return
    const hold = (event: TouchEvent) => {
      if ((gesture.current || resizeStart.current) && event.cancelable) event.preventDefault()
    }
    /* A finger landing on a handle of this grid never starts a scroll: refused at touchstart, the handle keeps its
       pointer events (the handles have no click of their own) */
    const grab = (event: TouchEvent) => {
      const target = event.target instanceof Element ? event.target : null
      if (event.cancelable && target?.closest('[data-handle]') && grid.current?.contains(target)) event.preventDefault()
    }
    document.addEventListener('touchmove', hold, { passive: false })
    document.addEventListener('touchstart', grab, { passive: false })
    return () => {
      document.removeEventListener('touchmove', hold)
      document.removeEventListener('touchstart', grab)
    }
  }, [editing])

  const onMoveDown = (id: string) => (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || gesture.current) return
    const card = cardOf(id)
    if (!card) return
    event.preventDefault()
    card.getAnimations().forEach((animation) => animation.cancel())
    const slot = card.getBoundingClientRect()
    const root = grid.current!
    const pointerId = event.pointerId
    try {
      root.setPointerCapture(pointerId)
    } catch {
      /* A pointer the browser no longer knows: the window still hears it */
    }
    const move = (e: globalThis.PointerEvent) => {
      const g = gesture.current
      if (!g || e.pointerId !== g.pointerId) return
      g.x = e.clientX
      g.y = e.clientY
      place()
      aim()
    }
    const up = (e: globalThis.PointerEvent) => {
      if (e.pointerId === pointerId) drop()
    }
    /* Older iPads scroll the page under a finger unless the move is refused while a card is held */
    const hold = (e: TouchEvent) => e.cancelable && e.preventDefault()
    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      window.removeEventListener('touchmove', hold)
      cancelAnimationFrame(gesture.current?.frame ?? 0)
      try {
        if (root.hasPointerCapture(pointerId)) root.releasePointerCapture(pointerId)
      } catch {
        /* already released */
      }
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    window.addEventListener('touchmove', hold, { passive: false })
    gesture.current = { id, pointerId, x: event.clientX, y: event.clientY, grabX: event.clientX - slot.left, grabY: event.clientY - slot.top, scroller: scrollerOf(card), frame: 0, stop }
    gesture.current.frame = requestAnimationFrame(scroll)
    setPicked(null)
    setDrag(id)
  }
  /* Dropped, the card glides from the pointer into its slot on the expressive spring and comes back down */
  const drop = () => {
    const g = gesture.current
    if (!g) return
    g.stop()
    gesture.current = null
    setDrag(null)
    setSettling(g.id)
    clearTimeout(settleTimer.current)
    settleTimer.current = setTimeout(() => {
      setSettling(null)
      const card = cardOf(g.id)
      card?.style.removeProperty('--drag-x')
      card?.style.removeProperty('--drag-y')
    }, SETTLE)
    onAnnounce(`${CARDS[g.id]!.title} dropped at ${position(g.id, now.current.layout)}.`)
  }

  /* Keyboard: Space picks the card up and drops it, the arrow keys move it, Escape puts it back */
  const onMoveKey = (id: string) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const title = CARDS[id]!.title
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (picked?.id === id) {
        setPicked(null)
        onAnnounce(`${title} dropped at ${position(id)}.`)
      } else {
        setPicked({ id, before: clone(layout) })
        onAnnounce(`${title} picked up. Use the arrow keys to move it, Space to drop it, Escape to cancel.`)
      }
      return
    }
    if (picked?.id !== id) return
    if (event.key === 'Escape') {
      event.preventDefault()
      const before = picked.before
      setLayout(() => before)
      setPicked(null)
      onAnnounce(`Moving ${title} canceled.`)
      return
    }
    const columns = Object.keys(layout)
    const column = columnOf(layout, id)
    const list = visible(layout[column]!)
    const index = list.findIndex((entry) => entry.id === id)
    if (event.key === 'ArrowUp' && index > 0) moveTo(id, column, list[index - 1]!.id)
    else if (event.key === 'ArrowDown' && index < list.length - 1) moveTo(id, column, list[index + 2]?.id)
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      const target = columns[columns.indexOf(column) + (event.key === 'ArrowLeft' ? -1 : 1)]
      if (!target) return
      moveTo(id, target, visible(layout[target]!)[index]?.id)
    } else return
    event.preventDefault()
    requestAnimationFrame(() => {
      cardOf(id)?.querySelector<HTMLElement>('[data-handle="move"]')?.focus()
      onAnnounce(`${title} moved to ${position(id, now.current.layout)}.`)
    })
  }

  /* ---------- Resizing: the bottom handle steps through the sizes the card offers ---------- */
  const setSize = (id: string, size: Size) => change((next) => void (entryOf(next, id).size = size))
  const onResizeDown = (entry: Entry) => (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    resizeStart.current = { y: event.clientY, height: HEIGHTS[entry.size] }
    setResizing(entry.id)
  }
  const onResizeMove = (entry: Entry) => (event: PointerEvent<HTMLButtonElement>) => {
    if (!resizeStart.current) return
    const target = resizeStart.current.height + (event.clientY - resizeStart.current.y) / zoom
    const sizes = CARDS[entry.id]!.sizes
    const best = sizes.reduce((a, b) => (Math.abs(HEIGHTS[b] - target) < Math.abs(HEIGHTS[a] - target) ? b : a), sizes[0]!)
    if (best !== entry.size) setSize(entry.id, best)
  }
  const onResizeUp = () => {
    resizeStart.current = null
    setResizing(null)
  }
  const onResizeKey = (entry: Entry) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const sizes = CARDS[entry.id]!.sizes
    const step = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0
    if (!step) return
    event.preventDefault()
    const next = sizes[sizes.indexOf(entry.size) + step]
    if (next) setSize(entry.id, next)
  }
  const aligned = (id: string) => {
    const column = columnOf(layout, id)
    const mine = bottomOf(layout[column]!)
    return Object.keys(layout).some((other) => other !== column && visible(layout[other]!).length > 0 && bottomOf(layout[other]!) === mine)
  }

  /* ---------- Removing, and bringing back from New element ---------- */
  const remove = (id: string) => {
    change((next) => void (entryOf(next, id).hidden = true))
    onAnnounce(`${CARDS[id]!.title} removed from the overview.`)
  }
  const addChosen = () => {
    change((next) => {
      for (const id of chosen) {
        const column = Object.keys(next).find((key) => next[key]!.some((other) => other.id === id))
        const from = column ? next[column]! : null
        const entry = from ? from.splice(from.findIndex((other) => other.id === id), 1)[0]! : { id, size: CARDS[id]!.sizes[0]! }
        next[shortest(next)]!.push({ ...entry, hidden: false })
      }
    })
    onAnnounce(chosen.length === 1 ? `${CARDS[chosen[0]!]!.title} added.` : `${chosen.length} modules added.`)
    setChosen([])
    setAdding(false)
  }

  const newIn = editing ? shortest(layout) : null
  return (
    <div ref={grid} className={className} style={style}>
      {Object.entries(layout).map(([column, entries]) => (
        <div key={column} className="edit-column" data-edit-column={column}>
          {visible(entries).map((entry) => {
            const card = CARDS[entry.id]!
            const Body = BODIES[entry.id]!
            const lifted = drag === entry.id
            return (
              <div
                key={entry.id}
                className="edit-card"
                data-edit-id={entry.id}
                data-size={entry.size}
                data-editing={editing || undefined}
                data-lifted={lifted || undefined}
                data-settling={settling === entry.id || undefined}
              >
                {lifted && <span className="edit-placeholder" />}
                <div className="edit-body">
                  {/* The card as the overview shows it; while the layout is edited it only moves */}
                  <div className="edit-scale" inert={editing || !interactive || undefined}>
                    <Body size={entry.size.toLowerCase()} />
                  </div>
                  {editing && (
                    <Handles
                      title={card.title}
                      size={entry.size}
                      preview={{ move: lifted || picked?.id === entry.id ? 'on' : undefined, resize: resizing === entry.id ? 'on' : undefined }}
                      guide={resizing === entry.id ? <Guide size={entry.size} aligned={aligned(entry.id)} /> : undefined}
                      onRemove={() => remove(entry.id)}
                      moveProps={{
                        'aria-pressed': picked?.id === entry.id,
                        onKeyDown: onMoveKey(entry.id),
                        onPointerDown: onMoveDown(entry.id),
                      }}
                      resizeProps={
                        card.sizes.length > 1
                          ? {
                              onPointerDown: onResizeDown(entry),
                              onPointerMove: onResizeMove(entry),
                              onPointerUp: onResizeUp,
                              onPointerCancel: onResizeUp,
                              onFocus: () => setResizing(entry.id),
                              onBlur: () => setResizing(null),
                              onKeyDown: onResizeKey(entry),
                            }
                          : { disabled: true, hidden: true }
                      }
                    />
                  )}
                </div>
              </div>
            )
          })}
          {newIn === column && (
            /* New element: a card of size S at the foot of the shortest column, only while the layout is edited */
            <div className="edit-card edit-new-slot">
              <div className="edit-scale">
                {adding ? (
                  <Card
                    titleAs="h3"
                    title="New element"
                    className="new-element"
                    data-open=""
                    actions={<IconButton size="small" label="Close" icon={<CloseIcon />} onClick={() => (setAdding(false), setChosen([]))} />}
                    footer={
                      <div className="new-element-foot">
                        <CardLink href={customizeHref}>Customize overview</CardLink>
                        {chosen.length > 0 && (
                          <Button size="small" iconEnd={<AddIcon />} onClick={addChosen}>
                            {chosen.length === 1 ? 'Add module' : `Add ${chosen.length} modules`}
                          </Button>
                        )}
                      </div>
                    }
                  >
                    <p className="new-element-lead">Choose one or more modules for your overview.</p>
                    <div className="new-element-list" role="group" aria-label="Modules">
                      {[...OPTIONAL, ...removed].map((id, index) => {
                        const [Icon, line] = INFO[id]!
                        const added = shown.includes(id)
                        const on = chosen.includes(id)
                        const toggle = () => !added && setChosen((current) => (on ? current.filter((other) => other !== id) : [...current, id]))
                        return (
                          <div key={id} style={{ display: 'contents' }}>
                            {index === OPTIONAL.length && <p className="new-element-section">Removed from your overview</p>}
                            <div
                              className="new-element-option"
                              role="checkbox"
                              aria-checked={added || on}
                              aria-disabled={added || undefined}
                              tabIndex={added ? -1 : 0}
                              data-added={added || undefined}
                              data-chosen={on || undefined}
                              style={{ ['--i' as string]: index }}
                              onClick={toggle}
                              onKeyDown={(event) => {
                                if (event.key === ' ' || event.key === 'Enter') {
                                  event.preventDefault()
                                  toggle()
                                }
                              }}
                            >
                              <span className="new-element-icon">
                                <Icon />
                              </span>
                              <span>
                                <span className="new-element-name">{CARDS[id]!.title}</span>
                                <span className="new-element-line">{line}</span>
                              </span>
                              <span className="new-element-mark">{added || on ? <InStockIcon key="on" /> : <AddCircleIcon key="off" />}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </Card>
                ) : (
                  <Card titleAs="h3" title="New element" size="s" className="new-element">
                    <button type="button" className="new-element-add" onClick={() => setAdding(true)}>
                      <span className="new-element-plus">
                        <AddIcon aria-hidden="true" />
                      </span>
                      Add a module to your overview
                    </button>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Editor() {
  const toast = useToast()
  const [mode, setMode] = useState<Mode>('desktop')
  /* Fit to width: the whole canvas laid out at its real size and drawn smaller with one scale, like the product's own
     fit; nothing reflows (a transform, not CSS zoom, which made Safari re-measure the cards at the zoomed size) */
  const [fit, setFit] = useState(false)
  const frame = useRef<HTMLDivElement>(null)
  const [room, setRoom] = useState(0)
  useLayoutEffect(() => {
    const el = frame.current
    if (!el) return
    const measure = () => setRoom(el.clientWidth)
    measure()
    const watch = new ResizeObserver(measure)
    watch.observe(el)
    return () => watch.disconnect()
  }, [])
  const canvasWidth = mode === 'tablet' ? 820 : 32 + 3 * 370 + 2 * 20 + 32
  const zoom = fit && room ? Math.min(1, room / canvasWidth) : 1
  /* The canvas's real height (a transform does not change it), so the fitted box is exactly the drawn size */
  const canvas = useRef<HTMLDivElement>(null)
  const [canvasHeight, setCanvasHeight] = useState(0)
  useLayoutEffect(() => {
    const el = canvas.current
    if (!el) return
    const measure = () => setCanvasHeight(el.offsetHeight)
    measure()
    const watch = new ResizeObserver(measure)
    watch.observe(el)
    return () => watch.disconnect()
  }, [])
  const [savedBy, setSavedBy] = useState<Record<Mode, Layout>>(() => ({ desktop: DEFAULTS_FOR.desktop(), tablet: DEFAULTS_FOR.tablet() }))
  const saved = savedBy[mode]
  const setSaved = (layout: Layout) => setSavedBy((current) => ({ ...current, [mode]: layout }))
  const [draft, setDraft] = useState<Layout | null>(null)
  const [ask, setAsk] = useState<'reset' | 'discard' | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const editing = draft !== null
  const layout = draft ?? saved
  const dirty = editing && JSON.stringify(draft) !== JSON.stringify(saved)

  /* ---------- The bar ---------- */
  const enter = () => {
    setDraft(clone(saved))
    setAnnouncement('Editing layout. Drag a card by its top handle. Pull the bottom handle to change its size.')
  }
  const leave = () => setDraft(null)
  const save = () => {
    const previous = saved
    setSaved(draft!)
    leave()
    toast({ message: 'Layout saved', action: { label: 'Undo', onClick: () => setSaved(previous) } })
  }

  return (
    <div className="edit-demo">
      <div className="edit-demo-top">
        <SegmentedControl
          legend="Screen"
          hideLegend
          size="small"
          value={mode}
          onValueChange={(value) => !editing && setMode(value as Mode)}
          disabled={editing}
          options={[
            { value: 'desktop', label: 'Desktop · 1440' },
            { value: 'tablet', label: 'Tablet · 820' },
          ]}
        />
        <label className="edit-fit">
          <input type="checkbox" checked={fit} onChange={(event) => setFit(event.target.checked)} />
          Fit to width
        </label>
        {!editing && (
          <Button variant="outlined" icon={<EditIcon />} onClick={enter}>
            Edit layout
          </Button>
        )}
      </div>
      {/* At 1:1 the grid is wider than most pages: the frame scrolls sideways, the cards are never scaled */}
      <div ref={frame} className="edit-frame" data-scroll-region tabIndex={zoom < 1 ? undefined : 0} aria-label={zoom < 1 ? undefined : 'Overview, scrolls sideways'}>
      {/* Fitted, the canvas keeps its real layout and is drawn smaller as one picture; this box takes the drawn size */}
      <div className="edit-fit-box" style={zoom < 1 ? { width: canvasWidth * zoom, height: canvasHeight * zoom } : undefined}>
      <div ref={canvas} className="edit-canvas" data-mode={mode} style={{ ['--cols' as string]: GRIDS[mode].columns.length, ['--col' as string]: `${GRIDS[mode].width}px`, ...(zoom < 1 ? { transform: `scale(${zoom})`, transformOrigin: '0 0' } : {}) }}>
      <p className="edit-demo-title">Overview</p>
      <EditCards
        layout={layout}
        setLayout={(update) => setDraft((current) => (current ? update(current) : current))}
        editing={editing}
        zoom={zoom}
        mode={mode}
        onAnnounce={setAnnouncement}
      />
      </div>
      </div>
      </div>
      {editing && (
        <div className="edit-bar" role="toolbar" aria-label="Edit layout">
          <p className="edit-bar-text">
            <strong>Editing layout</strong>
            <span>Drag a card by its top handle. Pull the bottom handle to change its size.</span>
          </p>
          <div className="edit-bar-actions">
            <button type="button" className="edit-reset" onClick={() => setAsk('reset')}>
              Reset to default
            </button>
            <Button size="small" variant="outlined" className="edit-cancel" onClick={() => (dirty ? setAsk('discard') : leave())}>
              Cancel
            </Button>
            <Button size="small" disabled={!dirty} onClick={save}>
              Save layout
            </Button>
          </div>
        </div>
      )}
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      <Dialog
        open={ask !== null}
        onOpenChange={(open) => !open && setAsk(null)}
        title={ask === 'reset' ? 'Reset to default layout?' : 'Discard changes?'}
        description={ask === 'reset' ? 'All cards go back to their original position and size. Changes you have not saved will be lost.' : 'The changes you made to the layout will be lost.'}
        actions={
          <>
            <Button variant="text" onClick={() => setAsk(null)}>
              {ask === 'reset' ? 'Cancel' : 'Keep editing'}
            </Button>
            <Button
              onClick={() => {
                if (ask === 'reset') setDraft(DEFAULTS_FOR[mode]())
                else leave()
                setAsk(null)
              }}
            >
              {ask === 'reset' ? 'Reset' : 'Discard'}
            </Button>
          </>
        }
      />
    </div>
  )
}

export default function EditGrid() {
  return (
    <ToastProvider label="Layout notifications">
      <Editor />
    </ToastProvider>
  )
}
