import { apiClient } from '@/services/api-client'

// GET /api/company → the signed-in user's company, or null if they have not created one yet.
export async function fetchCompany() {
  const { company } = await apiClient.get('/company')
  return company
}
