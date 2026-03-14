import type { ZodSchema } from "zod";
import { ok, err, type Result } from "@jusris/domain";

export interface ValidationError {
  code: string;
  message: string;
  retryable: false;
}

function formatValidationFailures(
  configName: string,
  issues: Array<{ path: (string | number)[]; message: string }>
): string {
  const lines = issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `  - ${path}: ${issue.message}`;
  });
  return `[${configName}] Configuration validation failed:\n${lines.join("\n")}`;
}

export function validateConfig<T>(
  schema: ZodSchema<T>,
  env: unknown,
  configName = "Config"
): T {
  const result = schema.safeParse(env);

  if (result.success) {
    return result.data;
  }

  const issues = result.error.issues.map((issue) => ({
    path: issue.path,
    message: issue.message,
  }));

  const message = formatValidationFailures(configName, issues);
  const error = new Error(message);
  (error as Error & { cause?: unknown }).cause = result.error;
  throw error;
}

export function safeValidateConfig<T>(
  schema: ZodSchema<T>,
  env: unknown,
  configName = "Config"
): Result<T, ValidationError> {
  const result = schema.safeParse(env);

  if (result.success) {
    return ok(result.data);
  }

  const issues = result.error.issues.map((issue) => ({
    path: issue.path,
    message: issue.message,
  }));

  const message = formatValidationFailures(configName, issues);

  return err({
    code: "CONFIG_VALIDATION_FAILED",
    message,
    retryable: false,
  });
}
