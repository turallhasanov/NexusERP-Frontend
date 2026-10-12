import { cashChange, PAYMENT_CARD, PAYMENT_CASH } from '@/lib/payment'
import { apiClient } from '@/services/api-client'
import { loadCashRegisters } from '@/store/cash-registers-store'
import { loadProducts } from '@/store/inventory-store'
import { upsertOrder } from '@/store/orders-store'

// POST /api/sales/pos-checkout: one approved sale with all cart lines. The server decreases stock and pays
// the total into the cash register in one transaction; on a shortage nothing is saved.
// Payment method, tendered cash and change are till-side only (receipt), not stored on the server.
export async function checkoutPos({ storeId, cashRegisterId, lines, payment, tendered }) {
  if (!storeId) {
    return { ok: false, error: 'Mağaza tələb olunur.' }
  }

  if (!cashRegisterId) {
    return { ok: false, error: 'Kassa seçilməlidir.' }
  }

  if (!lines.length) {
    return { ok: false, error: 'Səbət boşdur.' }
  }

  if (payment !== PAYMENT_CASH && payment !== PAYMENT_CARD) {
    return { ok: false, error: 'Ödəniş növü tələb olunur.' }
  }

  const total = lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
  const change = payment === PAYMENT_CASH ? cashChange(total, tendered) : null

  if (payment === PAYMENT_CASH && change == null) {
    return { ok: false, error: 'Verilən məbləğ cəmidən az ola bilməz.' }
  }

  try {
    const sale = await apiClient.post('/sales/pos-checkout', {
      storeId,
      cashRegisterId,
      items: lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
    })

    upsertOrder(sale)
    void loadProducts()
    void loadCashRegisters()

    return { ok: true, sale, change }
  } catch (error) {
    // A shortage means another till sold the stock first; refresh so the grid shows what is left.
    void loadProducts()
    return { ok: false, error: error.message }
  }
}
