import { useEffect, useRef, useState, type ComponentType, type CSSProperties } from 'react'
import { designedOverview, layoutFor, placeCards, readingOrder, type GridMetrics } from '../lib/overview-grid.ts'
import BalanceCard from './BalanceCard.tsx'
import DeliveriesCard from './DeliveriesCard.tsx'
import InventoryCard from './InventoryCard.tsx'
import OrdersCard from './OrdersCard.tsx'
import RecurringCard from './RecurringCard.tsx'
import ShipmentsCard from './ShipmentsCard.tsx'
import './cards.css'

const cards: Record<string, ComponentType<{ size?: any }>> = {
  orders: OrdersCard,
  deliveries: DeliveriesCard,
  shipments: ShipmentsCard,
  inventory: InventoryCard,
  balance: BalanceCard,
  recurring: RecurringCard,
}

/* The product reads the window’s size class. Inside a documentation page the overview reads its own width instead,
   with the same rule: a column for every 320 px a card needs, up to three. The rule is a container query (cards.css),
   so the page is drawn with the right columns from its first frame, before any script runs: the cards never start in
   three squeezed columns and move when the script measures. Each layout (one, two and three columns) is written here
   once, at build time, as grid lines for every card; the cards stay in reading order in the document. */
const COUNTS = [1, 2, 3] as const

function gridFor(metrics: GridMetrics) {
  const rows: Record<number, string> = {}
  const place: Record<string, Record<string, string | number>> = {}
  for (const count of COUNTS) {
    const layout = layoutFor(count, designedOverview, metrics)
    const placed = placeCards(layout, 0, metrics)
    /* Every edge a card starts or ends on (its bottom plus the gap), as row lines; the tracks between them are fixed */
    const edges = [...new Set(placed.flatMap(({ y, height }) => [y, y + height + metrics.gap]))].sort((a, b) => a - b)
    rows[count] = edges.slice(1).map((edge, index) => `${edge - edges[index]!}px`).join(' ')
    layout.forEach((column, columnIndex) =>
      column.forEach((card, row) => {
        const box = placed.find(({ id }) => id === card.id)!
        place[card.id] ??= {}
        place[card.id]![`--col-${count}`] = columnIndex + 1
        place[card.id]![`--row-${count}`] = `${edges.indexOf(box.y) + 1} / ${edges.indexOf(box.y + box.height + metrics.gap) + 1}`
        /* The card's place in the entrance, row by row across the columns, as in the product */
        place[card.id]![`--i-${count}`] = row * layout.length + columnIndex
      }),
    )
  }
  return { rows, place }
}

export default function Overview({ metrics }: { metrics: GridMetrics }) {
  const frame = useRef<HTMLDivElement>(null)
  /* Set once the script runs: the cards' ids and the entrance wait for it */
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])
  /* A link to a card (#card-balance) lands on it once the script runs. The cards’ ids are written only then, so the
     browser finds no target in the first layout and stays at the top: there is one scroll, to where the card is. The
     card lands below the top bar by the page’s own scroll padding. */
  const landed = useRef(false)
  useEffect(() => {
    if (!ready || landed.current || !location.hash.startsWith('#card-')) return
    landed.current = true
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches
    requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' }))
  }, [ready])
  /* The product's entrance: the first time the overview shows, each card rises into place in reading order (440 ms,
     55 ms apart) and its tick bars draw from the left. In the product it runs on load; on a page of documentation it
     runs the first time the overview scrolls into view, then the class comes off after 1300 ms, as in the product.
     Until then the cards wait unseen in their final places (cards.css), so they are not drawn once, hidden and drawn
     again. Arriving from a card link (#card-deliveries) the page scrolls to the card: the cards are shown at once. */
  const [intro, setIntro] = useState(false)
  const [shown, setShown] = useState(false)
  const introDone = useRef(false)
  useEffect(() => {
    const element = frame.current
    if (!element || !ready || introDone.current) return
    if (location.hash.startsWith('#card-') || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      introDone.current = true
      setShown(true)
      return
    }
    let timer = 0
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting || introDone.current) return
      introDone.current = true
      observer.disconnect()
      setIntro(true)
      setShown(true)
      timer = window.setTimeout(() => setIntro(false), 1300)
    })
    observer.observe(element)
    return () => { observer.disconnect(); window.clearTimeout(timer) }
  }, [ready])
  /* A card that grows past its size, as Balance does when its Payment calendar opens, pushes the cards under it in
     its column down, as the product's columns do (1.0.0-alpha.18); before, they stayed where they were and the grown
     card covered them. The rows are fixed tracks, so the push is a shift of the cards below by what the card grew,
     and the overview grows by the longest column's shift. Like the product, they move at once, without animation. */
  const grid = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = grid.current
    if (!element || !ready) return
    const slots = [...element.querySelectorAll<HTMLElement>(':scope > .overview-slot')]
    const push = () => {
      const columns = new Map<number, HTMLElement[]>()
      for (const slot of slots) {
        const left = Math.round(slot.offsetLeft)
        columns.set(left, [...(columns.get(left) ?? []), slot])
      }
      let longest = 0
      for (const column of columns.values()) {
        let shift = 0
        for (const slot of column.sort((a, b) => a.offsetTop - b.offsetTop)) {
          const value = shift ? `0 ${shift}px` : ''
          if (slot.style.translate !== value) slot.style.translate = value
          const card = slot.firstElementChild as HTMLElement | null
          shift += Math.max(0, (card?.offsetHeight ?? 0) - Number(slot.dataset.height))
        }
        longest = Math.max(longest, shift)
      }
      const room = longest ? `${longest}px` : ''
      if (element.style.paddingBottom !== room) element.style.paddingBottom = room
    }
    const sizes = new ResizeObserver(push)
    sizes.observe(element)
    for (const slot of slots) if (slot.firstElementChild) sizes.observe(slot.firstElementChild)
    push()
    return () => sizes.disconnect()
  }, [ready])
  const { rows, place } = gridFor(metrics)
  const style = Object.fromEntries(COUNTS.map((count) => [`--rows-${count}`, rows[count]])) as CSSProperties
  return (
    <div ref={frame} className="overview-frame">
      <div ref={grid} className={['overview', intro && 'intro', shown && 'shown'].filter(Boolean).join(' ')} style={style}>
        {readingOrder(designedOverview, metrics).map(({ id, size }) => {
          const Card = cards[id]
          /* Each card can be reached by a link, from the search for instance: #card-deliveries */
          return Card ? (
            <div key={id} id={ready ? `card-${id}` : undefined} className="overview-slot" data-height={metrics.heights[size]} style={place[id] as CSSProperties}>
              <Card size={size} />
            </div>
          ) : null
        })}
      </div>
    </div>
  )
}
