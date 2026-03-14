import { z } from 'zod';
import { TenantStatus, TenantTier } from '@jusris/domain/tenant';
import { ulidSchema } from './common.js';

const tenantSlugSchema = z
  .string()
  .min(3, 'Slug must be at least 3 characters')
  .max(63, 'Slug must be at most 63 characters')
  .regex(
    /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
    'Slug must start and end with alphanumeric, contain only lowercase letters, numbers, and hyphens'
  );

export const createTenantRequestSchema = z.object({
  slug: tenantSlugSchema,
  displayName: z.string().min(1, 'Display name is required').max(200),
  tier: z.nativeEnum(TenantTier),
  adminEmail: z.string().email(),
  customDomain: z.string().optional(),
});

export const tenantResponseSchema = z.object({
  id: ulidSchema,
  slug: z.string(),
  displayName: z.string(),
  tier: z.nativeEnum(TenantTier),
  status: z.nativeEnum(TenantStatus),
  customDomain: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const tenantStatusResponseSchema = z.object({
  id: ulidSchema,
  status: z.nativeEnum(TenantStatus),
  step: z.string().optional(),
  error: z.string().optional(),
});
