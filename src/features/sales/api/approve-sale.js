import { apiClient } from '@/services/api-client'
import { loadProducts } from '@/store/inventory-store'
import { upsertOrder } from '@/store/orders-store'

// POST /api/sales/{id}/approve: the server decreases stock and approves in one transaction, or neither
// (shortage → 400 with the product, balance and required quantity in the message).
export async function approveSale(saleId) {
  try {
    const sale = await apiClient.post(`/sales/${saleId}/approve`)
    upsertOrder(sale)
    // Stock changed on the server; refresh the cached balances.
    void loadProducts()
    return { ok: true, sale }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
