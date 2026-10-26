import { componentEntries } from './components.ts'

export interface NavItem {
  label: string
  href: string
  /** One plain sentence for the section’s index and the introduction */
  description?: string
  /** A file rather than a page, such as /llms.txt: listed in the navigation, left out of the previous and next links */
  file?: boolean
}

export interface NavSection {
  label: string
  /** The section’s index page, which lists its pages as cards. Get started has none: its first page leads it */
  href?: string
  description: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    label: 'Get started',
    description: 'What the system is, and how to install the tokens and the components in an app.',
    items: [
      { label: 'Introduction', href: '/', description: 'What Orbex Sonar-DB is, what it is built on and what this release contains.' },
      { label: 'Installation', href: '/get-started/installation/', description: 'Install the packages, set the cascade layers, import the tokens and use a component.' },
    ],
  },
  {
    label: 'Foundations',
    href: '/foundations/',
    description: 'The principles and the accessibility commitments, and the tokens every component is drawn with.',
    items: [
      { label: 'Principles', href: '/foundations/principles/', description: 'What the system optimizes for, and how tokens are named, versioned and tested.' },
      { label: 'Accessibility', href: '/foundations/accessibility/', description: 'WCAG 2.2 AA: contrast, focus, target sizes, motion, keyboard and screen readers.' },
      { label: 'Color', href: '/foundations/color/', description: 'The palette, the roles for text, surfaces and states in both themes, and the contrast of every pair.' },
      { label: 'Typography', href: '/foundations/typography/', description: 'Three families and the type roles of the product, from figures in a chart to page titles.' },
      { label: 'Icons', href: '/foundations/icons/', description: 'The marks the components draw, the Material Symbols the product uses, their sizes, weight and how to import them.' },
      { label: 'Spacing', href: '/foundations/spacing/', description: 'The spacing scale, and how cards and their content line up.' },
      { label: 'Shape', href: '/foundations/shape/', description: 'Corner radii, from the tightest to fully round, and what each is for.' },
      { label: 'Elevation', href: '/foundations/elevation/', description: 'Shadows for cards, menus, panels and dragged cards, in both themes.' },
      { label: 'Motion', href: '/foundations/motion/', description: 'Springs and fades: durations, easing, and what changes with reduced motion.' },
    ],
  },
  {
    label: 'Layout',
    href: '/layout/',
    description: 'Window size classes, the grid of the overview, and how navigation changes from phone to desktop.',
    items: [
      { label: 'Breakpoints and grid', href: '/layout/grid/', description: 'Five size classes, their columns, gaps and margins, with a simulator for any width.' },
      { label: 'Navigation by device', href: '/layout/navigation/', description: 'A bottom bar on phones, a rail on tablets and a sidebar that collapses on desktops.' },
    ],
  },
  {
    label: 'Components',
    href: '/components/',
    description: 'React components, native HTML first: how they are built and tested, and each one live with its API.',
    items: componentEntries.map(({ title, href, summary }) => ({ label: title, href, description: summary })),
  },
  {
    label: 'Patterns',
    href: '/patterns/',
    description: 'The overview of Sonar-DB and what it is made of: its cards, charts, search, editing and feedback, live.',
    items: [
      { label: 'Overview', href: '/patterns/overview/', description: 'The six cards of the default overview on the grid, live.' },
      { label: 'Cards', href: '/patterns/cards/', description: 'Anatomy, the six cards in every size, their states while the overview is edited, and their rules.' },
      { label: 'Charts', href: '/patterns/charts/', description: 'Tick bars, rings and the trend chart in the cards, with the legend they share.' },
      { label: 'Search', href: '/patterns/search/', description: 'Searching orders, deliveries and invoices in plain words, with results as people type.' },
      { label: 'Editing the overview', href: '/patterns/editing/', description: 'Showing, ordering and sizing cards, on phones and on desktops.' },
      { label: 'Panels', href: '/patterns/panels/', description: 'The six panels the overview opens, side by side and live: what opens each, its parts, and how it opens on each device.' },
      { label: 'Feedback', href: '/patterns/feedback/', description: 'Toasts, confirmations, notices and loading states, and when to use each.' },
      { label: 'App shell', href: '/patterns/app-shell/', description: 'The sidebar and its rail, the top bar, the phone bars and how the 1440 canvas fits a window, live.' },
      { label: 'AI assistant', href: '/patterns/assistant/', description: 'The chat with the Orbex assistant: a floating window on desktops, a bottom sheet on phones.' },
      { label: 'Customize overview', href: '/patterns/customize/', description: 'The sheet that shows or hides modules, with the basic set and layouts for a role.' },
      { label: 'Unbuilt modules', href: '/patterns/unbuilt/', description: 'The page for a section with no screen yet: what works and the way back.' },
    ],
  },
  {
    label: 'Resources',
    href: '/resources/',
    description: 'What changed in each release, files to download, the system for coding agents, and how to contribute.',
    items: [
      { label: 'Changelog', href: '/resources/changelog/', description: 'Every release, newest first: what was added, changed, fixed and deprecated.' },
      { label: 'Downloads', href: '/resources/downloads/', description: 'The tokens as CSS and JSON, and the API and sizes of every component as data.' },
      { label: 'llms.txt', href: '/llms.txt', description: 'The whole system in one text file, for language models and coding agents.', file: true },
      { label: 'Contributing', href: '/resources/contributing/', description: 'How tokens and components are proposed, built, tested and released.' },
    ],
  },
]

/** The section a page belongs to, for the breadcrumb, with the page the section’s name leads to */
export function sectionOf(path: string) {
  const section = navigation.find(({ items }) => items.some((item) => item.href === path))
  if (!section || path === '/') return undefined
  return { label: section.label, href: section.href ?? section.items[0]!.href }
}

/** Every page in reading order, section index pages first in their section, for the previous and next links */
export const readingOrder: { label: string; href: string }[] = navigation.flatMap(({ label, href, items }) => [
  ...(href ? [{ label, href }] : []),
  ...items.filter((item) => !item.file).map(({ label: itemLabel, href: itemHref }) => ({ label: itemLabel, href: itemHref })),
])
