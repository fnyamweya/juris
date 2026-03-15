import type { D1Client } from '@jusris/data';
import type { CloudflareApiClient } from '@jusris/cloudflare';
import type { Logger } from '@jusris/observability';

export type ProvisioningStep =
  | 'REGISTRY_COMMITTED'
  | 'D1_PROVISIONED'
  | 'TENANT_SCHEMA_APPLIED'
  | 'VECTOR_INDEX_PROVISIONED'
  | 'R2_PROVISIONED'
  | 'ACCESS_POLICY_CONFIGURED'
  | 'ROUTING_REGISTERED'
  | 'ACTIVE';

export interface ProvisioningResult {
  success: boolean;
  tenantId: string;
  currentStep?: ProvisioningStep;
  error?: string;
  retriesRemaining?: number;
}

const PROVISIONING_STEPS: ProvisioningStep[] = [
  'REGISTRY_COMMITTED',
  'D1_PROVISIONED',
  'TENANT_SCHEMA_APPLIED',
  'VECTOR_INDEX_PROVISIONED',
  'R2_PROVISIONED',
  'ACCESS_POLICY_CONFIGURED',
  'ROUTING_REGISTERED',
  'ACTIVE',
];

export class TenantProvisioningOrchestrator {
  constructor(
    private readonly deps: {
      db: D1Client;
      cfApi: CloudflareApiClient;
      logger: Logger;
    }
  ) { }

  async provision(
    tenantId: string,
    idempotencyKey: string
  ): Promise<ProvisioningResult> {
    const { db, cfApi, logger } = this.deps;

    try {
      const state = await db.queryOne<{
        current_step: string;
        retries_remaining: number;
        error_message: string | null;
      }>(
        `SELECT current_step, retries_remaining, error_message
         FROM provisioning_operations
         WHERE tenant_id = ? AND idempotency_key = ?`,
        [tenantId, idempotencyKey]
      );

      let currentStepIndex = PROVISIONING_STEPS.indexOf('REGISTRY_COMMITTED');
      let retriesRemaining = 3;

      if (state) {
        const idx = PROVISIONING_STEPS.indexOf(
          state.current_step as ProvisioningStep
        );
        if (idx >= 0) currentStepIndex = idx;
        retriesRemaining = state.retries_remaining ?? 3;
        if (state.error_message && state.current_step === 'FAILED') {
          return {
            success: false,
            tenantId,
            error: state.error_message,
            retriesRemaining,
          };
        }
      }

      for (let i = currentStepIndex; i < PROVISIONING_STEPS.length; i++) {
        const step = PROVISIONING_STEPS[i]!;

        await db.execute(
          `INSERT OR REPLACE INTO provisioning_operations
           (tenant_id, idempotency_key, current_step, retries_remaining, updated_at)
           VALUES (?, ?, ?, ?, datetime('now'))`,
          [tenantId, idempotencyKey, step, retriesRemaining]
        );

        try {
          logger.info('provisioning step', { tenantId, step });
          await this.executeStep(step, tenantId, cfApi);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : String(err);
          logger.error('provisioning step failed', {
            tenantId,
            step,
            error: errorMessage,
          });
          await db.execute(
            `UPDATE provisioning_operations
             SET current_step = 'FAILED', error_message = ?, retries_remaining = ?
             WHERE tenant_id = ? AND idempotency_key = ?`,
            [errorMessage, retriesRemaining - 1, tenantId, idempotencyKey]
          );
          return {
            success: false,
            tenantId,
            currentStep: step,
            error: errorMessage,
            retriesRemaining: retriesRemaining - 1,
          };
        }
      }

      return {
        success: true,
        tenantId,
        currentStep: 'ACTIVE',
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error('provisioning failed', { tenantId, error: errorMessage });
      return {
        success: false,
        tenantId,
        error: errorMessage,
      };
    }
  }

  private async executeStep(
    step: ProvisioningStep,
    _tenantId: string,
    _cfApi: CloudflareApiClient
  ): Promise<void> {
    switch (step) {
      case 'REGISTRY_COMMITTED':
        break;
      case 'D1_PROVISIONED':
        break;
      case 'TENANT_SCHEMA_APPLIED':
        break;
      case 'VECTOR_INDEX_PROVISIONED':
        break;
      case 'R2_PROVISIONED':
        break;
      case 'ACCESS_POLICY_CONFIGURED':
        break;
      case 'ROUTING_REGISTERED':
        break;
      case 'ACTIVE':
        break;
      default:
        break;
    }
  }
}
