import type { ActorContext, AccessDecision } from '@jusris/domain';
import { Permission } from '@jusris/domain';
import type { PolicyEvaluator } from './policy-evaluator.js';

const RESOURCE_MATTER = 'matter';
const RESOURCE_DOCUMENT = 'document';

export async function canViewMatter(
  actor: ActorContext,
  matterId: string,
  evaluator: PolicyEvaluator
): Promise<AccessDecision> {
  return evaluator.evaluate({
    actor,
    action: Permission.VIEW,
    resourceType: RESOURCE_MATTER,
    resourceId: matterId,
    matterId,
  });
}

export async function canEditMatter(
  actor: ActorContext,
  matterId: string,
  evaluator: PolicyEvaluator
): Promise<AccessDecision> {
  return evaluator.evaluate({
    actor,
    action: Permission.EDIT,
    resourceType: RESOURCE_MATTER,
    resourceId: matterId,
    matterId,
  });
}

export async function canViewDocument(
  actor: ActorContext,
  documentId: string,
  matterId: string,
  evaluator: PolicyEvaluator
): Promise<AccessDecision> {
  return evaluator.evaluate({
    actor,
    action: Permission.VIEW,
    resourceType: RESOURCE_DOCUMENT,
    resourceId: documentId,
    matterId,
  });
}

export async function canUploadEvidence(
  actor: ActorContext,
  matterId: string,
  evaluator: PolicyEvaluator
): Promise<AccessDecision> {
  return evaluator.evaluate({
    actor,
    action: Permission.UPLOAD,
    resourceType: RESOURCE_MATTER,
    resourceId: matterId,
    matterId,
  });
}
