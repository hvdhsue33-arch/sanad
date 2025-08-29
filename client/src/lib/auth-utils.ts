export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*/.test(error.message) || error.message.includes("Authentication required");
}

export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

export function canManageFinances(userRole: string): boolean {
  return hasPermission(userRole, ['super_admin', 'owner', 'manager', 'accountant']);
}

export function canManageInventory(userRole: string): boolean {
  return hasPermission(userRole, ['super_admin', 'owner', 'manager', 'warehouse_keeper']);
}

export function canManageUsers(userRole: string): boolean {
  return hasPermission(userRole, ['super_admin', 'owner']);
}

export function canDeleteData(userRole: string): boolean {
  return hasPermission(userRole, ['super_admin', 'owner', 'manager']);
}
