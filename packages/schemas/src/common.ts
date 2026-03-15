import { z } from 'zod';

export const ulidSchema = z
  .string()
  .regex(/^[0-9A-HJKMNP-TV-Z]{26}$/, 'Must be a valid ULID (26 character Crockford Base32 string)');

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(25),
});

export const sortDirectionSchema = z.enum(['asc', 'desc']);

export const timestampSchema = z.string().datetime();

export const idempotencyKeySchema = z.string().min(1).max(128);

export const apiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
    details: z
      .array(
        z.object({
          field: z.string().optional(),
          message: z.string(),
        }),
      )
      .optional(),
  }),
});

export function paginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T): z.ZodTypeAny {
  return z.object({
    items: z.array(itemSchema),
    cursor: z.string().nullable(),
    hasMore: z.boolean(),
  });
}
