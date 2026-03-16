import { PrincipalType } from '@juris/domain/identity';
import { z } from 'zod';

export const loginRequestSchema = z.object({
  email: z.string().email(),
  tenantSlug: z.string(),
});

export const tokenPayloadSchema = z.object({
  sub: z.string(),
  tenantId: z.string(),
  principalType: z.nativeEnum(PrincipalType),
  email: z.string().email(),
  iat: z.number(),
  exp: z.number(),
});
