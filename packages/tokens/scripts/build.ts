/**
 * Builds the token package:
 *   dist/tokens.css   custom properties for both themes, in the `sonar.tokens` cascade layer, and the responsive
 *                     properties that follow the window size class
 *   dist/type.css     one class per type role (.sonar-type-title-lg …)
 *   dist/tokens.json  every token, resolved per theme, with descriptions (used by the documentation site)
 *   dist/index.js     the same data as an ES module, typed by index.d.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { rgbToHex } from '../lib/color.ts'
import { readGroupDescriptions, readTokens, referenceOf, TokenSet, type Token } from '../lib/dtcg.ts'
import { springEasing } from '../lib/spring.ts'

const PREFIX = 'sonar'
const THEMES = ['light', 'dark'] as const
type Theme = (typeof THEMES)[number]

const src = (file: string) => new URL(`../src/${file}`, import.meta.url)
const dist = new URL('../dist/', import.meta.url)

const BASE_FILES = ['ref/palette.json', 'ref/font.json', 'sys/typography.json', 'sys/shape.json', 'sys/space.json', 'sys/size.json', 'sys/focus.json', 'sys/motion.json', 'sys/layout.json']
const THEMED_FILES = ['sys/color', 'sys/elevation']

const base = BASE_FILES.flatMap((file) => readTokens(src(file)))
const themed = Object.fromEntries(THEMES.map((theme) => [theme, THEMED_FILES.flatMap((file) => readTokens(src(`${file}.${theme}.json`)))])) as Record<Theme, Token[]>
const sets = Object.fromEntries(THEMES.map((theme) => [theme, new TokenSet([...base, ...themed[theme]])])) as Record<Theme, TokenSet>

assertSameShape(themed.light, themed.dark)

/* ---------- CSS values ---------- */

const cssVar = (name: string) => `--${PREFIX}-${name.replaceAll('.', '-')}`
const ref = (name: string) => `var(${cssVar(name)})`

interface ColorValue { colorSpace: 'srgb'; components: [number, number, number]; alpha?: number; hex?: string }

const cssColor = (value: unknown, alpha?: number): string => {
  const reference = referenceOf(value)
  if (reference) return alpha === undefined ? ref(reference) : `color-mix(in srgb, ${ref(reference)} ${round(alpha * 100)}%, transparent)`
  const color = value as ColorValue
  const opacity = alpha ?? color.alpha ?? 1
  if (opacity === 1) return color.hex ?? rgbToHex(color.components)
  return `rgb(${color.components.map((channel) => Math.round(channel * 255)).join(' ')} / ${round(opacity)})`
}

const round = (value: number) => Number(value.toFixed(3))

const cssDimension = (value: unknown): string => {
  const reference = referenceOf(value)
  if (reference) return ref(reference)
  const { value: amount, unit } = value as { value: number; unit: string }
  return `${amount}${amount === 0 ? '' : unit}`
}

const cssFontFamily = (families: string[]) => families.map((family) => (/\s/.test(family) ? `"${family}"` : family)).join(', ')

const cssReferenceOr = (value: unknown, literal: (value: never) => string) => {
  const reference = referenceOf(value)
  return reference ? ref(reference) : literal(value as never)
}

interface ShadowLayer { color: unknown; offsetX: unknown; offsetY: unknown; blur: unknown; spread: unknown; inset?: boolean }
interface Typography { fontFamily: unknown; fontSize: unknown; fontWeight: unknown; lineHeight: number; letterSpacing: unknown }

/** One or more declarations for a token: name → value */
function declarations(token: Token): [string, string][] {
  const name = token.path.join('.')
  const value = token.value
  switch (token.type) {
    case 'color':
      return [[name, cssColor(value, token.extensions?.alpha as number | undefined)]]
    case 'dimension':
      return [[name, cssDimension(value)]]
    case 'number':
    case 'fontWeight':
      return [[name, cssReferenceOr(value, String)]]
    case 'fontFamily':
      return [[name, cssReferenceOr(value, cssFontFamily)]]
    case 'cubicBezier':
      return [[name, cssReferenceOr(value, (points: number[]) => `cubic-bezier(${points.join(', ')})`)]]
    case 'duration': {
      const spring = token.extensions?.spring as { bounce: number } | undefined
      if (!spring) return [[name, cssDimension(value)]]
      return [[`${name}.duration`, cssDimension(value)], [`${name}.easing`, springEasing(spring.bounce)]]
    }
    case 'shadow':
      return [[name, (value as ShadowLayer[]).map((layer) =>
        [layer.inset ? 'inset' : '', ...[layer.offsetX, layer.offsetY, layer.blur, layer.spread].map(cssDimension), cssColor(layer.color)]
          .filter(Boolean).join(' ')).join(', ')]]
    case 'typography': {
      const type = value as Typography
      const font = `${cssReferenceOr(type.fontWeight, String)} ${cssDimension(type.fontSize)}/${type.lineHeight} ${cssReferenceOr(type.fontFamily, cssFontFamily)}`
      return [[name, font], [`${name}.tracking`, cssDimension(type.letterSpacing)]]
    }
  }
}

