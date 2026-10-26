/** /downloads/tokens.json: every token resolved per theme, with its description, as @orbex/sonar-tokens/tokens.json */
import type { APIRoute } from 'astro'
import tokens from '@orbex/sonar-tokens/tokens.json'

export const GET: APIRoute = () => new Response(`${JSON.stringify(tokens, null, 2)}\n`, { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
