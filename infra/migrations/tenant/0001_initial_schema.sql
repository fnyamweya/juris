CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'DEACTIVATED', 'SUSPENDED', 'PENDING_INVITE')),
  external_identity_id TEXT,
  auth_method TEXT NOT NULL DEFAULT 'SSO'
    CHECK (auth_method IN ('SSO', 'EMAIL_PASSWORD', 'MAGIC_LINK')),
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE TABLE IF NOT EXISTS principals (
  id TEXT PRIMARY KEY NOT NULL,
  principal_type TEXT NOT NULL
    CHECK (principal_type IN ('INTERNAL_USER', 'EXTERNAL_CLIENT', 'SERVICE_ACCOUNT', 'SYSTEM')),
  user_id TEXT REFERENCES users(id),
  email TEXT,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'DEACTIVATED', 'SUSPENDED')),
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_principals_type ON principals(principal_type);
CREATE INDEX IF NOT EXISTS idx_principals_user ON principals(user_id);
CREATE INDEX IF NOT EXISTS idx_principals_email ON principals(email);

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions TEXT NOT NULL,
  is_system INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS policies (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  effect TEXT NOT NULL CHECK (effect IN ('ALLOW', 'DENY')),
  actor_types TEXT NOT NULL,
  actions TEXT NOT NULL,
  resource_types TEXT NOT NULL,
  conditions TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  version TEXT NOT NULL DEFAULT '1',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS role_bindings (
  id TEXT PRIMARY KEY NOT NULL,
  principal_id TEXT NOT NULL REFERENCES principals(id),
  role_id TEXT NOT NULL REFERENCES roles(id),
  scope TEXT NOT NULL CHECK (scope IN ('TENANT', 'MATTER', 'DOCUMENT')),
  scope_id TEXT NOT NULL,
  granted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  granted_by TEXT NOT NULL,
  revoked_at TEXT,
  UNIQUE(principal_id, role_id, scope, scope_id)
);

CREATE INDEX IF NOT EXISTS idx_role_bindings_principal ON role_bindings(principal_id);
CREATE INDEX IF NOT EXISTS idx_role_bindings_scope ON role_bindings(scope, scope_id);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_name TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS matters (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  matter_type TEXT NOT NULL
    CHECK (matter_type IN ('LITIGATION', 'ADVISORY', 'TRANSACTION', 'COMPLIANCE', 'INVESTIGATION', 'REGULATORY', 'OTHER')),
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'OPEN', 'ACTIVE', 'ON_HOLD', 'CLOSED', 'ARCHIVED')),
  case_number TEXT,
  client_id TEXT REFERENCES clients(id),
  lead_counsel_id TEXT REFERENCES principals(id),
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  closed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_matters_status ON matters(status);
CREATE INDEX IF NOT EXISTS idx_matters_client ON matters(client_id);
CREATE INDEX IF NOT EXISTS idx_matters_lead ON matters(lead_counsel_id);
CREATE INDEX IF NOT EXISTS idx_matters_case_number ON matters(case_number);

CREATE TABLE IF NOT EXISTS matter_memberships (
  id TEXT PRIMARY KEY NOT NULL,
  matter_id TEXT NOT NULL REFERENCES matters(id),
  principal_id TEXT NOT NULL REFERENCES principals(id),
  role TEXT NOT NULL
    CHECK (role IN ('LEAD_COUNSEL', 'COUNSEL', 'PARALEGAL', 'REVIEWER', 'CLIENT_CONTACT', 'OBSERVER')),
  granted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  granted_by TEXT NOT NULL,
  revoked_at TEXT,
  UNIQUE(matter_id, principal_id)
);