const block = (selector: string, tokens: Token[], extra: string[] = [], indent = '  ') =>
  [`${indent}${selector} {`, ...extra.map((line) => `${indent}  ${line}`),
    ...tokens.flatMap(declarations).map(([name, value]) => `${indent}  ${cssVar(name)}: ${value};`), `${indent}}`].join('\n')

/* ---------- Size classes ----------
   A layout group keyed by size class (layout.columns.compact, .medium …) is responsive: besides one property per class, the build
   writes a property named after the group that takes the value of the current class. A class left out inherits the one
   below it. Media queries cannot read custom properties, so the breakpoints are written into them here, from the tokens. */

const breakpoints = base.filter(({ path }) => path.join('.').startsWith('layout.breakpoint.'))
const sizeClasses = [
  { name: 'compact', min: 0 },
  ...breakpoints.map((token) => ({ name: token.path.at(-1)!, min: (sets.light.resolve(token.value) as { value: number }).value })),
].sort((a, b) => a.min - b.min)
const classNames = sizeClasses.map(({ name }) => name)
const mediaOf = (min: number) => `(width >= ${min}px)`

const responsiveGroups = [...new Set(base
  .filter(({ path }) => path[0] === 'layout' && path[1] !== 'breakpoint' && classNames.includes(path.at(-1)!))
  .map(({ path }) => path.slice(0, -1).join('.')))]

for (const group of responsiveGroups) {
  if (!base.some(({ path }) => path.join('.') === `${group}.compact`)) throw new Error(`Responsive group ${group} needs a compact value`)
}

const responsiveAt = (name: string) =>
  responsiveGroups.filter((group) => base.some(({ path }) => path.join('.') === `${group}.${name}`))
    .map((group) => `${cssVar(group)}: ${ref(`${group}.${name}`)};`)

const responsiveCss = sizeClasses.flatMap(({ name, min }) => {
  const lines = responsiveAt(name)
  if (!lines.length) return []
  if (min === 0) return ['', `  :root {`, ...lines.map((line) => `    ${line}`), '  }']
  return ['', `  @media ${mediaOf(min)} {`, '    :root {', ...lines.map((line) => `      ${line}`), '    }', '  }']
})

const header = '/* Orbex Sonar-DB Design System · tokens · generated by packages/tokens/scripts/build.ts, do not edit */'

/* Themed tokens are declared on any element with data-theme, so a dark specimen can sit inside a light page. */
const tokensCss = [
  header,
  '@layer sonar.tokens {',
  block(':root', base),
  ...responsiveCss,
  '',
  block(':root, [data-theme="light"]', themed.light, ['color-scheme: light;']),
  '',
  block('[data-theme="dark"]', themed.dark, ['color-scheme: dark;']),
  '',
  '  @media (prefers-color-scheme: dark) {',
  block(':root:not([data-theme="light"])', themed.dark, ['color-scheme: dark;'], '    '),
  '  }',
  '}',
  '',
].join('\n')

const typeCss = [
  header,
  '@layer sonar.tokens {',
  ...base.filter((token) => token.type === 'typography').map((token) => {
    const name = token.path.join('.')
    const transform = token.extensions?.textTransform as string | undefined
    return [
      `  .${PREFIX}-${name.replaceAll('.', '-')} {`,
      `    font: ${ref(name)};`,
      `    letter-spacing: ${ref(`${name}.tracking`)};`,
      ...(transform ? [`    text-transform: ${transform};`] : []),
      '  }',
    ].join('\n')
  }),
  '}',
  '',
].join('\n')

/* ---------- Resolved data for documentation ---------- */

