/**
 * Read-only views over the built tokens, for documentation pages.
 */
import { tokens, type TokenDocument, type TokenName } from '@orbex/sonar-tokens'
import { contrast, over, type Hex } from '@orbex/sonar-tokens/color'
import { contrastRules } from '@orbex/sonar-tokens/accessibility'

export type Theme = 'light' | 'dark'
export const THEMES: Theme[] = ['light', 'dark']

export type { TokenDocument }

export function token(name: TokenName): TokenDocument {
  const found = tokens.find((candidate) => candidate.name === name)
  if (!found) throw new Error(`Unknown token ${name}`)
  return found
}

/** Tokens directly inside a group, in source order: group('color.text') → color.text.strong, … */
export function group(prefix: string): TokenDocument[] {
  const depth = prefix.split('.').length + 1
  return tokens.filter(({ name }) => name.startsWith(`${prefix}.`) && name.split('.').length === depth)
}

/** Tokens anywhere under a prefix */
export function under(prefix: string): TokenDocument[] {
  return tokens.filter(({ name }) => name === prefix || name.startsWith(`${prefix}.`))
}

export function valueIn(doc: TokenDocument, theme: Theme) {
  return theme === 'dark' && doc.dark ? doc.dark : doc.light
}

/** Resolved color of a color token in a theme, as #RRGGBB or #RRGGBBAA */
export function hexOf(name: TokenName, theme: Theme): string {
  return valueIn(token(name), theme).resolved as string
}

/* An opaque role, or a translucent one over its surface (color.warning.container/surface.card), as the screen shows it */
function shownColor(name: string, theme: Theme): Hex {
  const [top, base] = name.split('/') as [string, string | undefined]
  const value = hexOf(top as TokenName, theme)
  return base ? over(value, shownColor(`color.${base}`, theme)) : (value as Hex)
}

export function contrastOf(foreground: TokenName, background: TokenName, theme: Theme): number {
  return contrast(shownColor(foreground, theme), shownColor(background, theme))
}

/** The last segment of a palette tone name: palette.neutral.24 → 24 */
export const toneOf = (name: string) => name.split('.').at(-1) ?? name

/** A short, readable name without the category: color.text.default → text.default */
export const shortName = (name: string) => name.split('.').slice(1).join('.')

/** Rounded down, so a ratio is never shown passing a threshold it misses (4.47 reads 4.4, not 4.5) */
export const formatRatio = (ratio: number) => `${(Math.floor(ratio * 10) / 10).toFixed(1)}:1`

/** The minimum the accessibility contract sets for a pair of color tokens, or null when the pair is not used */
export function requiredContrast(foreground: TokenName, background: TokenName): number | null {
  const [fg, bg] = [shortName(foreground), shortName(background)]
  const rule = contrastRules.find(({ foreground: f, backgrounds }) => f === fg && backgrounds.includes(bg))
  return rule?.minimum ?? null
}
