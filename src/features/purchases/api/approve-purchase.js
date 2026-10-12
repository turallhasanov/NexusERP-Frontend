import { apiClient } from '@/services/api-client'
import { loadProducts } from '@/store/inventory-store'
import { upsertPurchase } from '@/store/purchases-store'

// POST /api/purchases/{id}/approve: the server increases stock and approves in one transaction.
export async function approvePurchase(purchaseId) {
  try {
    const purchase = await apiClient.post(`/purchases/${purchaseId}/approve`)
    upsertPurchase(purchase)
    // Stock changed on the server; refresh the cached balances.
    void loadProducts()
    return { ok: true, purchase }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
