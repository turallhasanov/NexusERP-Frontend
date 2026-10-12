import { apiClient } from '@/services/api-client'

// GET /api/purchases/{id} → the full document with its lines.
export async function fetchPurchase(purchaseId) {
  const { purchase } = await apiClient.get(`/purchases/${purchaseId}`)
  return purchase
}
