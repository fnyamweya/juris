import { z } from "zod";

const d1Binding = z.custom<unknown>((val) => val != null, {
  message: "D1 binding must be present",
});

const queueBinding = z.custom<unknown>((val) => val != null, {
  message: "Queue binding must be present",
});

const r2Binding = z.custom<unknown>((val) => val != null, {
  message: "R2 binding must be present",
});

const vectorizeBinding = z.custom<unknown>((val) => val != null, {
  message: "Vectorize binding must be present",
});

const serviceBinding = z.custom<unknown>((val) => val != null, {
  message: "Service binding must be present",
});

const requiredString = () => z.string().min(1);

export const DispatchWorkerEnvSchema = z.object({
  CF_ACCESS_TEAM_DOMAIN: requiredString(),
  CF_ACCESS_AUD: requiredString(),
  MASTER_REGISTRY_DB: d1Binding,
  TENANT_DISPATCH: serviceBinding,
  LOG_LEVEL: requiredString(),
  ENVIRONMENT: requiredString(),
});

export type DispatchWorkerEnv = z.infer<typeof DispatchWorkerEnvSchema>;

export const ProvisioningWorkerEnvSchema = z.object({
  MASTER_REGISTRY_DB: d1Binding,
  CLOUDFLARE_ACCOUNT_ID: requiredString(),
  CLOUDFLARE_API_TOKEN: requiredString(),
  PROVISIONING_QUEUE: queueBinding,
  LOG_LEVEL: requiredString(),
  ENVIRONMENT: requiredString(),
});

export type ProvisioningWorkerEnv = z.infer<typeof ProvisioningWorkerEnvSchema>;

export const TenantRuntimeWorkerEnvSchema = z.object({
  TENANT_DB: d1Binding,
  TENANT_STORAGE: r2Binding,
  TENANT_VECTOR_INDEX: vectorizeBinding,
  AI_GATEWAY: requiredString(),
  LOG_LEVEL: requiredString(),
  ENVIRONMENT: requiredString(),
});

export type TenantRuntimeWorkerEnv = z.infer<typeof TenantRuntimeWorkerEnvSchema>;

export const IngestionWorkerEnvSchema = z.object({
  INGESTION_QUEUE: queueBinding,
  AI_GATEWAY: requiredString(),
  LOG_LEVEL: requiredString(),
  ENVIRONMENT: requiredString(),
});

export type IngestionWorkerEnv = z.infer<typeof IngestionWorkerEnvSchema>;

export const WebhookWorkerEnvSchema = z.object({
  LOG_LEVEL: requiredString(),
  ENVIRONMENT: requiredString(),
});

export type WebhookWorkerEnv = z.infer<typeof WebhookWorkerEnvSchema>;

export const MaintenanceWorkerEnvSchema = z.object({
  MASTER_REGISTRY_DB: d1Binding,
  LOG_LEVEL: requiredString(),
  ENVIRONMENT: requiredString(),
});

export type MaintenanceWorkerEnv = z.infer<typeof MaintenanceWorkerEnvSchema>;
