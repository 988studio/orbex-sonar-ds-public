/**
 * /llms.txt: the system described for language models and coding agents (llmstxt.org). Built from the same data as
 * the pages: the navigation, and every component’s API as the package publishes it.
 */
import type { APIRoute } from 'astro'
import { componentEntries } from '../lib/components.ts'
import { navigation } from '../lib/navigation.ts'
import { releaseDate, studio, version } from '../lib/release.ts'
import { usageRules } from '../lib/usage-rules.ts'

export const GET: APIRoute = ({ site }) => {
  const url = (href: string) => (site ? new URL(href, site).href : href)
  const link = (label: string, href: string, description?: string) => `- [${label}](${url(href)})${description ? `: ${description}` : ''}`
  /* Each section’s index, then its pages; components are listed below with their API */
  const pages = navigation.flatMap(({ label, href, description, items }) => [
    ...(label && href ? [link(label, href, description)] : []),
    ...(label === 'Components' ? [] : items.filter((item) => item.href).map((item) => link(item.label, item.href!, item.description))),
  ])

  const components = componentEntries.map(({ title, entry, href, api, compound, imports }) => {
    const parts = api.parts.map((part) => {
      const name = compound ? `${api.name}.${part.name}` : part.name
      const props = part.props.map((prop) => `  - \`${prop.name}${prop.required ? '' : '?'}: ${prop.type}\`${prop.default ? ` (default ${prop.default})` : ''}${prop.description ? ` ${prop.description}` : ''}`)
      return [`- \`${name}\`${part.description ? `: ${part.description}` : ''}${part.extends ? ` Extends \`${part.extends}\`.` : ''}`, ...props].join('\n')
    })
    return [
      `### ${title}`,
      '',
      `[Documentation](${url(href)}) · ${api.behavior === 'native' ? 'native HTML' : 'behavior from Base UI'} · \`import { ${imports.join(', ')} } from '@orbex/sonar-components/${entry}'\` and \`import '@orbex/sonar-components/${entry}.css'\``,
      '',
      ...parts,
    ].join('\n')
  })

  const body = [
    '# Orbex Sonar-DB Design System',
    '',
    '> Design tokens and React components for Sonar-DB, a logistics dashboard. Material 3 Expressive, dense, AA contrast on every surface. Native HTML first, Base UI for complex behavior, plain CSS on tokens in the `sonar` cascade layer.',
    '',
    'Packages: `@orbex/sonar-tokens` (CSS custom properties `--sonar-*`, W3C Design Tokens JSON) and `@orbex/sonar-components` (one entry point and one stylesheet per component; full API data in `@orbex/sonar-components/api.json`, also published at /api.json). Set the layer order once: `@layer reset, sonar, app;`, then import `@orbex/sonar-tokens/tokens.css`. Style with role tokens (`--sonar-color-text-default`, `--sonar-color-surface-card`), never palette tokens.',
    '',
    `Version ${version} (${releaseDate}). © 2026 ${studio}. Code under the MIT licence; documentation (this site's text and images) under CC BY 4.0. Source: https://github.com/988studio/orbex-sonar-ds-public. Orbex and Sonar-DB are a fictional product made to show the system.`,
    '',
    '## Machine-readable files',
    '',
    link('llms-full.txt', '/llms-full.txt', 'every documentation page as clean Markdown, in reading order'),
    link('tokens.json', '/downloads/tokens.json', 'every design token resolved per theme (light, dark), with its CSS variable, description and reference (W3C Design Tokens)'),
    link('api.json', '/api.json', 'the API of every component: parts, props, types and defaults'),
    link('sizes.json', '/sizes.json', 'component and layout sizes in px'),
    link('sitemap.xml', '/sitemap.xml', 'every page of this site'),
    '',
    '## Usage rules for agents',
    '',
    'How to compose screens with the system: nouns (objects), the surface each one uses, verbs and the pattern for each, and the rules. Paste it as is into an agent’s instructions.',
    '',
    '```text',
    usageRules,
    '```',
    '',
    '## Documentation',
    '',
    ...pages,
    '',
    '## Components',
    '',
    components.join('\n\n'),
    '',
  ].join('\n')

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
