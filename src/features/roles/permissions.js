// Module keys the API accepts in a role's permissions (AppPermissions.All), in the sidebar's order.
export const PERMISSION_OPTIONS = [
  { id: 'dashboard', label: 'İdarə paneli' },
  { id: 'inventory', label: 'Məhsul qalıqları' },
  { id: 'warehouses', label: 'Anbar İdarəetməsi' },
  { id: 'stores', label: 'Mağaza' },
  { id: 'products', label: 'Məhsul' },
  { id: 'customers', label: 'Kontragent' },
  { id: 'purchases', label: 'Alış' },
  { id: 'sales', label: 'Satış' },
  { id: 'pos', label: 'POS' },
  { id: 'hr', label: 'İnsan resursları' },
  { id: 'finance', label: 'Maliyyə' },
  { id: 'reports', label: 'Hesabatlar' },
]

const LABELS = Object.fromEntries(PERMISSION_OPTIONS.map((option) => [option.id, option.label]))

export function permissionLabel(id) {
  return LABELS[id] ?? id
}
