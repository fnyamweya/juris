export {
  createPolicyEvaluator,
} from './policy-evaluator.js';
export type { PolicyEvaluator, CreatePolicyEvaluatorParams } from './policy-evaluator.js';

export type { RoleBindingLoader, EffectiveBinding, BindingScope } from './role-binding-loader.js';

export type {
  PolicyLoader,
  PolicyRule,
  PolicyCondition,
  VersionedPolicyBundle,
} from './policy-loader.js';

export {
  canViewMatter,
  canEditMatter,
  canViewDocument,
  canUploadEvidence,
} from './matter-access.js';