CREATE INDEX IF NOT EXISTS idx_matter_memberships_matter ON matter_memberships(matter_id);
CREATE INDEX IF NOT EXISTS idx_matter_memberships_principal ON matter_memberships(principal_id);

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY NOT NULL,
  matter_id TEXT NOT NULL REFERENCES matters(id),
  title TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  classification TEXT NOT NULL DEFAULT 'INTERNAL'
    CHECK (classification IN ('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'PRIVILEGED', 'RESTRICTED')),
  status TEXT NOT NULL DEFAULT 'PENDING_UPLOAD'
    CHECK (status IN ('PENDING_UPLOAD', 'UPLOADED', 'PROCESSING', 'AVAILABLE', 'REDACTED', 'QUARANTINED', 'DELETED')),
  uploaded_by TEXT NOT NULL REFERENCES principals(id),
  storage_key TEXT,
  checksum_sha256 TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_documents_matter ON documents(matter_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_classification ON documents(classification);

CREATE TABLE IF NOT EXISTS document_versions (
  id TEXT PRIMARY KEY NOT NULL,
  document_id TEXT NOT NULL REFERENCES documents(id),
  version INTEGER NOT NULL,
  storage_key TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  checksum_sha256 TEXT,
  encryption_envelope TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  created_by TEXT NOT NULL,
  UNIQUE(document_id, version)
);

CREATE INDEX IF NOT EXISTS idx_document_versions_doc ON document_versions(document_id);

CREATE TABLE IF NOT EXISTS document_acl (
  id TEXT PRIMARY KEY NOT NULL,
  document_id TEXT NOT NULL REFERENCES documents(id),
  principal_id TEXT NOT NULL REFERENCES principals(id),
  permission TEXT NOT NULL
    CHECK (permission IN ('VIEW', 'VIEW_REDACTED', 'EDIT', 'DELETE', 'SHARE', 'DOWNLOAD')),
  granted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  granted_by TEXT NOT NULL,
  expires_at TEXT,
  revoked_at TEXT,
  UNIQUE(document_id, principal_id, permission)
);

CREATE INDEX IF NOT EXISTS idx_document_acl_doc ON document_acl(document_id);
CREATE INDEX IF NOT EXISTS idx_document_acl_principal ON document_acl(principal_id);

CREATE TABLE IF NOT EXISTS evidence_items (
  id TEXT PRIMARY KEY NOT NULL,
  matter_id TEXT NOT NULL REFERENCES matters(id),
  document_id TEXT NOT NULL REFERENCES documents(id),
  exhibit_number TEXT,
  description TEXT,
  admitted_at TEXT,
  admitted_by TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ADMITTED', 'EXCLUDED', 'WITHDRAWN')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_evidence_items_matter ON evidence_items(matter_id);

CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY NOT NULL,
  document_id TEXT NOT NULL REFERENCES documents(id),
  principal_id TEXT NOT NULL REFERENCES principals(id),
  status TEXT NOT NULL DEFAULT 'INITIATED'
    CHECK (status IN ('INITIATED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED')),
  size_bytes INTEGER,
  storage_key TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_uploads_document ON uploads(document_id);

CREATE TABLE IF NOT EXISTS ingestion_jobs (
  id TEXT PRIMARY KEY NOT NULL,
  document_id TEXT NOT NULL REFERENCES documents(id),
  status TEXT NOT NULL DEFAULT 'QUEUED'
    CHECK (status IN ('QUEUED', 'FETCHING', 'EXTRACTING', 'CLASSIFYING', 'REDACTING', 'CHUNKING', 'EMBEDDING', 'INDEXING', 'COMPLETE', 'FAILED', 'RETRYING')),
  step_details TEXT,
  retries_remaining INTEGER NOT NULL DEFAULT 3,
  idempotency_key TEXT NOT NULL UNIQUE,
  error_message TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_document ON ingestion_jobs(document_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status ON ingestion_jobs(status);

CREATE TABLE IF NOT EXISTS redactions (
  id TEXT PRIMARY KEY NOT NULL,
  document_id TEXT NOT NULL REFERENCES documents(id),
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  category TEXT NOT NULL
    CHECK (category IN ('PII_NAME', 'PII_SSN', 'PII_EMAIL', 'PII_PHONE', 'PII_ADDRESS', 'PRIVILEGED', 'CUSTOM')),
  confidence REAL NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('DETERMINISTIC', 'AI_ASSISTED')),
  reviewed_by TEXT REFERENCES principals(id),
  reviewed_at TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'OVERRIDDEN')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_redactions_document ON redactions(document_id);
CREATE INDEX IF NOT EXISTS idx_redactions_status ON redactions(status);

CREATE TABLE IF NOT EXISTS vector_chunks (
  id TEXT PRIMARY KEY NOT NULL,
  document_id TEXT NOT NULL REFERENCES documents(id),
  chunk_index INTEGER NOT NULL,
  content_preview TEXT,
  page_number INTEGER,
  anchor_ref TEXT,
  token_count INTEGER,
  embedding_model TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_vector_chunks_document ON vector_chunks(document_id);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY NOT NULL,
  scope TEXT NOT NULL DEFAULT 'TENANT_WIDE'
    CHECK (scope IN ('TENANT_WIDE', 'MATTER_SCOPED')),
  matter_id TEXT REFERENCES matters(id),
  title TEXT,
  created_by TEXT NOT NULL REFERENCES principals(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_conversations_matter ON conversations(matter_id);
CREATE INDEX IF NOT EXISTS idx_conversations_creator ON conversations(created_by);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY NOT NULL,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  role TEXT NOT NULL CHECK (role IN ('USER', 'ASSISTANT', 'SYSTEM')),
  content TEXT NOT NULL,
  citations TEXT,
  retrieved_chunk_ids TEXT,
  token_count INTEGER,
  model_used TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at);

CREATE TABLE IF NOT EXISTS audit_trail (
  id TEXT PRIMARY KEY NOT NULL,
  actor_id TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  matter_id TEXT,
  metadata TEXT,
  previous_hash TEXT NOT NULL,
  event_hash TEXT NOT NULL,
  signature_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_trail_actor ON audit_trail(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_action ON audit_trail(action, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_trail_resource ON audit_trail(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_matter ON audit_trail(matter_id);

CREATE TABLE IF NOT EXISTS signed_audit_roots (
  id TEXT PRIMARY KEY NOT NULL,
  root_hash TEXT NOT NULL,
  event_count INTEGER NOT NULL,
  first_event_id TEXT NOT NULL,
  last_event_id TEXT NOT NULL,
  signer_key_version TEXT NOT NULL,
  signature TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS shares (
  id TEXT PRIMARY KEY NOT NULL,
  document_id TEXT REFERENCES documents(id),
  matter_id TEXT REFERENCES matters(id),
  shared_with_principal_id TEXT NOT NULL REFERENCES principals(id),
  shared_by TEXT NOT NULL REFERENCES principals(id),
  permission TEXT NOT NULL
    CHECK (permission IN ('VIEW', 'VIEW_REDACTED', 'DOWNLOAD', 'UPLOAD')),
  expires_at TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  revoked_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_shares_principal ON shares(shared_with_principal_id);
CREATE INDEX IF NOT EXISTS idx_shares_document ON shares(document_id);
CREATE INDEX IF NOT EXISTS idx_shares_matter ON shares(matter_id);

CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  principal_type TEXT NOT NULL
    CHECK (principal_type IN ('INTERNAL_USER', 'EXTERNAL_CLIENT')),
  role_id TEXT REFERENCES roles(id),
  matter_id TEXT REFERENCES matters(id),
  invited_by TEXT NOT NULL REFERENCES principals(id),
  token_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  accepted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS matter_tags (
  matter_id TEXT NOT NULL REFERENCES matters(id),
  tag_id TEXT NOT NULL REFERENCES tags(id),
  PRIMARY KEY (matter_id, tag_id)
);

CREATE TABLE IF NOT EXISTS document_tags (
  document_id TEXT NOT NULL REFERENCES documents(id),
  tag_id TEXT NOT NULL REFERENCES tags(id),
  PRIMARY KEY (document_id, tag_id)
);

CREATE TABLE IF NOT EXISTS retention_policies (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  retention_days INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('ARCHIVE', 'DELETE', 'EXPORT_THEN_DELETE')),
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT OR IGNORE INTO roles (id, name, description, permissions, is_system) VALUES
  ('ROLE_TENANT_ADMIN', 'Tenant Administrator', 'Full administrative access to tenant', '["VIEW","EDIT","DELETE","SHARE","ADMIN","UPLOAD","DOWNLOAD","REDACT","SEARCH","CHAT"]', 1),
  ('ROLE_SENIOR_COUNSEL', 'Senior Counsel', 'Full access to matters and documents including originals', '["VIEW","EDIT","SHARE","UPLOAD","DOWNLOAD","SEARCH","CHAT"]', 1),
  ('ROLE_COUNSEL', 'Counsel', 'Standard legal professional access', '["VIEW","EDIT","UPLOAD","DOWNLOAD","SEARCH","CHAT"]', 1),
  ('ROLE_PARALEGAL', 'Paralegal', 'Access to assigned matters, redacted documents by default', '["VIEW","UPLOAD","SEARCH","CHAT"]', 1),
  ('ROLE_REVIEWER', 'Reviewer', 'Read-only access to assigned matters', '["VIEW","SEARCH"]', 1),
  ('ROLE_CLIENT_CONTACT', 'Client Contact', 'External client portal access, shared items only', '["VIEW","UPLOAD"]', 1),
  ('ROLE_BILLING_ADMIN', 'Billing Administrator', 'Usage and billing visibility, no legal content access', '["VIEW","ADMIN"]', 1),
  ('ROLE_OBSERVER', 'Observer', 'Minimal read-only access to assigned matters', '["VIEW"]', 1);
