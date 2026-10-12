import { toItemsPayload } from '@/lib/document-lines'
import { apiClient } from '@/services/api-client'
import { upsertOrder } from '@/store/orders-store'

// POST /api/sales → a draft sale; stock is not touched until it is approved.
// An empty customer means a walk-in sale; an empty warehouse means the store's own warehouse.
export async function placeOrder({ storeId, customerId, warehouseId, lines }) {
  try {
    const sale = await apiClient.post('/sales', {
      storeId,
      customerId: customerId || null,
      warehouseId: warehouseId || null,
      items: toItemsPayload(lines),
    })

    return { ok: true, sale, order: upsertOrder(sale) }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
