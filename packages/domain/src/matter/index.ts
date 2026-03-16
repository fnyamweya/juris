import type { PrincipalId } from '../identity/index.js';
import type { TenantId } from '../tenant/index.js';

export type MatterId = string & { readonly __brand: unique symbol };

export function createMatterId(value: string): MatterId {
  return value as MatterId;
}

export enum MatterStatus {
  DRAFT = 'DRAFT',
  OPEN = 'OPEN',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export enum MatterType {
  LITIGATION = 'LITIGATION',
  ADVISORY = 'ADVISORY',
  TRANSACTION = 'TRANSACTION',
  COMPLIANCE = 'COMPLIANCE',
  INVESTIGATION = 'INVESTIGATION',
  REGULATORY = 'REGULATORY',
  OTHER = 'OTHER',
}

export enum MatterMembershipRole {
  LEAD_COUNSEL = 'LEAD_COUNSEL',
  COUNSEL = 'COUNSEL',
  PARALEGAL = 'PARALEGAL',
  REVIEWER = 'REVIEWER',
  CLIENT_CONTACT = 'CLIENT_CONTACT',
  OBSERVER = 'OBSERVER',
}

export interface Matter {
  id: MatterId;
  tenantId: TenantId;
  title: string;
  description?: string;
  type: MatterType;
  status: MatterStatus;
  caseNumber?: string;
  clientId?: PrincipalId;
  leadCounselId?: PrincipalId;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export interface MatterMembership {
  matterId: MatterId;
  principalId: PrincipalId;
  role: MatterMembershipRole;
  grantedAt: Date;
  grantedBy: PrincipalId;
}
