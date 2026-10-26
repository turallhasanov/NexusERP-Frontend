import { routes } from '@/lib/routes'

export const navItems = [
  { label: 'İdarə paneli', href: routes.dashboard },
  { label: 'Anbar İdarəetməsi', href: routes.warehouses },
  { label: 'Mağaza', href: routes.stores },
  { label: 'Məhsul', href: routes.products },
  { label: 'Kontragent', href: routes.customers },
  { label: 'Alış', href: routes.purchases },
  { label: 'Satış', href: routes.sales },
  { label: 'POS', href: routes.pos },
  { label: 'İnsan resursları', href: routes.hr },
  { label: 'Maliyyə', href: routes.finance },
  { label: 'Hesabatlar', href: routes.reports },
  // Company profile, invite code and user roles: admins and IT admins only (the API returns 403 to staff).
  { label: 'Rollar və İcazələr', href: routes.roles, adminOnly: true },
  { label: 'Parametrlər', href: routes.settings, adminOnly: true },
  // The audit trail: IT admins only (the API's [Authorize(Roles = AppRoles.ITAdmin)]).
  { label: 'Sistem Logları / Audit', href: routes.auditLogs, itAdminOnly: true },
]
