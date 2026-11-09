export const ROLE_ADMIN = 'admin'
export const ROLE_IT_ADMIN = 'itadmin'
export const ROLE_STAFF = 'staff'
export const ROLE_SUPER_ADMIN = 'superadmin'

export const USER_ROLE_LABELS = {
  [ROLE_ADMIN]: 'İdarəçi',
  [ROLE_IT_ADMIN]: 'İT İdarəçisi',
  manager: 'Müdir',
  [ROLE_STAFF]: 'İşçi',
  [ROLE_SUPER_ADMIN]: 'Platforma admini',
}

// Roles a company admin or IT admin may assign to a user (PUT /api/companies/users/{id}/role).
export const COMPANY_ROLE_OPTIONS = [
  { id: ROLE_ADMIN, label: USER_ROLE_LABELS[ROLE_ADMIN] },
  { id: ROLE_IT_ADMIN, label: 'IT Admin / İT İdarəçisi' },
  { id: ROLE_STAFF, label: USER_ROLE_LABELS[ROLE_STAFF] },
]

// A user who joined a company and has not been approved by its IT admin yet (`isApproved` is absent in sessions
// stored before approval existed, which counts as approved).
export function isPendingApproval(user) {
  return user?.isApproved === false && user.role !== ROLE_SUPER_ADMIN
}

export function isSuperAdmin(user) {
  return user?.role === ROLE_SUPER_ADMIN
}

// IT admins only: permanently deleting employees (the API's [Authorize(Roles = AppRoles.ITAdmin)]).
export function isItAdmin(user) {
  return user?.role === ROLE_IT_ADMIN
}

// Company admins and IT admins: settings, user roles and destructive actions (the API's "CompanyManagers").
export function isCompanyManager(user) {
  return user?.role === ROLE_ADMIN || user?.role === ROLE_IT_ADMIN
}
