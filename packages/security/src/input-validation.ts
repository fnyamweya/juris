export const ALLOWED_UPLOAD_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
] as const;

const ALLOWED_MIMES_SET = new Set(ALLOWED_UPLOAD_MIMES);

export function validateContentType(request: Request, expected: string[]): boolean {
  const contentType = request.headers.get('Content-Type');
  if (!contentType) return false;

  const parts = contentType.split(';').map((s) => s.trim().toLowerCase());
  const mediaType = parts[0];
  if (mediaType === undefined) return false;

  const expectedSet = new Set(expected.map((e) => e.toLowerCase()));
  return expectedSet.has(mediaType);
}

export function validateRequestBodySize(request: Request, maxBytes: number): boolean {
  const contentLength = request.headers.get('Content-Length');
  if (!contentLength) return true;
  const size = parseInt(contentLength, 10);
  return !Number.isNaN(size) && size <= maxBytes;
}

export function validateMimeType(mime: string): boolean {
  return (ALLOWED_MIMES_SET as Set<string>).has(mime);
}

export function stripUntrustedHeaders(headers: Headers, trustedHeaders: string[]): Headers {
  const trustedSet = new Set(trustedHeaders.map((h) => h.toLowerCase()));
  const result = new Headers();
  for (const [name, value] of headers.entries()) {
    if (trustedSet.has(name.toLowerCase())) {
      result.set(name, value);
    }
  }
  return result;
}
