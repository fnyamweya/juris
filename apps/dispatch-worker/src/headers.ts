const JUSRIS_INTERNAL_HEADERS = [
  'x-jusris-tenant-id',
  'x-jusris-actor-id',
  'x-jusris-actor-type',
  'x-jusris-request-id',
  'x-jusris-trace-id',
];

export const TRUSTED_INTERNAL_HEADERS = JUSRIS_INTERNAL_HEADERS;

export function stripUntrustedHeaders(incomingHeaders: Headers): Headers {
  const clean = new Headers();
  for (const [key, value] of incomingHeaders.entries()) {
    if (!key.toLowerCase().startsWith('x-jusris-')) {
      clean.set(key, value);
    }
  }
  return clean;
}
