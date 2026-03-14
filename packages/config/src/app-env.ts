import { z } from "zod";

const requiredString = () => z.string().min(1);

export const DashboardEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: requiredString(),
  NEXT_PUBLIC_API_URL: requiredString(),
  CF_ACCESS_TEAM_DOMAIN: requiredString(),
  CF_ACCESS_AUD: requiredString(),
});

export type DashboardEnv = z.infer<typeof DashboardEnvSchema>;

export const WebEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: requiredString(),
  NEXT_PUBLIC_API_URL: requiredString(),
});

export type WebEnv = z.infer<typeof WebEnvSchema>;
