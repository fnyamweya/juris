import type { RequestContext } from '@jusris/observability';

export function handleHealthCheck(reqCtx: RequestContext): Response {
  return new Response(
    JSON.stringify({
      status: 'ok',
      worker: 'maintenance',
      timestamp: new Date().toISOString(),
      requestId: reqCtx.requestId,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
