export const ROLE_SUPER_ADMIN = 'superadmin'

export const USER_ROLE_LABELS = {
  admin: 'İdarəçi',
  manager: 'Müdir',
  staff: 'İşçi',
  [ROLE_SUPER_ADMIN]: 'Platforma admini',
}

export function isSuperAdmin(user) {
  return user?.role === ROLE_SUPER_ADMIN
}