const groupDescriptions = new Map([...BASE_FILES, ...THEMED_FILES.map((file) => `${file}.light.json`)]
  .flatMap((file) => [...readGroupDescriptions(src(file))]))

function resolvedColor(set: TokenSet, token: Token): string {
  const literal = set.resolve(token.value) as ColorValue
  const alpha = (token.extensions?.alpha as number | undefined) ?? literal.alpha
  const hex = literal.hex ?? rgbToHex(literal.components)
  return alpha === undefined || alpha === 1 ? hex : `${hex}${Math.round(alpha * 255).toString(16).padStart(2, '0').toUpperCase()}`
}

const describe = (theme: Theme, token: Token) => {
  const set = sets[theme]
  return {
    reference: referenceOf(token.value),
    resolved: token.type === 'color' ? resolvedColor(set, token) : set.resolve(token.value),
    css: Object.fromEntries(declarations(token).map(([name, value]) => [cssVar(name), value])),
  }
}

const documentation = [...base, ...themed.light].map((token) => {
  const name = token.path.join('.')
  const dark = themed.dark.find((candidate) => candidate.path.join('.') === name)
  return {
    name,
    cssVar: cssVar(name),
    type: token.type,
    description: token.description ?? dark?.description,
    ...((token.deprecated ?? dark?.deprecated) !== undefined && { deprecated: token.deprecated ?? dark?.deprecated }),
    group: groupDescriptions.get(token.path.slice(0, -1).join('.')),
    extensions: token.extensions,
    themed: Boolean(dark),
    light: describe('light', token),
    ...(dark && { dark: describe('dark', dark) }),
  }
})

mkdirSync(dist, { recursive: true })
writeFileSync(new URL('tokens.css', dist), tokensCss)
writeFileSync(new URL('type.css', dist), typeCss)
writeFileSync(new URL('tokens.json', dist), `${JSON.stringify(documentation, null, 2)}\n`)
/* The exact range of each class, for matchMedia: (768px <= width < 1280px) */
const sizeClassData = sizeClasses.map(({ name, min }, index) => {
  const max = sizeClasses[index + 1]?.min ?? null
  const media = max === null ? mediaOf(min) : min === 0 ? `(width < ${max}px)` : `(${min}px <= width < ${max}px)`
  return { name, min, max, media }
})
writeFileSync(new URL('index.js', dist), [
  header.replace('/*', '//').replace(' */', ''),
  `export const tokens = ${JSON.stringify(documentation)}`,
  `export const sizeClasses = ${JSON.stringify(sizeClassData)}`,
  `export const responsive = ${JSON.stringify(responsiveGroups.map((group) => ({ name: group, cssVar: cssVar(group) })))}`,
  '',
].join('\n'))
writeFileSync(new URL('index.d.ts', dist), [
  `${header}`,
  `export type TokenName =\n${documentation.map(({ name }) => `  | '${name}'`).join('\n')}`,
  '',
  'export interface ThemeValue { reference?: string; resolved: unknown; css: Record<string, string> }',
  'export interface TokenDocument {',
  '  name: TokenName',
  '  cssVar: string',
  `  type: ${[...new Set(documentation.map(({ type }) => `'${type}'`))].join(' | ')}`,
  '  description?: string',
  '  /** Marked $deprecated in the source: true, or what to use instead */',
  '  deprecated?: boolean | string',
  '  group?: string',
  '  extensions?: Record<string, unknown>',
  '  themed: boolean',
  '  light: ThemeValue',
  '  dark?: ThemeValue',
  '}',
  'export declare const tokens: TokenDocument[]',
  `export type SizeClass = ${classNames.map((name) => `'${name}'`).join(' | ')}`,
  '/** Window size classes, narrowest first: the width where each starts and ends, and a media query for exactly that range */',
  'export declare const sizeClasses: { name: SizeClass; min: number; max: number | null; media: string }[]',
  '/** Properties that take the value of the current size class, such as --sonar-layout-columns */',
  'export declare const responsive: { name: string; cssVar: string }[]',
  '',
].join('\n'))

console.log(`${documentation.length} tokens → ${dist.pathname}`)

function assertSameShape(light: Token[], dark: Token[]) {
  const names = (tokens: Token[]) => tokens.map(({ path }) => path.join('.')).sort().join('\n')
  if (names(light) !== names(dark)) throw new Error('Light and dark themes must define the same tokens')
}
