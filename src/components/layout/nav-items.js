import { routes } from '@/lib/routes'

// `module` is the custom-role permission key that shows the page to an "İşçi" (see lib/access.js); pages without
// one (roles, settings, users, audit logs) are never shown to staff.
export const navItems = [
  { label: 'İdarə paneli', href: routes.dashboard, module: 'dashboard' },
  { label: 'Anbar İdarəetməsi', href: routes.warehouses, module: ['warehouses', 'inventory'] },
  { label: 'Mağaza', href: routes.stores, module: 'stores' },
  { label: 'Məhsul', href: routes.products, module: 'products' },
  { label: 'Kontragent', href: routes.customers, module: 'customers' },
  { label: 'Alış', href: routes.purchases, module: 'purchases' },
  { label: 'Satış', href: routes.sales, module: 'sales' },
  { label: 'POS', href: routes.pos, module: 'pos' },
  { label: 'İnsan resursları', href: routes.hr, module: 'hr' },
  { label: 'Maliyyə', href: routes.finance, module: 'finance' },
  { label: 'Hesabatlar', href: routes.reports, module: 'reports' },
  // Company profile, invite code and user roles: admins and IT admins only (the API returns 403 to staff).
  { label: 'Rollar və İcazələr', href: routes.roles, adminOnly: true },
  { label: 'Parametrlər', href: routes.settings, adminOnly: true },
  // User accounts and their active/inactive status: IT admins only (PATCH /api/users/{id}/status).
  { label: 'İstifadəçilər', href: routes.users, itAdminOnly: true },
  // The audit trail: IT admins only (the API's [Authorize(Roles = AppRoles.ITAdmin)]).
  { label: 'Sistem Logları / Audit', href: routes.auditLogs, itAdminOnly: true },
]
