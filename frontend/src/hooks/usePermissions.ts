import { useAuth } from '../contexts/AuthContext';
import { hasPermission, hasAnyRole, getMenuItemsForRoles, getApiEndpointsForRoles } from '../config/roles';

export const usePermissions = () => {
  const { user } = useAuth();
  const userRoles = user?.roles || [];

  const canAccess = (permission: string): boolean => {
    return hasPermission(userRoles, permission);
  };

  const canAccessAny = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(userRoles, permission));
  };

  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  const hasAnyOfRoles = (roles: string[]): boolean => {
    return hasAnyRole(userRoles, roles);
  };

  const getMenuItems = (): string[] => {
    return getMenuItemsForRoles(userRoles);
  };

  const getApiEndpoints = (): string[] => {
    return getApiEndpointsForRoles(userRoles);
  };

  const canAccessApi = (endpoint: string): boolean => {
    const userEndpoints = getApiEndpoints();
    return userEndpoints.some(userEndpoint => {
      if (userEndpoint.endsWith('/*')) {
        const baseEndpoint = userEndpoint.slice(0, -2);
        return endpoint.startsWith(baseEndpoint);
      }
      return userEndpoint === endpoint;
    });
  };

  return {
    canAccess,
    canAccessAny,
    hasRole,
    hasAnyOfRoles,
    getMenuItems,
    getApiEndpoints,
    canAccessApi,
    userRoles
  };
}; 