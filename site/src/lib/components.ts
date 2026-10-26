/**
 * The components documented on the site, read from the package’s own build output: the API from api.json, the
 * weight from sizes.json. Pages add the demos and the guidance.
 *
 * A page documents one component. Some entry points of the package export several (card: Card, CardLink, CardScroll
 * and UnitMenu; search: SearchField and SearchResult); each of those has its own page, and they share the weight of
 * their entry point.
 */
import api from '@orbex/sonar-components/api.json'
import sizes from '@orbex/sonar-components/sizes.json'

export interface Prop { name: string; type: string; required: boolean; default?: string; description: string }
export interface Part { name: string; description: string; props: Prop[]; extends?: string }
export interface ComponentApi { entry: string; name?: string; behavior: 'native' | 'base-ui'; parts: Part[] }

export interface ComponentEntry {
  /** Name of the page: /components/{slug}/ */
  slug: string
  /** The package entry point it is imported from: @orbex/sonar-components/{entry} */
  entry: string
  title: string
  href: string
  /** The API of the entry point, narrowed to the parts this page documents */
  api: ComponentApi
  /** Gzipped bytes of the entry point’s script and styles */
  weight: number
  /** The other components that share the entry point, and so its weight */
  siblings: string[]
  /** One plain sentence for the catalog: what it is for, no code */
  summary: string
  /** A compound component, such as Menu: its parts are used as Menu.Item, Menu.Trigger */
  compound: boolean
  /** What to import: the compound’s name, or the parts this page documents */
  imports: string[]
}

interface PageDefinition {
  slug: string
  entry?: string
  title: string
  /** The parts of the entry point this page documents; all of them when left out */
  parts?: string[]
  summary: string
}

/* Navigation order: actions, signals, inputs, feedback, overlays; then the cards, the charts and search */
const pages: PageDefinition[] = [
  { slug: 'button', title: 'Button', summary: 'The action a screen or a card exists for, in four weights and two sizes.' },
  { slug: 'icon-button', title: 'Icon button', summary: 'A round button that shows only an icon, with a name for screen readers.' },
  { slug: 'badge', title: 'Badge', summary: 'A small count or dot on a navigation item, an icon button or a tab.' },
  { slug: 'status', title: 'Status', summary: 'The state of an order, a delivery or an invoice, as a dot or a chip.' },
  { slug: 'switch', title: 'Switch', summary: 'Turns a setting on or off at once. It works in forms and without JavaScript.' },
  { slug: 'checkbox', title: 'Checkbox', summary: 'A choice that is confirmed later, alone or in a list where all can be selected at once.' },
  { slug: 'segmented-control', title: 'Segmented control', summary: 'A choice of one among a few options, shown side by side.' },
  { slug: 'field', title: 'Text field and select', summary: 'Text fields and selects, each with its label, help and error.' },
  { slug: 'notice', title: 'Notice', summary: 'A message inside the page that stays until the situation changes.' },
  { slug: 'toast', title: 'Toast', summary: 'Short feedback on something that just happened, with an undo when it helps.' },
  { slug: 'menu', title: 'Menu', summary: 'A list of actions or choices that opens from a button.' },
  { slug: 'tooltip', title: 'Tooltip', summary: 'A short label shown on hover and focus, mostly for icon buttons.' },
  { slug: 'dialog', title: 'Dialog', summary: 'A window that asks for a decision, or a side panel or a bottom sheet.' },
  { slug: 'scroll-area', title: 'Scroll area', summary: 'Content that scrolls inside a fixed height, with a thin indicator instead of a scrollbar.' },
  { slug: 'card', entry: 'card', parts: ['Card'], title: 'Card', summary: 'The unit of the overview: a title, a summary figure, content and a way to the full page.' },
  { slug: 'card-link', entry: 'card', parts: ['CardLink'], title: 'Card link', summary: 'The link at the foot of a card to the page it summarizes.' },
  { slug: 'card-scroll', entry: 'card', parts: ['CardScroll'], title: 'Card scroll', summary: 'The list in a card that scrolls first when the card’s size leaves no room.' },
  { slug: 'unit-menu', entry: 'card', parts: ['UnitMenu'], title: 'Unit menu', summary: 'The unit a card’s figures are shown in, as a pill that opens a menu.' },
  { slug: 'tick-bar', title: 'Tick bar', summary: 'A share of a whole as a row of fine ticks.' },
  { slug: 'ring-chart', title: 'Ring chart', summary: 'Parts of a whole as a ring of ticks.' },
  { slug: 'trend-chart', title: 'Trend chart', summary: 'A daily series as a line, with its running total.' },
  { slug: 'chart-legend', title: 'Chart legend', summary: 'The key to a chart’s colors.' },
  { slug: 'search-field', entry: 'search', parts: ['SearchField'], title: 'Search field', summary: 'A search box whose results open under it as people type.' },
  { slug: 'search-result', entry: 'search', parts: ['SearchResult'], title: 'Search result', summary: 'One row of results: an icon, a title, a line under it and a status.' },
]

const apis = api.components as ComponentApi[]

const toEntry = ({ slug, entry = slug, title, parts, summary }: PageDefinition): ComponentEntry => {
  const found = apis.find((candidate) => candidate.entry === entry)
  if (!found) throw new Error(`No API for ${entry}`)
  const shown = parts ? found.parts.filter(({ name }) => parts.includes(name)) : found.parts
  if (parts && shown.length !== parts.length) throw new Error(`Missing parts of ${entry}: ${parts.join(', ')}`)
  const size = sizes.components.find(({ name }) => name === entry)
  const siblings = pages.filter((page) => (page.entry ?? page.slug) === entry && page.slug !== slug).map((page) => page.title)
  const compound = Boolean(found.name) && !found.parts.some(({ name }) => name === found.name)
  const imports = compound ? [found.name!] : shown.map(({ name }) => name)
  return { slug, entry, title, href: `/components/${slug}/`, api: { ...found, parts: shown }, weight: size?.total ?? 0, siblings, summary, compound, imports }
}

/** Every component, in the order of the navigation */
export const componentEntries: ComponentEntry[] = pages.map(toEntry)

export const componentEntry = (slug: string) => {
  const found = componentEntries.find((candidate) => candidate.slug === slug)
  if (!found) throw new Error(`Unknown component ${slug}`)
  return found
}

/** Gzipped bytes of every entry point of the package, each counted once */
export const packageWeight = sizes.components.reduce((sum, { total }) => sum + total, 0)

export const formatWeight = (bytes: number) => `${(bytes / 1024).toFixed(1)} KB`
