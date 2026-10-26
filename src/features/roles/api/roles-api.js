import { apiClient } from '@/services/api-client'

// The company's custom job roles (admins and IT admins only; the API returns 403 to staff).
// A role: { id, name, description, permissions: ['inventory', ...], userCount, createdAt }.

export async function fetchRoles() {
  const { items } = await apiClient.get('/roles')
  return items
}

export async function createRole({ name, description, permissions }) {
  const { role } = await apiClient.post('/roles', { name, description, permissions })
  return role
}

export async function updateRole(id, { name, description, permissions }) {
  const { role } = await apiClient.put(`/roles/${encodeURIComponent(id)}`, { name, description, permissions })
  return role
}

// Refused with 409 while any user has the role.
export async function deleteRole(id) {
  await apiClient.delete(`/roles/${encodeURIComponent(id)}`)
}

// POST /api/users/{userId}/assign-role { roleId } → the updated company user; roleId null takes the role away.
// The user's access level (admin, itadmin, staff) stays as it is.
export async function assignRole(userId, roleId) {
  const { user } = await apiClient.post(`/users/${encodeURIComponent(userId)}/assign-role`, { roleId })
  return user
}
