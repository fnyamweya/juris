const JURIS_INTERNAL_HEADERS = [
  'x-juris-tenant-id',
  'x-juris-actor-id',
  'x-juris-actor-type',
  'x-juris-request-id',
  'x-juris-trace-id',
];

export const TRUSTED_INTERNAL_HEADERS = JURIS_INTERNAL_HEADERS;

export function stripUntrustedHeaders(incomingHeaders: Headers): Headers {
  const clean = new Headers();
  for (const [key, value] of incomingHeaders.entries()) {
    if (!key.toLowerCase().startsWith('x-juris-')) {
      clean.set(key, value);
    }
  }
  return clean;
}
