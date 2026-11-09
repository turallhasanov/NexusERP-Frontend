import { apiClient } from '@/services/api-client'

// GET /api/users → [{ id, name, email, role, customRoleName, isActive, createdAt }] (admins and IT admins).
export async function fetchUsers() {
  const { items } = await apiClient.get('/users')
  return items
}

// PATCH /api/users/{id}/status { isActive } → the updated user (IT admins only). A deactivated user cannot sign in and
// the token they hold is refused on its next request.
export async function setUserActive(id, isActive) {
  const { user } = await apiClient.patch(`/users/${encodeURIComponent(id)}/status`, { isActive })
  return user
}

// POST /api/users/{id}/approve { role } → the approved user. Approves a user who joined with an invite code and gives
// them a role ("admin", "itadmin" or "staff"); their data requests stop answering 403 at once.
export async function approveUser(id, role) {
  const { user } = await apiClient.post(`/users/${encodeURIComponent(id)}/approve`, { role })
  return user
}
