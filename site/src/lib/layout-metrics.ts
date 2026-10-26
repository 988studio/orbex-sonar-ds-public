/**
 * Layout measures read from the tokens at build time, in the shape the overview grid functions take.
 * Pages pass the result to the browser as data, so client scripts never load the token data.
 */
import { sizeClasses, tokens, type TokenName } from '@orbex/sonar-tokens'
import type { GridMetrics, SizeClassMetrics } from './overview-grid.ts'
import { token } from './tokens.ts'

/** A dimension or number token as a plain number of pixels (or of units, for counts) */
export function measure(name: string): number {
  const resolved = token(name as TokenName).light.resolved
  return typeof resolved === 'number' ? resolved : (resolved as { value: number }).value
}

/** The value of a responsive layout group in a size class: the class’s own, or the nearest narrower one */
export function responsiveValue(group: string, sizeClass: string): number {
  const defined = sizeClasses
    .slice(0, sizeClasses.findIndex(({ name }) => name === sizeClass) + 1)
    .map(({ name }) => `${group}.${name}`)
    .filter((name) => tokens.some((candidate) => candidate.name === name))
  return measure(defined.at(-1)!)
}

const navigationOf = (index: number): SizeClassMetrics['navigation'] => (index === 0 ? 'bar' : index === 1 ? 'rail' : 'sidebar')

export const gridMetrics: GridMetrics = {
  gap: measure('layout.gap'),
  sidebar: measure('layout.sidebar'),
  rail: measure('layout.rail'),
  bottomBar: measure('layout.bar.bottom'),
  heights: { s: measure('layout.card.s'), m: measure('layout.card.m'), l: measure('layout.card.l'), xl: measure('layout.card.xl') },
  classes: sizeClasses.map(({ name, min }, index) => ({
    name,
    min,
    columns: responsiveValue('layout.columns', name),
    margin: responsiveValue('layout.margin', name),
    topBar: responsiveValue('layout.bar.top', name),
    navigation: navigationOf(index),
  })),
}
