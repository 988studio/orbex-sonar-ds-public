/**
 * Enforces the accessibility contract (lib/accessibility.ts) on the built tokens, in both themes.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, test } from 'node:test'
import { contrastRules } from '../lib/accessibility.ts'
import { contrast, over, type Hex } from '../lib/color.ts'

interface Doc { name: string; light: { resolved: unknown }; dark?: { resolved: unknown } }
const tokens: Doc[] = JSON.parse(readFileSync(new URL('../dist/tokens.json', import.meta.url), 'utf8'))

const resolved = (theme: 'light' | 'dark', name: string): string => {
  const token = tokens.find((candidate) => candidate.name === `color.${name}`)
  assert.ok(token, `color.${name} exists`)
  return (theme === 'dark' && token.dark ? token.dark : token.light).resolved as string
}

/* An opaque role, or a translucent one over its surface (`warning.container/surface.card`), as the screen shows it */
const color = (theme: 'light' | 'dark', name: string): Hex => {
  const [top, base] = name.split('/') as [string, string | undefined]
  const value = resolved(theme, top)
  if (base) return over(value, color(theme, base))
  assert.equal(value.length, 7, `color.${name} is opaque in ${theme}`)
  return value as Hex
}

for (const theme of ['light', 'dark'] as const) {
  describe(`${theme} theme`, () => {
    for (const { foreground, backgrounds, minimum } of contrastRules) {
      for (const background of backgrounds) {
        test(`${foreground} on ${background} ≥ ${minimum}:1`, () => {
          const ratio = contrast(color(theme, foreground), color(theme, background))
          assert.ok(ratio >= minimum, `${ratio.toFixed(2)}:1`)
        })
      }
    }
  })
}
