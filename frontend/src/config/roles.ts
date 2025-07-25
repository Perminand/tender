// Централизованная конфигурация ролей и прав доступа
export interface RolePermissions {
  [role: string]: {
    menuItems: string[];
    apiEndpoints: string[];
    features: string[];
    defaultRoute: string;
  };
}

export const ROLE_PERMISSIONS: RolePermissions = {
  'ROLE_ADMIN': {
    menuItems: [
      'dashboard',
      'requests/registry',
      'tenders',
      'proposals',
      'contracts',
      'deliveries',
      'payments',
      'documents',
      'notifications',
      'counterparties',
      'materials',
      'reference/categories',
      'reference/material-types',
      'reference/units',
      'warehouses',
      'reference/projects',
      'reference/contact-types',
      'price-analysis',
      'settings',
      'users',
      'audit-log'
    ],
    apiEndpoints: [
      '/api/dashboard',
      '/api/alerts/*',
      '/api/requests/*',
      '/api/tenders/*',
      '/api/proposals/*',
      '/api/contracts/*',
      '/api/deliveries/*',
      '/api/payments/*',
      '/api/documents/*',
      '/api/notifications/*',
      '/api/counterparties/*',
      '/api/materials/*',
      '/api/categories/*',
      '/api/material-types/*',
      '/api/units/*',
      '/api/warehouses/*',
      '/api/projects/*',
      '/api/contact-types/*',
      '/api/price-analysis/*',
      '/api/settings/*',
      '/api/users/*'
    ],
    features: [
      'dashboard',
      'tender_management',
      'contract_management',
      'delivery_management',
      'payment_management',
      'document_management',
      'notification_management',
      'reference_books',
      'analytics',
      'settings',
      'user_management'
    ],
    defaultRoute: '/dashboard'
  },
  'ROLE_MANAGER': {
    menuItems: [
      'dashboard',
      'requests/registry',
      'tenders',
      'proposals',
      'contracts',
      'deliveries',
      'payments',
      'documents',
      'notifications',
      'counterparties',
      'materials',
      'reference/categories',
      'reference/material-types',
      'reference/units',
      'warehouses',
      'reference/projects',
      'reference/contact-types',
      'price-analysis',
      'settings'
    ],
    apiEndpoints: [
      '/api/dashboard',
      '/api/alerts/*',
      '/api/requests/*',
      '/api/tenders/*',
      '/api/proposals/*',
      '/api/contracts/*',
      '/api/deliveries/*',
      '/api/payments/*',
      '/api/documents/*',
      '/api/notifications/*',
      '/api/counterparties/*',
      '/api/materials/*',
      '/api/categories/*',
      '/api/material-types/*',
      '/api/units/*',
      '/api/warehouses/*',
      '/api/projects/*',
      '/api/contact-types/*',
      '/api/price-analysis/*',
      '/api/settings/*'
    ],
    features: [
      'dashboard',
      'tender_management',
      'contract_management',
      'delivery_management',
      'payment_management',
      'document_management',
      'notification_management',
      'reference_books',
      'analytics',
      'settings'
    ],
    defaultRoute: '/requests/registry'
  },
  'ROLE_CUSTOMER': {
    menuItems: [
      'dashboard',
      'requests/registry'
    ],
    apiEndpoints: [
      '/api/dashboard',
      '/api/alerts/unread',
      '/api/alerts/stats/unread-count',
      '/api/alerts/*/read',
      '/api/alerts/mark-all-read',
      '/api/requests/*'
    ],
    features: [
      'dashboard',
      'request_viewing'
    ],
    defaultRoute: '/contracts'
  },
  'ROLE_SUPPLIER': {
    menuItems: [
      'tenders',
      'proposals'
    ],
    apiEndpoints: [
      '/api/tenders/*',
      '/api/proposals/*'
    ],
    features: [
      'tender_viewing',
      'proposal_management'
    ],
    defaultRoute: '/tenders'
  },
  'ROLE_ANALYST': {
    menuItems: [
      'dashboard',
      'price-analysis'
    ],
    apiEndpoints: [
      '/api/dashboard',
      '/api/price-analysis/*'
    ],
    features: [
      'dashboard',
      'analytics'
    ],
    defaultRoute: '/dashboard'
  },
  'ROLE_VIEWER': {
    menuItems: [
      'dashboard',
      'requests/registry',
      'tenders',
      'contracts',
      'deliveries',
      'documents',
      'notifications'
    ],
    apiEndpoints: [
      '/api/dashboard',
      '/api/alerts/*',
      '/api/requests/*',
      '/api/tenders/*',
      '/api/contracts/*',
      '/api/deliveries/*',
      '/api/documents/*',
      '/api/notifications/*'
    ],
    features: [
      'dashboard',
      'tender_viewing',
      'contract_viewing',
      'delivery_viewing',
      'document_viewing',
      'notification_viewing'
    ],
    defaultRoute: '/dashboard'
  }
};

// Утилиты для проверки прав доступа
export const hasPermission = (userRoles: string[], permission: string): boolean => {
  return userRoles.some(role => {
    const roleConfig = ROLE_PERMISSIONS[role];
    return roleConfig && (
      roleConfig.menuItems.includes(permission) ||
      roleConfig.features.includes(permission) ||
      roleConfig.apiEndpoints.some(endpoint => 
        endpoint === permission || 
        (endpoint.endsWith('/*') && permission.startsWith(endpoint.slice(0, -2)))
      )
    );
  });
};

export const hasAnyRole = (userRoles: string[], requiredRoles: string[]): boolean => {
  return userRoles.some(role => requiredRoles.includes(role));
};

export const getDefaultRoute = (userRoles: string[]): string => {
  for (const role of userRoles) {
    const roleConfig = ROLE_PERMISSIONS[role];
    if (roleConfig) {
      return roleConfig.defaultRoute;
    }
  }
  return '/login';
};

export const getMenuItemsForRoles = (userRoles: string[]): string[] => {
  const menuItems = new Set<string>();
  
  userRoles.forEach(role => {
    const roleConfig = ROLE_PERMISSIONS[role];
    if (roleConfig) {
      roleConfig.menuItems.forEach(item => menuItems.add(item));
    }
  });
  
  return Array.from(menuItems);
};

export const getApiEndpointsForRoles = (userRoles: string[]): string[] => {
  const endpoints = new Set<string>();
  
  userRoles.forEach(role => {
    const roleConfig = ROLE_PERMISSIONS[role];
    if (roleConfig) {
      roleConfig.apiEndpoints.forEach(endpoint => endpoints.add(endpoint));
    }
  });
  
  return Array.from(endpoints);
}; 