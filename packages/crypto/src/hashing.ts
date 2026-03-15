import { arrayBufferToHex } from './encoding.js';

export async function sha256(data: string | ArrayBuffer): Promise<string> {
  const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return arrayBufferToHex(hash);
}

export async function hmacSha256(key: ArrayBuffer, data: string | ArrayBuffer): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const buffer = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, buffer);
  return arrayBufferToHex(signature);
}
