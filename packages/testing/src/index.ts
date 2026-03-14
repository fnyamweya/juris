export {
  createTestTenant,
  createTestPrincipal,
  createTestActorContext,
  createTestMatter,
  createTestDocument,
  createTestAuditEvent,
  createTestIngestionJob,
} from './factories.js';

export {
  createMockLogger,
  createMockTokenVerifier,
  createMockPolicyEvaluator,
  createMockAuditEventStore,
} from './mocks.js';
export type { LogEntry } from './mocks.js';

export {
  expectAccessDenied,
  expectAccessAllowed,
  expectResultOk,
  expectResultErr,
} from './assertions.js';
