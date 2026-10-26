import { apiClient } from '@/services/api-client'

// GET /api/companies/users → [{ id, name, email, role, isActive, createdAt }] (admins and IT admins only).
export async function fetchCompanyUsers() {
  const { items } = await apiClient.get('/companies/users')
  return items
}

// PUT /api/companies/users/{id}/role { role: 'admin' | 'itadmin' | 'staff' } → the updated user.
// The user gets the new role in their token on their next sign-in.
export async function updateCompanyUserRole(id, role) {
  const { user } = await apiClient.put(`/companies/users/${encodeURIComponent(id)}/role`, { role })
  return user
}
