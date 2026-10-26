/**
 * After the build: no interactive example may depend on HTML comments to hydrate. React separates two neighboring
 * pieces of text with an empty comment (<!-- -->); a host that drops comments from the HTML it serves merges them, and
 * React then finds text it did not render (error #418). Every island must write its text as single strings.
 * Nor may an island send a closed side panel's form in its HTML: browsers and extensions change form fields before a
 * lazy island hydrates, and React then finds elements it did not render. Panels mount after hydration (useHydrated).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const dist = new URL('../dist/', import.meta.url).pathname
const pages = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name)
  return statSync(path).isDirectory() ? pages(path) : name.endsWith('.html') ? [path] : []
})

const problems = []
for (const page of pages(dist)) {
  const html = readFileSync(page, 'utf8')
  for (const [island] of html.matchAll(/<astro-island[\s\S]*?<\/astro-island>/g)) {
    const component = island.match(/component-url="[^"]*\/([^/."]+)[^"]*"/)?.[1] ?? 'island'
    for (const comment of island.matchAll(/<!--(?!astro)[\s\S]*?-->/g)) {
      const before = island.slice(Math.max(0, comment.index - 50), comment.index).replace(/<[^>]*>/g, '‹›')
      problems.push(`${page.slice(dist.length)} · ${component}: …${before.slice(-40)}${comment[0]}`)
    }
    for (const [dialog] of island.matchAll(/<dialog\b[\s\S]*?<\/dialog>/g)) {
      if (/<select\b|<textarea\b|<input\b(?![^>]*type="(checkbox|radio)")[^>]*\svalue=/.test(dialog)) problems.push(`${page.slice(dist.length)} · ${component}: a closed dialog sends its form in the HTML`)
    }
  }
}
if (problems.length) {
  console.error(`${problems.length} problem(s) in interactive examples:\n${problems.slice(0, 20).join('\n')}`)
  process.exit(1)
}
console.log('Islands: no comments to hydrate across, no panel forms in the HTML')
