import { apiClient } from '@/services/api-client'
import { loadProductTypes } from '@/store/product-types-store'
import { loadProducts } from '@/store/inventory-store'

// POST /api/nexuserp/sync-all-data: company admins and IT admins only. NexusERP reads the Khazar catalog and upserts
// every active variant as a product (barcode = SKU) with Khazar's price and stock. Resolves with the run's counts
// ({ fetched, created, updated, unchanged, stockAdjusted, skipped, errors }); the product and category caches are
// reloaded so the Products page shows the result without a manual refresh.
export async function syncAllData() {
  const result = await apiClient.post('/nexuserp/sync-all-data').catch((error) => {
    // A 404 here means the route is missing, i.e. the NexusERP API is an older build than this page.
    throw error.status === 404
      ? new Error('Data inteqrasiyası serverdə tapılmadı. NexusERP API-ni yenidən başladın.')
      : error
  })

  loadProducts()
  loadProductTypes()

  return result
}
