export const CSRF_HEADER = 'x-csrf-token';

export function generateCsrfToken(): string {
  return crypto.randomUUID();
}

export function validateCsrfToken(request: Request, expectedToken: string): boolean {
  const token = request.headers.get(CSRF_HEADER);
  if (!token || !expectedToken) return false;
  return token === expectedToken;
}
