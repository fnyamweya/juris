export const AUTH_ERRORS = {
  MISSING_TOKEN: {
    code: 'AUTH_MISSING_TOKEN',
    message: 'Authentication required',
    status: 401,
  },
  INVALID_TOKEN: {
    code: 'AUTH_INVALID_TOKEN',
    message: 'Invalid authentication token',
    status: 401,
  },
  EXPIRED_TOKEN: {
    code: 'AUTH_EXPIRED_TOKEN',
    message: 'Authentication token expired',
    status: 401,
  },
  FORBIDDEN: {
    code: 'AUTH_FORBIDDEN',
    message: 'Insufficient permissions',
    status: 403,
  },
  TENANT_NOT_FOUND: {
    code: 'AUTH_TENANT_NOT_FOUND',
    message: 'Tenant not found',
    status: 404,
  },
  PRINCIPAL_NOT_FOUND: {
    code: 'AUTH_PRINCIPAL_NOT_FOUND',
    message: 'Principal not found in tenant',
    status: 403,
  },
  PRINCIPAL_DEACTIVATED: {
    code: 'AUTH_PRINCIPAL_DEACTIVATED',
    message: 'Account deactivated',
    status: 403,
  },
} as const;
