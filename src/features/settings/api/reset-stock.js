import { apiClient } from '@/services/api-client'
import { loadProducts } from '@/store/inventory-store'

// POST /api/nexuserp/reset-stock: company admins and IT admins only. Sets every stock balance (all warehouses) to 0
// and resolves with { balancesReset }. The product cache is reloaded so the lists show zero without a manual refresh.
export async function resetStock() {
  const result = await apiClient.post('/nexuserp/reset-stock').catch((error) => {
    throw error.status === 404
      ? new Error('Stok sıfırlama serverdə tapılmadı. NexusERP API-ni yenidən başladın.')
      : error
  })

  loadProducts()

  return result
}
