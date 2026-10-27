/**
 * 1.1.5: files for search engines and agents, written from the built pages after `astro build` (nothing visible):
 * - sitemap.xml: every page (not the private test page), with the release date;
 * - llms-full.txt: every documentation page as clean Markdown, in the sidebar's reading order.
 * Interactive demos, icons and decoration are left out; tables, lists, code and links are kept.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const SKIP = new Set(['test-intermitente/', '404/'])

function pages(root) {
  const out = []
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, name.name)
      if (name.isDirectory()) walk(full)
      else if (name.name === 'index.html') {
        const rel = path.relative(root, path.dirname(full)).split(path.sep).join('/')
        const route = rel ? rel + '/' : ''
        if (![...SKIP].some((s) => route.startsWith(s))) out.push(route)
      }
    }
  }
  walk(root)
  return out
}

const clean = (text) => text.replace(/\s+/g, ' ')

/* A small HTML → Markdown converter for the documentation's own markup */
function md(node, origin, ctx = {}) {
  if (node.nodeType === 3) return clean(node.textContent)
  if (node.nodeType !== 1) return ''
  const el = node
  const tag = el.tagName.toLowerCase()
  if (['script', 'style', 'svg', 'astro-island', 'button', 'template', 'noscript', 'input', 'select', 'canvas', 'video', 'iframe'].includes(tag)) return ''
  if (el.getAttribute('aria-hidden') === 'true' || el.hidden) return ''
  const kids = (c = ctx) => [...el.childNodes].map((n) => md(n, origin, c)).join('')
  switch (tag) {
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
      const level = Math.min(6, Number(tag[1]) + 1)
      return `\n\n${'#'.repeat(level)} ${kids().trim()}\n\n`
    }
    case 'p': return `\n\n${kids().trim()}\n\n`
    case 'br': return '\n'
    case 'strong': case 'b': { const t = kids().trim(); return t ? `**${t}**` : '' }
    case 'em': case 'i': { const t = kids().trim(); return t ? `*${t}*` : '' }
    case 'code': return ctx.pre ? el.textContent : '`' + el.textContent.replace(/`/g, "'") + '`'
    case 'pre': return '\n\n```\n' + el.textContent.replace(/\n+$/, '') + '\n```\n\n'
    case 'a': {
      const t = kids().trim()
      const href = el.getAttribute('href')
      if (!href || href.startsWith('#') || !t) return t
      const abs = href.startsWith('/') ? origin + href : href
      return `[${t}](${abs})`
    }
    case 'ul': case 'ol': {
      const depth = ctx.depth ?? 0
      const items = [...el.children].filter((c) => c.tagName === 'LI').map((li, i) => {
        const body = [...li.childNodes].map((n) => md(n, origin, { ...ctx, depth: depth + 1 })).join('').trim().replace(/\n{2,}/g, '\n')
        return `${'  '.repeat(depth)}${tag === 'ol' ? `${i + 1}.` : '-'} ${body}`
      })
      return `\n\n${items.join('\n')}\n\n`
    }
    case 'table': {
      const rows = [...el.querySelectorAll('tr')].map((tr) => [...tr.children].map((cell) => md(cell, origin, ctx).trim().replace(/\n+/g, ' ').replace(/\|/g, '\\|')))
      if (!rows.length) return ''
      const width = Math.max(...rows.map((r) => r.length))
      const pad = (r) => [...r, ...Array(width - r.length).fill('')]
      const caption = el.querySelector('caption') ? `*${clean(el.querySelector('caption').textContent).trim()}*\n\n` : ''
      const [head, ...body] = rows
      return `\n\n${caption}| ${pad(head).join(' | ')} |\n|${' --- |'.repeat(width)}\n${body.map((r) => `| ${pad(r).join(' | ')} |`).join('\n')}\n\n`
    }
    case 'caption': return ''
    case 'dl': return `\n\n${kids()}\n\n`
    case 'dt': return `\n**${kids().trim()}**\n`
    case 'dd': return `: ${kids().trim()}\n`
    case 'blockquote': return '\n\n> ' + kids().trim().replace(/\n/g, '\n> ') + '\n\n'
    case 'figure': {
      /* Live demos are drawn by script; what stays is the figure's caption */
      const cap = el.querySelector('figcaption')
      const t = cap ? clean(cap.textContent).trim() : ''
      const tables = [...el.querySelectorAll('table, pre')].map((n) => md(n, origin, ctx)).join('')
      return (t ? `\n\n*Figure: ${t}*\n\n` : '') + tables
    }
    case 'li': case 'div': case 'section': case 'span': case 'small': case 'header': case 'article': case 'td': case 'th': case 'label': case 'abbr': case 'time': case 'mark': case 'sup': case 'sub': case 'kbd':
    default: {
      const block = ['div', 'section', 'header', 'article'].includes(tag)
      const t = kids()
      return block ? `\n${t}\n` : t
    }
  }
}

export default function agentFiles() {
  let origin = ''
  return {
    name: 'agent-files',
    hooks: {
      'astro:config:done': ({ config }) => {
        origin = (config.site ?? '').replace(/\/$/, '')
      },
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir)
        const routes = pages(root)
        /* Reading order: the sidebar's links on the home page, then anything else alphabetically */
        const home = new JSDOM(fs.readFileSync(path.join(root, 'index.html'), 'utf8')).window.document
        const order = ['']
        for (const a of home.querySelectorAll('nav a[href^="/"]')) {
          const route = a.getAttribute('href').replace(/^\//, '').split('#')[0]
          if (routes.includes(route) && !order.includes(route)) order.push(route)
        }
        for (const route of routes.sort()) if (!order.includes(route)) order.push(route)
        const releaseDate = (() => {
          const m = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/lib/release.ts'), 'utf8').match(/releaseDate = '([^']+)'/)
          return m ? new Date(`${m[1]} 12:00 UTC`).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
        })()

        const sitemap = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          ...order.map((route) => `  <url><loc>${origin}/${route}</loc><lastmod>${releaseDate}</lastmod></url>`),
          '</urlset>',
          '',
        ].join('\n')
        fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap)

        const parts = []
        for (const route of order) {
          const doc = new JSDOM(fs.readFileSync(path.join(root, route, 'index.html'), 'utf8')).window.document
          const title = clean(doc.querySelector('title')?.textContent ?? route).trim()
          const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''
          const body = doc.querySelector('main .page-body') ?? doc.querySelector('main')
          if (!body) continue
          body.querySelectorAll('nav.breadcrumb, .visually-hidden-focusable').forEach((n) => n.remove())
          const text = md(body, origin).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
          parts.push(`# ${title}\n\nURL: ${origin}/${route}\n${description ? `\n> ${description}\n` : ''}\n${text}\n`)
        }
        const head = [
          '# Orbex Sonar-DB Design System · full documentation',
          '',
          `> Every page of ${origin}/ as Markdown, in reading order (${parts.length} pages, ${releaseDate}). The summary, the machine-readable files and the usage rules for agents are in ${origin}/llms.txt. Interactive demos are left out. © 2026 988©STUDIO; code MIT, documentation CC BY 4.0.`,
          '',
        ].join('\n')
        fs.writeFileSync(path.join(root, 'llms-full.txt'), head + '\n' + parts.join('\n---\n\n'))
        logger.info(`sitemap.xml (${order.length} pages) and llms-full.txt (${parts.length} pages) written`)
      },
    },
  }
}
