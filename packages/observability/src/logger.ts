export const SENSITIVE_FIELDS = [
  'password',
  'secret',
  'token',
  'authorization',
  'cookie',
  'dek',
  'kek',
  'masterKey',
  'privateKey',
] as const;

const SENSITIVE_FIELDS_SET = new Set(SENSITIVE_FIELDS.map((f) => f.toLowerCase()));

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export interface LogContext {
  tenantId?: string;
  requestId?: string;
  traceId?: string;
  worker?: string;
  route?: string;
  actorId?: string;
  matterId?: string;
  [key: string]: unknown;
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_FIELDS_SET.has(key.toLowerCase());
}

export function sanitize(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item));
  }

  if (typeof obj === 'object' && obj !== null) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (!isSensitiveKey(key)) {
        result[key] = sanitize(value);
      }
    }
    return result;
  }

  return obj;
}

export interface CreateLoggerOptions {
  level: LogLevel;
  worker: string;
  baseContext?: LogContext;
}

export function createLogger(options: CreateLoggerOptions): Logger {
  const { level, worker, baseContext = {} } = options;
  const minPriority = LOG_LEVEL_PRIORITY[level];

  function shouldLog(callLevel: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[callLevel] >= minPriority;
  }

  function log(callLevel: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!shouldLog(callLevel)) {
      return;
    }

    const merged = { ...baseContext, ...context };
    const sanitized = sanitize(merged) as Record<string, unknown>;

    const entry = {
      timestamp: new Date().toISOString(),
      level: callLevel,
      message,
      worker,
      ...sanitized,
    };

    const output = JSON.stringify(entry);

    switch (callLevel) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  }

  return {
    debug(message: string, context?: Record<string, unknown>) {
      log('debug', message, context);
    },
    info(message: string, context?: Record<string, unknown>) {
      log('info', message, context);
    },
    warn(message: string, context?: Record<string, unknown>) {
      log('warn', message, context);
    },
    error(message: string, context?: Record<string, unknown>) {
      log('error', message, context);
    },
  };
}
