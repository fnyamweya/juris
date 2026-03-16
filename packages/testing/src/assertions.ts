import type { AccessDecision, Result } from '@jusris/domain';

export function expectAccessDenied(decision: AccessDecision): void {
  if (decision.allowed) {
    throw new Error(`Expected access denied but was allowed: ${decision.reason}`);
  }
}

export function expectAccessAllowed(decision: AccessDecision): void {
  if (!decision.allowed) {
    throw new Error(`Expected access allowed but was denied: ${decision.reason}`);
  }
}

export function expectResultOk<T>(result: Result<T, unknown>): T {
  if (!result.ok) {
    throw new Error(`Expected Ok result but got Err: ${JSON.stringify(result.error)}`);
  }
  return result.value;
}

export function expectResultErr<E>(result: Result<unknown, E>): E {
  if (result.ok) {
    throw new Error(`Expected Err result but got Ok: ${JSON.stringify(result.value)}`);
  }
  return result.error;
}
