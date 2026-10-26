import { apiClient } from '@/services/api-client'

// Platform administration (/api/admin, role "superadmin"). Ids go into the URL encoded.
const tenantPath = (id) => `/admin/tenants/${encodeURIComponent(id)}`

// GET /api/admin/tenants → [{ id, name, voen, createdAt, status, userCount }], newest first.
export async function fetchTenants() {
  const { items } = await apiClient.get('/admin/tenants')
  return items
}

// GET /api/admin/tenants/{id} → { id, name, voen, createdAt, status, inviteCode, counts, users, activity }
export async function fetchTenant({ id }) {
  const { tenant } = await apiClient.get(tenantPath(id))
  return tenant
}

// GET /api/admin/tenants/{id}/dashboard-summary?from=&to= → same summary as GET /api/dashboard/summary.
export async function fetchTenantSummary({ id, ...params }) {
  const { summary } = await apiClient.get(`${tenantPath(id)}/dashboard-summary`, { params })
  return summary
}

// POST /api/admin/tenants { name, voen, adminName, adminEmail, adminPassword, adminRole: 'itadmin' (default) | 'admin' } → { tenant, admin }
export async function createTenant(body) {
  return apiClient.post('/admin/tenants', body)
}

// POST /api/admin/tenants/{id}/users { fullName, email, password, role: 'itadmin' | 'staff' } → the new user.
export async function createTenantUser(id, body) {
  const { user } = await apiClient.post(`${tenantPath(id)}/users`, body)
  return user
}

// PUT /api/admin/tenants/{id}/status { status: 'active' | 'passive' | 'suspended' } → the updated tenant row.
export async function updateTenantStatus(id, status) {
  const { tenant } = await apiClient.put(`${tenantPath(id)}/status`, { status })
  return tenant
}

// DELETE /api/admin/tenants/{id}: soft delete; the company leaves the list and its users can no longer sign in.
export async function deleteTenant(id) {
  await apiClient.delete(tenantPath(id))
}

// POST /api/admin/tenants/{id}/impersonate → { token, expiresAt, company: { id, name, voen } } (read-only token).
export async function impersonateTenant(id) {
  return apiClient.post(`${tenantPath(id)}/impersonate`)
}

// GET /api/admin/analytics → tenant counts by status, users, revenue, top tenants and database health.
export async function fetchPlatformAnalytics() {
  const { analytics } = await apiClient.get('/admin/analytics')
  return analytics
}
