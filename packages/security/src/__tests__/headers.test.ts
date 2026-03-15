import { describe, it, expect } from 'vitest';
import { CSP_DIRECTIVES, buildCspHeader, applySecurityHeaders } from '../headers.js';
import { stripUntrustedHeaders } from '../input-validation.js';

describe('Security Headers', () => {
  it('all security headers are applied', () => {
    const response = new Response('ok', { status: 200 });
    const secured = applySecurityHeaders(response);

    expect(secured.headers.get('Strict-Transport-Security')).toBe(
      'max-age=63072000; includeSubDomains; preload',
    );
    expect(secured.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(secured.headers.get('X-Frame-Options')).toBe('DENY');
    expect(secured.headers.get('X-XSS-Protection')).toBe('0');
    expect(secured.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(secured.headers.get('Permissions-Policy')).toBe(
      'camera=(), microphone=(), geolocation=()',
    );
    expect(secured.headers.get('Content-Security-Policy')).toBeDefined();
  });

  it('CSP header is well-formed', () => {
    const csp = buildCspHeader(CSP_DIRECTIVES);

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' data: https:");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");

    const parts = csp.split('; ');
    expect(parts.length).toBeGreaterThanOrEqual(Object.keys(CSP_DIRECTIVES).length);
  });

  it('untrusted header stripping', () => {
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Authorization', 'Bearer secret');
    headers.set('X-Custom-Header', 'value');
    headers.set('Accept', 'application/json');

    const trusted = ['content-type', 'accept'];
    const stripped = stripUntrustedHeaders(headers, trusted);

    expect(stripped.get('Content-Type')).toBe('application/json');
    expect(stripped.get('Accept')).toBe('application/json');
    expect(stripped.get('Authorization')).toBeNull();
    expect(stripped.get('X-Custom-Header')).toBeNull();
  });
});
