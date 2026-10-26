/** /api.json: the props of every component, as the package publishes it in @orbex/sonar-components/api.json */
import type { APIRoute } from 'astro'
import api from '@orbex/sonar-components/api.json'

export const GET: APIRoute = () => new Response(`${JSON.stringify(api, null, 2)}\n`, { headers: { 'Content-Type': 'application/json; charset=utf-8' } })
