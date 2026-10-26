/**
 * The source shown under a live example, made self-contained: the demos import their icons from the site’s own
 * module, which a reader does not have. Shown code imports them from Material Symbols instead, as the Icons page
 * explains, so every example can be copied into an app and run.
 */
import iconsSource from '@orbex/sonar-patterns/icons.tsx?raw'

/* icons.tsx: `import add from '@material-symbols/svg-400/rounded/add.svg?raw'` and `export const AddIcon = symbol(add)` */
const files = new Map([...iconsSource.matchAll(/^import (\w+) from '(@material-symbols\/[^']+)'$/gm)].map(([, name, file]) => [name!, file!]))
const icons = new Map([...iconsSource.matchAll(/^export const (\w+) = symbol\((\w+)\)$/gm)].map(([, icon, name]) => [icon!, files.get(name!)!]))

const helper = `/* Material Symbols Rounded, weight 400, as icon components (Foundations › Icons) */
const symbol = (svg: string) => {
  const path = svg.match(/ d="([^"]+)"/)?.[1]
  return (props: ComponentProps<'svg'>) => (
    <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true" focusable="false" {...props}>
      <path d={path} />
    </svg>
  )
}`

const symbolName = (icon: string) => `${icon.charAt(0).toLowerCase()}${icon.slice(1).replace(/Icon$/, '')}Symbol`

export function selfContained(source: string) {
  const match = source.match(/^import \{([^}]+)\} from '\.\.\/(?:demos\/)?icons\.tsx'\n/m)
  if (!match) return source
  const names = match[1]!.split(',').map((name) => name.trim()).filter(Boolean)
  const unknown = names.filter((name) => !icons.has(name))
  if (unknown.length) throw new Error(`No Material Symbol for ${unknown.join(', ')}`)
  const imports = [`import type { ComponentProps } from 'react'`, ...names.map((name) => `import ${symbolName(name)} from '${icons.get(name)}'`)].join('\n')
  const definitions = names.map((name) => `const ${name} = symbol(${symbolName(name)})`).join('\n')
  /* The symbol imports replace the site’s; the helper and the icons follow the last import */
  const withImports = source.replace(match[0], `${imports}\n`)
  const lastImport = [...withImports.matchAll(/^import .+$/gm)].at(-1)!
  const end = lastImport.index! + lastImport[0].length
  return `${withImports.slice(0, end)}\n\n${helper}\n\n${definitions}${withImports.slice(end)}`
}

/** Fails the build when shown code still reaches into the site: every example must run on its own */
export function assertSelfContained(source: string, title: string) {
  const local = source.match(/^import (.+ from )?'\.\.?\/.+$/m)
  if (local) throw new Error(`The code of “${title}” imports a site module: ${local[0]}`)
}
