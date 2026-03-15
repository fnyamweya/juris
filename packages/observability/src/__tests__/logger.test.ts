import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createLogger,
  sanitize,
  SENSITIVE_FIELDS,
} from '../logger.js';

describe('logger', () => {
  let consoleSpy: { log: ReturnType<typeof vi.spyOn>; warn: ReturnType<typeof vi.spyOn>; error: ReturnType<typeof vi.spyOn> };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => { }),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => { }),
      error: vi.spyOn(console, 'error').mockImplementation(() => { }),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('JSON output', () => {
    it('outputs valid JSON', () => {
      const logger = createLogger({ level: 'info', worker: 'test-worker' });
      logger.info('hello');

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      const output = consoleSpy.log.mock.calls[0]![0] as string;
      expect(() => JSON.parse(output)).not.toThrow();
      const parsed = JSON.parse(output);
      expect(parsed.message).toBe('hello');
      expect(parsed.level).toBe('info');
      expect(parsed.worker).toBe('test-worker');
      expect(parsed.timestamp).toBeDefined();
    });
  });

  describe('sensitive fields stripping', () => {
    it('strips password from context', () => {
      const logger = createLogger({ level: 'info', worker: 'w' });
      logger.info('msg', { password: 'secret123', userId: 'u1' });

      const parsed = JSON.parse(consoleSpy.log.mock.calls[0]![0] as string);
      expect(parsed.password).toBeUndefined();
      expect(parsed.userId).toBe('u1');
    });

    it('strips all SENSITIVE_FIELDS', () => {
      const logger = createLogger({ level: 'info', worker: 'w' });
      const ctx: Record<string, unknown> = {};
      for (const field of SENSITIVE_FIELDS) {
        ctx[field] = 'should-not-appear';
      }
      ctx['safeField'] = 'visible';

      logger.info('msg', ctx);

      const parsed = JSON.parse(consoleSpy.log.mock.calls[0]![0] as string);
      for (const field of SENSITIVE_FIELDS) {
        expect(parsed[field]).toBeUndefined();
      }
      expect(parsed['safeField']).toBe('visible');
    });

    it('strips sensitive fields in nested objects', () => {
      const logger = createLogger({ level: 'info', worker: 'w' });
      logger.info('msg', {
        user: { name: 'Alice', password: 'pwd', token: 't' },
      });

      const parsed = JSON.parse(consoleSpy.log.mock.calls[0]![0] as string);
      expect(parsed.user.name).toBe('Alice');
      expect(parsed.user.password).toBeUndefined();
      expect(parsed.user.token).toBeUndefined();
    });

    it('sanitize function strips sensitive fields', () => {
      const obj = { a: 1, password: 'x', nested: { secret: 'y', ok: true } };
      const result = sanitize(obj) as Record<string, unknown>;
      expect(result['a']).toBe(1);
      expect(result['password']).toBeUndefined();
      expect((result['nested'] as Record<string, unknown>)['secret']).toBeUndefined();
      expect((result['nested'] as Record<string, unknown>)['ok']).toBe(true);
    });
  });

  describe('log level filtering', () => {
    it('filters out debug when level is info', () => {
      const logger = createLogger({ level: 'info', worker: 'w' });
      logger.debug('debug-msg');
      logger.info('info-msg');

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(JSON.parse(consoleSpy.log.mock.calls[0]![0] as string).message).toBe('info-msg');
    });

    it('filters out info when level is warn', () => {
      const logger = createLogger({ level: 'warn', worker: 'w' });
      logger.info('info-msg');
      logger.warn('warn-msg');

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(JSON.parse(consoleSpy.warn.mock.calls[0]![0] as string).message).toBe('warn-msg');
    });

    it('allows all levels when level is debug', () => {
      const logger = createLogger({ level: 'debug', worker: 'w' });
      logger.debug('d');
      logger.info('i');
      logger.warn('w');
      logger.error('e');

      expect(consoleSpy.log).toHaveBeenCalledTimes(2);
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('context merging', () => {
    it('merges base context with per-call context', () => {
      const logger = createLogger({
        level: 'info',
        worker: 'worker-a',
        baseContext: { tenantId: 't1', requestId: 'r1' },
      });

      logger.info('msg', { matterId: 'm1' });

      const parsed = JSON.parse(consoleSpy.log.mock.calls[0]![0] as string);
      expect(parsed.tenantId).toBe('t1');
      expect(parsed.requestId).toBe('r1');
      expect(parsed.matterId).toBe('m1');
      expect(parsed.worker).toBe('worker-a');
    });

    it('per-call context overrides base context', () => {
      const logger = createLogger({
        level: 'info',
        worker: 'w',
        baseContext: { requestId: 'base-r' },
      });

      logger.info('msg', { requestId: 'call-r' });

      const parsed = JSON.parse(consoleSpy.log.mock.calls[0]![0] as string);
      expect(parsed.requestId).toBe('call-r');
    });
  });

  describe('requestId and traceId propagation', () => {
    it('includes requestId and traceId from base context in logs', () => {
      const logger = createLogger({
        level: 'info',
        worker: 'w',
        baseContext: { requestId: 'req-123', traceId: 'trace-456' },
      });

      logger.info('msg');

      const parsed = JSON.parse(consoleSpy.log.mock.calls[0]![0] as string);
      expect(parsed.requestId).toBe('req-123');
      expect(parsed.traceId).toBe('trace-456');
    });

    it('includes requestId and traceId from per-call context', () => {
      const logger = createLogger({ level: 'info', worker: 'w' });
      logger.info('msg', { requestId: 'r1', traceId: 't1' });

      const parsed = JSON.parse(consoleSpy.log.mock.calls[0]![0] as string);
      expect(parsed.requestId).toBe('r1');
      expect(parsed.traceId).toBe('t1');
    });
  });
});
