/** /downloads/type.css: the type roles as classes, as @orbex/sonar-tokens/type.css */
import type { APIRoute } from 'astro'
import css from '@orbex/sonar-tokens/type.css?raw'

export const GET: APIRoute = () => new Response(css, { headers: { 'Content-Type': 'text/css; charset=utf-8' } })
