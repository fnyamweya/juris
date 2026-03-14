export interface ProvisioningWorkerEnv {
  readonly MASTER_REGISTRY_DB: D1Database;
  readonly PROVISIONING_QUEUE: Queue;
  readonly CLOUDFLARE_ACCOUNT_ID: string;
  readonly CLOUDFLARE_API_TOKEN: string;
  readonly ENVIRONMENT: string;
  readonly LOG_LEVEL: string;
}
