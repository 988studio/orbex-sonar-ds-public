/** /sizes.json: the gzipped weight of every entry point of @orbex/sonar-components and its budget */
import type { APIRoute } from 'astro'
import sizes from '@orbex/sonar-components/sizes.json'

export const GET: APIRoute = () => new Response(`${JSON.stringify(sizes, null, 2)}\n`, { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
