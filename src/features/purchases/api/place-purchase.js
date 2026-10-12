import { toItemsPayload } from '@/lib/document-lines'
import { apiClient } from '@/services/api-client'
import { upsertPurchase } from '@/store/purchases-store'

// POST /api/purchases → a draft purchase; stock is not touched until it is approved.
export async function placePurchase({ customerId, warehouseId, lines }) {
  try {
    const purchase = await apiClient.post('/purchases', {
      customerId,
      warehouseId,
      items: toItemsPayload(lines),
    })

    return { ok: true, purchase: upsertPurchase(purchase) }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
