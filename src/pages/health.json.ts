import type { APIRoute } from 'astro';
import { health } from '../lib/health';

export const GET: APIRoute = async () =>
  new Response(JSON.stringify(await health(), null, 2), {
    headers: { 'content-type': 'application/json' },
  });
