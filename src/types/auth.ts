export type UserRole = 'admin' | 'manager' | 'staff'

export type User = {
  id: string
  name: string
  role: UserRole
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  admin: 'İdarəçi',
  manager: 'Müdir',
  staff: 'İşçi',
}
