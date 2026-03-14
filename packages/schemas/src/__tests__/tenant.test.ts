import { describe, it, expect } from 'vitest';
import { createTenantRequestSchema } from '../tenant.js';

describe('createTenantRequestSchema', () => {
  it('accepts valid tenant creation input', () => {
    const valid = {
      slug: 'acme-corp',
      displayName: 'Acme Corporation',
      tier: 'PROFESSIONAL' as const,
      adminEmail: 'admin@acme.com',
    };
    const result = createTenantRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('accepts valid input with optional customDomain', () => {
    const valid = {
      slug: 'acme-corp',
      displayName: 'Acme Corporation',
      tier: 'ENTERPRISE' as const,
      adminEmail: 'admin@acme.com',
      customDomain: 'legal.acme.com',
    };
    const result = createTenantRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects slug that does not match pattern - leading hyphen', () => {
    const invalid = {
      slug: '-acme-corp',
      displayName: 'Acme Corporation',
      tier: 'STARTER' as const,
      adminEmail: 'admin@acme.com',
    };
    const result = createTenantRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects slug that does not match pattern - trailing hyphen', () => {
    const invalid = {
      slug: 'acme-corp-',
      displayName: 'Acme Corporation',
      tier: 'STARTER' as const,
      adminEmail: 'admin@acme.com',
    };
    const result = createTenantRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects slug that does not match pattern - uppercase', () => {
    const invalid = {
      slug: 'Acme-Corp',
      displayName: 'Acme Corporation',
      tier: 'STARTER' as const,
      adminEmail: 'admin@acme.com',
    };
    const result = createTenantRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects slug that is too short', () => {
    const invalid = {
      slug: 'ab',
      displayName: 'Acme Corporation',
      tier: 'STARTER' as const,
      adminEmail: 'admin@acme.com',
    };
    const result = createTenantRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const missingSlug = {
      displayName: 'Acme Corporation',
      tier: 'STARTER' as const,
      adminEmail: 'admin@acme.com',
    };
    expect(createTenantRequestSchema.safeParse(missingSlug).success).toBe(false);

    const missingDisplayName = {
      slug: 'acme-corp',
      tier: 'STARTER' as const,
      adminEmail: 'admin@acme.com',
    };
    expect(
      createTenantRequestSchema.safeParse(missingDisplayName).success
    ).toBe(false);

    const missingTier = {
      slug: 'acme-corp',
      displayName: 'Acme Corporation',
      adminEmail: 'admin@acme.com',
    };
    expect(createTenantRequestSchema.safeParse(missingTier).success).toBe(
      false
    );

    const missingEmail = {
      slug: 'acme-corp',
      displayName: 'Acme Corporation',
      tier: 'STARTER' as const,
    };
    expect(createTenantRequestSchema.safeParse(missingEmail).success).toBe(
      false
    );
  });

  it('validates tier enum', () => {
    const validTiers = ['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'REGULATED'];
    for (const tier of validTiers) {
      const result = createTenantRequestSchema.safeParse({
        slug: 'acme-corp',
        displayName: 'Acme Corporation',
        tier,
        adminEmail: 'admin@acme.com',
      });
      expect(result.success).toBe(true);
    }

    const invalidTier = {
      slug: 'acme-corp',
      displayName: 'Acme Corporation',
      tier: 'INVALID_TIER',
      adminEmail: 'admin@acme.com',
    };
    expect(createTenantRequestSchema.safeParse(invalidTier).success).toBe(
      false
    );
  });

  it('validates email format', () => {
    const invalidEmail = {
      slug: 'acme-corp',
      displayName: 'Acme Corporation',
      tier: 'STARTER' as const,
      adminEmail: 'not-an-email',
    };
    const result = createTenantRequestSchema.safeParse(invalidEmail);
    expect(result.success).toBe(false);
  });
});
