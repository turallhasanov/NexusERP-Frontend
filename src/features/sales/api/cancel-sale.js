import { apiClient } from '@/services/api-client'
import { loadProducts } from '@/store/inventory-store'
import { upsertOrder } from '@/store/orders-store'

// DELETE /api/sales/{id}: company admins and IT admins only. The server returns the items to stock, cancels an online
// (Khazar) order in Khazar first, and takes a POS payment back out of its cash register; it answers with the sale,
// now "cancelled". If Khazar cannot cancel its order the sale is left as it was (503 with the reason).
export async function cancelSale(saleId) {
  try {
    const sale = await apiClient.delete(`/sales/${encodeURIComponent(saleId)}`)
    upsertOrder(sale)
    // Stock changed on the server; refresh the cached balances.
    void loadProducts()
    return { ok: true, sale }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
