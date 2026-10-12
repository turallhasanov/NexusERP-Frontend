import { apiClient } from '@/services/api-client'

// GET /api/sales/{id} → the full document with its lines.
export async function fetchSale(saleId) {
  const { sale } = await apiClient.get(`/sales/${saleId}`)
  return sale
}
