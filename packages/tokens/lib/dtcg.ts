/**
 * A small reader for Design Tokens Community Group (DTCG 2025.10) files.
 *
 * It flattens groups into tokens, inherits `$type` from parent groups, treats `$root` as the group's own token,
 * and resolves `{group.token}` references. Themes are separate files that define the same token paths.
 */
import { readFileSync } from 'node:fs'

export type TokenType =
  | 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'duration' | 'cubicBezier' | 'number'
  | 'shadow' | 'typography'

export interface Token {
  /** Path segments, e.g. ['color', 'text', 'default'] */
  path: string[]
  type: TokenType
  value: unknown
  description?: string
  /** W3C $deprecated: true, or what to use instead */
  deprecated?: boolean | string
  extensions?: Record<string, unknown>
}

export const EXTENSION = 'sonar-ds'

const isGroupKey = (key: string) => key.startsWith('$')

export function readTokens(file: URL): Token[] {
  const tree = JSON.parse(readFileSync(file, 'utf8'))
  const tokens: Token[] = []

  const walk = (node: Record<string, unknown>, path: string[], inheritedType?: TokenType) => {
    const type = (node.$type as TokenType | undefined) ?? inheritedType
    if ('$value' in node) {
      if (!type) throw new Error(`Token ${path.join('.')} has no $type`)
      tokens.push({
        path: path.filter((segment) => segment !== '$root'),
        type,
        value: node.$value,
        description: node.$description as string | undefined,
        ...(node.$deprecated !== undefined && { deprecated: node.$deprecated as boolean | string }),
        extensions: (node.$extensions as Record<string, Record<string, unknown>> | undefined)?.[EXTENSION],
      })
      return
    }
    for (const [key, child] of Object.entries(node)) {
      if (isGroupKey(key) && key !== '$root') continue
      walk(child as Record<string, unknown>, [...path, key], type)
    }
  }

  walk(tree, [])
  return tokens
}

/** Group descriptions, for documentation: 'color.text' → description */
export function readGroupDescriptions(file: URL): Map<string, string> {
  const tree = JSON.parse(readFileSync(file, 'utf8'))
  const descriptions = new Map<string, string>()
  const walk = (node: Record<string, unknown>, path: string[]) => {
    if ('$value' in node) return
    if (typeof node.$description === 'string' && path.length) descriptions.set(path.join('.'), node.$description)
    for (const [key, child] of Object.entries(node)) if (!isGroupKey(key)) walk(child as Record<string, unknown>, [...path, key])
  }
  walk(tree, [])
  return descriptions
}

const REFERENCE = /^\{([^}]+)\}$/

export const referenceOf = (value: unknown): string | undefined =>
  typeof value === 'string' ? REFERENCE.exec(value)?.[1] : undefined

export class TokenSet {
  readonly byName = new Map<string, Token>()

  constructor(tokens: Token[]) {
    for (const token of tokens) this.byName.set(token.path.join('.'), token)
  }

  get(name: string): Token {
    const token = this.byName.get(name)
    if (!token) throw new Error(`Unknown token reference {${name}}`)
    return token
  }

  /** Follows references until a literal value. */
  resolve(value: unknown, seen: string[] = []): unknown {
    const reference = referenceOf(value)
    if (reference) {
      if (seen.includes(reference)) throw new Error(`Circular reference: ${[...seen, reference].join(' → ')}`)
      return this.resolve(this.get(reference).value, [...seen, reference])
    }
    if (Array.isArray(value)) return value.map((item) => this.resolve(item, seen))
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, this.resolve(item, seen)]))
    }
    return value
  }
}
