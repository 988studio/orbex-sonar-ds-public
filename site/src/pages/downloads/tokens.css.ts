/** /downloads/tokens.css: every token as CSS custom properties, both themes, as @orbex/sonar-tokens/tokens.css */
import type { APIRoute } from 'astro'
import css from '@orbex/sonar-tokens/tokens.css?raw'

export const GET: APIRoute = () => new Response(css, { headers: { 'Content-Type': 'text/css; charset=utf-8' } })
