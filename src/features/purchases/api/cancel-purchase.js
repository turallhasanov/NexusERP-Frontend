import { apiClient } from '@/services/api-client'
import { loadProducts } from '@/store/inventory-store'
import { upsertPurchase } from '@/store/purchases-store'

// Status the server answers with when part of the purchased stock is no longer in the warehouse.
const STOCK_SHORTAGE_STATUS = 422

// DELETE /api/purchases/{id}: company admins and IT admins only. The server takes the purchased quantities back out of
// the warehouse stock and answers with the purchase, now "cancelled". It refuses (422, with the product and the
// balance) when part of that stock has already been sold or cleared, and (409) when a cash payment is linked to the
// purchase. With `force` it cancels anyway: each balance drops by what is there and ends at zero, never below.
export async function cancelPurchase(purchaseId, { force = false } = {}) {
  try {
    const purchase = await apiClient.delete(`/purchases/${encodeURIComponent(purchaseId)}`, {
      params: force ? { force: true } : undefined,
    })
    upsertPurchase(purchase)
    // Stock changed on the server; refresh the cached balances.
    void loadProducts()
    return { ok: true, purchase }
  } catch (error) {
    return { ok: false, error: error.message, stockShortage: error.status === STOCK_SHORTAGE_STATUS }
  }
}
