import { apiClient } from '@/services/api-client'
import { loadProducts } from '@/store/inventory-store'

// POST /api/inventory/receive: the server adds the quantity to the warehouse balance and, when the product is shown on
// the Khazar store, sends the new total there. A failed Khazar push does not undo the receipt.
export async function addStock({ productId, warehouseId, quantity }) {
  try {
    await apiClient.post('/inventory/receive', { productId, warehouseId, quantity })

    // The cached rows carry the balances; reload them so the table shows the new stock.
    await loadProducts()
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
