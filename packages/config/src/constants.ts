export const PLATFORM_NAME = 'Juris' as const;

export const API_VERSION = 'v1' as const;

export const MAX_UPLOAD_SIZE_BYTES = 100 * 1024 * 1024;

export const MAX_DOCUMENT_TITLE_LENGTH = 500;

export const MAX_CHUNK_SIZE_TOKENS = 512;

export const CHUNK_OVERLAP_TOKENS = 64;

export const MAX_CONTEXT_WINDOW_CHUNKS = 20;

export const MAX_CHAT_HISTORY_MESSAGES = 100;

export const DEFAULT_PAGE_SIZE = 25;

export const MAX_PAGE_SIZE = 100;

export const IDEMPOTENCY_KEY_TTL_SECONDS = 86400;

export const PROVISIONING_MAX_RETRIES = 5;

export const INGESTION_MAX_RETRIES = 3;

export const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export const SENSITIVE_HEADER_NAMES = [
  'authorization',
  'cookie',
  'x-api-key',
  'cf-access-client-id',
  'cf-access-client-secret',
] as const;
