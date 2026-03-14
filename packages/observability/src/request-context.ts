export const REQUEST_ID_HEADER = 'x-request-id';
export const TRACE_ID_HEADER = 'x-trace-id';

export interface RequestContext {
  requestId: string;
  traceId: string;
  startTime: number;
  worker: string;
  route?: string;
  tenantId?: string;
  actorId?: string;
}

export interface CreateRequestContextParams {
  worker: string;
  route?: string;
  existingRequestId?: string;
  existingTraceId?: string;
}

export function createRequestContext(params: CreateRequestContextParams): RequestContext {
  const {
    worker,
    route,
    existingRequestId,
    existingTraceId,
  } = params;

  return {
    requestId: existingRequestId ?? crypto.randomUUID(),
    traceId: existingTraceId ?? crypto.randomUUID(),
    startTime: Date.now(),
    worker,
    route,
  };
}

export function extractRequestContext(headers: Headers, worker: string): RequestContext {
  const requestId = headers.get(REQUEST_ID_HEADER) ?? undefined;
  const traceId = headers.get(TRACE_ID_HEADER) ?? undefined;

  return createRequestContext({
    worker,
    existingRequestId: requestId ?? undefined,
    existingTraceId: traceId ?? undefined,
  });
}
