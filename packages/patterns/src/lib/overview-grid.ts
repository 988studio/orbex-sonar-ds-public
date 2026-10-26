/**
 * The overview grid of Sonar-DB: how cards are placed at every window size.
 *
 * Pure functions with every measure passed in, so the same code runs at build time and in the browser without
 * shipping the token data. It moves to the components package with the dashboard grid.
 */

export type CardSize = 's' | 'm' | 'l' | 'xl'

export interface Card {
  id: string
  title: string
  size: CardSize
}

export interface SizeClassMetrics {
  name: string
  /** Window width where the class starts */
  min: number
  columns: number
  margin: number
  topBar: number
  /** Phones navigate from a bottom bar, tablets from a rail, desktops from a sidebar that collapses to the rail */
  navigation: 'bar' | 'rail' | 'sidebar'
}

export interface GridMetrics {
  gap: number
  sidebar: number
  rail: number
  bottomBar: number
  heights: Record<CardSize, number>
  classes: SizeClassMetrics[]
}

/** The desktop layout as designed: three columns, read top to bottom. */
export const designedOverview: Card[][] = [
  [
    { id: 'orders', title: 'Orders', size: 'm' },
    { id: 'deliveries', title: 'Deliveries', size: 'l' },
  ],
  [
    { id: 'shipments', title: 'Daily shipments', size: 'xl' },
    { id: 'inventory', title: 'Inventory', size: 's' },
  ],
  [
    { id: 'balance', title: 'Balance', size: 'm' },
    { id: 'recurring', title: 'Recurring orders', size: 'l' },
  ],
]

export const sizeClassAt = (width: number, metrics: GridMetrics): SizeClassMetrics =>
  metrics.classes.findLast(({ min }) => width >= min) ?? metrics.classes[0]

/** Width the navigation takes from the window beside the content */
export function navigationWidth(sizeClass: SizeClassMetrics, metrics: GridMetrics, sidebarOpen: boolean): number {
  if (sizeClass.navigation === 'bar') return 0
  if (sizeClass.navigation === 'rail') return metrics.rail
  return sidebarOpen ? metrics.sidebar : metrics.rail
}

/** Column width: what is left of the window, shared by the columns and rounded down to whole pixels */
export function columnWidth(width: number, sizeClass: SizeClassMetrics, metrics: GridMetrics, sidebarOpen: boolean): number {
  const available = width - navigationWidth(sizeClass, metrics, sidebarOpen) - 2 * sizeClass.margin - (sizeClass.columns - 1) * metrics.gap
  return Math.floor(available / sizeClass.columns)
}

const columnHeight = (column: Card[], metrics: GridMetrics) =>
  column.reduce((height, card, index) => height + metrics.heights[card.size] + (index ? metrics.gap : 0), 0)

/** Cards in the order a person reads the designed layout: by how far down they start, then left to right. */
export function readingOrder(columns: Card[][], metrics: GridMetrics): Card[] {
  const placed = columns.flatMap((column, columnIndex) => {
    let top = 0
    return column.map((card) => {
      const item = { card, top, columnIndex }
      top += metrics.heights[card.size] + metrics.gap
      return item
    })
  })
  return placed.sort((a, b) => a.top - b.top || a.columnIndex - b.columnIndex).map(({ card }) => card)
}

/**
 * The layout for a number of columns. The designed layout is used as it is; any other count is derived from it:
 * cards in reading order, each into the shortest column (the leftmost, when two are level).
 */
export function layoutFor(count: number, designed: Card[][], metrics: GridMetrics): Card[][] {
  if (count === designed.length) return designed
  const columns: Card[][] = Array.from({ length: count }, () => [])
  for (const card of readingOrder(designed, metrics)) {
    const lowest = (index: number) => columnHeight(columns[index], metrics) + (columns[index].length ? metrics.gap : 0)
    const target = columns.reduce((shortest, _, index) => (lowest(index) < lowest(shortest) ? index : shortest), 0)
    columns[target].push(card)
  }
  return columns
}

export interface PlacedCard extends Card {
  x: number
  y: number
  width: number
  height: number
  /** Position in the reading order of the designed layout, from 1: the same card keeps its number at every width */
  order: number
}

/** Every card’s box inside the content area, in window pixels */
export function placeCards(columns: Card[][], width: number, metrics: GridMetrics, designed = designedOverview): PlacedCard[] {
  const order = new Map(readingOrder(designed, metrics).map((card, index) => [card.id, index + 1]))
  return columns.flatMap((column, columnIndex) => {
    let y = 0
    return column.map((card) => {
      const height = metrics.heights[card.size]
      const placed = { ...card, x: columnIndex * (width + metrics.gap), y, width, height, order: order.get(card.id)! }
      y += height + metrics.gap
      return placed
    })
  })
}

/* ---------- 1.1 (pending #12): the product's fluid columns, as v38 fluid.css ----------
   The documentation draws the desktop as the fixed 1440 canvas; an app that is the window sizes its columns from the
   window: desktop col = floor((width − sidebar − 65 − 2 × 20) / 3), 370 at 1440 with the sidebar open, 425 folded;
   tablet col = floor((width − 60 rail − 2 × 24 − 20) / 2), 346 at 820. (v38's 4-column layout from 2048 px and
   5-column from 2650 px are not built yet.) */
export const desktopColumn = (windowWidth: number, sidebarOpen: boolean): number => Math.floor((windowWidth - (sidebarOpen ? 224 : 60) - 65 - 2 * 20) / 3)
export const tabletColumn = (windowWidth: number): number => Math.floor((windowWidth - 60 - 48 - 20) / 2)
