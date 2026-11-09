import { apiClient } from '@/services/api-client'

// GET /api/auth/me → { user: { id, name, email, role, companyId, isApproved } }. Works for unapproved users too.
export async function fetchMe() {
  const { user } = await apiClient.get('/auth/me')
  return user
}
