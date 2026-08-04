export type AppRole = 'ADMIN' | 'MANAGER' | 'ACCOUNTANT' | 'SALES_SUPERVISOR' | 'SALES_REPRESENTATIVE' | 'USER';

export const RolePermissions = {
  CAN_VIEW_FINANCIAL_SUMMARY: ['ADMIN', 'MANAGER', 'ACCOUNTANT'],
  CAN_VIEW_PROFIT: ['ADMIN', 'MANAGER', 'ACCOUNTANT'],
  CAN_VIEW_COD: ['ADMIN', 'MANAGER', 'ACCOUNTANT'],
  CAN_VIEW_DISCOUNTS: ['ADMIN', 'MANAGER', 'ACCOUNTANT'],
};

export const hasPermission = (userRole: AppRole | string, permission: string[]) => {
  if (userRole === 'ADMIN') return true; // Admin has all permissions
  return permission.includes(userRole);
};
