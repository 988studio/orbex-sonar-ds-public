/**
 * The accessibility contract of the color roles. The test suite enforces it on every build,
 * and the documentation site prints it, so both always say the same thing.
 * WCAG 2.2: 4.5:1 for text (1.4.3), 3:1 for meaningful non-text marks and control boundaries (1.4.11).
 */
export interface ContrastRule {
  foreground: string
  /** Opaque roles, or a translucent role over the surface it sits on: `warning.container/surface.card` */
  backgrounds: string[]
  minimum: 3 | 4.5
}

/** Every opaque surface that carries text. */
export const TEXT_SURFACES = [
  'surface.card',
  'surface.page',
  'surface.raised',
  'surface.menu',
  'surface.container',
  'surface.container-low',
  'surface.well',
  'surface.hover',
  'surface.selected',
  'surface.search-head',
  'surface.search-active',
]

/** Text levels meant to be read. Placeholders are text too (WCAG 1.4.3 has no exception for them). */
export const READING_LEVELS = ['text.strong', 'text.default', 'text.secondary', 'text.muted', 'text.tertiary', 'text.placeholder']

/** Notices: the neutral container, and each tone's translucent tint over the card and the page it can sit on */
export const NOTICE_SURFACES = [
  'surface.container',
  ...['success.container', 'warning.container', 'danger.container'].flatMap((tint) => [`${tint}/surface.card`, `${tint}/surface.page`]),
]

/** Status text appears on cards, pages and menus; on containers it uses the reading levels. */
const STATUS_SURFACES = ['surface.card', 'surface.page', 'surface.raised', 'surface.menu', 'surface.hover', 'surface.selected']

export const contrastRules: ContrastRule[] = [
  ...READING_LEVELS.map((foreground) => ({ foreground, backgrounds: TEXT_SURFACES, minimum: 4.5 as const })),
  /* Metadata sits on cards, pages and menus; on containers and wells it takes the tertiary level */
  { foreground: 'text.meta', backgrounds: ['surface.card', 'surface.page', 'surface.raised', 'surface.menu', 'surface.hover'], minimum: 4.5 },
  { foreground: 'text.accent', backgrounds: STATUS_SURFACES, minimum: 4.5 },
  { foreground: 'text.danger', backgrounds: STATUS_SURFACES, minimum: 4.5 },
  { foreground: 'text.warning', backgrounds: STATUS_SURFACES, minimum: 4.5 },
  /* Notices: title, message and action in the strong and default levels; each tone's icon on its own tint */
  { foreground: 'text.strong', backgrounds: NOTICE_SURFACES, minimum: 4.5 },
  { foreground: 'text.default', backgrounds: NOTICE_SURFACES, minimum: 4.5 },
  { foreground: 'text.accent', backgrounds: ['success.container/surface.card', 'success.container/surface.page'], minimum: 3 },
  { foreground: 'text.warning', backgrounds: ['warning.container/surface.card', 'warning.container/surface.page'], minimum: 3 },
  { foreground: 'text.danger', backgrounds: ['danger.container/surface.card', 'danger.container/surface.page'], minimum: 3 },
  { foreground: 'text.inverse', backgrounds: ['surface.inverse'], minimum: 4.5 },
  { foreground: 'accent.inverse', backgrounds: ['surface.inverse'], minimum: 4.5 },
  { foreground: 'on.accent', backgrounds: ['accent'], minimum: 4.5 },
  { foreground: 'on.accent-tonal', backgrounds: ['accent.tonal'], minimum: 4.5 },
  { foreground: 'on.emphasis', backgrounds: ['danger.solid'], minimum: 4.5 },
  /* Disabled text is exempt from 1.4.3 and takes the product's own grey; the control keeps its outline or shape. */
  { foreground: 'border.control', backgrounds: ['surface.card'], minimum: 3 },
  { foreground: 'focus', backgrounds: ['surface.card', 'surface.page', 'surface.menu', 'surface.container'], minimum: 3 },
  { foreground: 'accent', backgrounds: ['surface.card', 'surface.page'], minimum: 3 },
  { foreground: 'danger', backgrounds: ['surface.card', 'surface.page'], minimum: 3 },
  /* Chart lines and marks */
  { foreground: 'chart.primary', backgrounds: ['surface.card'], minimum: 3 },
  { foreground: 'chart.secondary', backgrounds: ['surface.card'], minimum: 3 },
]
