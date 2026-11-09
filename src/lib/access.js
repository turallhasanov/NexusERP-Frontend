import { routes } from '@/lib/routes'
import { ROLE_STAFF } from '@/types/auth'

// Module keys of a custom role (see features/roles/permissions.js) → the pages they open. Admins, IT admins and
// platform admins see every page; only "staff" is limited, to the modules of the role they were given
// (`user.permissions`, from /api/auth/me). The API enforces the same rules (RequireModule), so this decides only what
// the UI shows. "inventory" (Məhsul qalıqları) is a tab of the warehouse page, so either key opens it.
export const MODULE_ROUTES = [
  { key: 'dashboard', path: routes.dashboard, exact: true },
  { key: ['warehouses', 'inventory'], path: routes.warehouses },
  { key: ['warehouses', 'inventory'], path: routes.inventory },
  { key: 'stores', path: routes.stores },
  { key: 'products', path: routes.products },
  { key: 'customers', path: routes.customers },
  { key: 'purchases', path: routes.purchases },
  { key: 'sales', path: routes.sales },
  { key: 'pos', path: routes.pos },
  { key: 'hr', path: routes.hr },
  { key: 'finance', path: routes.finance },
  { key: 'reports', path: routes.reports },
]

// A staff member without a role (or with an empty one) still gets the warehouse module, as before roles were enforced.
const DEFAULT_STAFF_MODULES = ['warehouses']

export function isStaff(user) {
  return user?.role === ROLE_STAFF
}

function staffModules(user) {
  return user?.permissions?.length ? user.permissions : DEFAULT_STAFF_MODULES
}

function moduleEntryFor(pathname) {
  return MODULE_ROUTES.find((entry) =>
    entry.exact ? pathname === entry.path : pathname === entry.path || pathname.startsWith(`${entry.path}/`),
  )
}

function allows(user, key) {
  const keys = Array.isArray(key) ? key : [key]
  return keys.some((k) => staffModules(user).includes(k))
}

// Does the user's role open this sidebar page? `key` is the item's module key (undefined for management pages).
export function canSeeModule(user, key) {
  return !isStaff(user) || (key !== undefined && allows(user, key))
}

// Staff: only the pages of their modules; pages outside the module list (roles, users, audit logs, ...) never.
export function canOpenPath(user, pathname) {
  if (!isStaff(user)) {
    return true
  }

  const entry = moduleEntryFor(pathname)
  return entry !== undefined && allows(user, entry.key)
}

// Where a user lands inside a company: the dashboard, or for staff the first page their role opens.
export function companyHome(user) {
  if (!isStaff(user)) {
    return routes.dashboard
  }

  return MODULE_ROUTES.find((entry) => entry.path !== routes.inventory && allows(user, entry.key))?.path ?? routes.warehouses
}
