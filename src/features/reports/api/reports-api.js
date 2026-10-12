import { apiClient } from '@/services/api-client'

// GET /api/dashboard/summary?from=&to= → { totalSales, cogs, grossProfit, totalExpenses, netProfit,
// totalPurchases, totalProducts, lowStockProductsCount, lowStockThreshold, from, to }
export async function fetchDashboardSummary(params) {
  const { summary } = await apiClient.get('/dashboard/summary', { params })
  return summary
}

// GET /api/reports/profit-loss?from=&to= → { grossRevenue, cogs, grossProfit, totalExpenses, netProfit, from, to }
export async function fetchProfitLoss(params) {
  return apiClient.get('/reports/profit-loss', { params })
}

// GET /api/reports/inventory-value → [{ warehouseId, warehouseName, totalStockQuantity, totalStockValue }]
export async function fetchInventoryValue() {
  const { items } = await apiClient.get('/reports/inventory-value')
  return items
}

// GET /api/reports/top-products?limit=&sortBy=quantity|revenue → [{ productId, productName, quantitySold, revenue }]
export async function fetchTopProducts(params) {
  const { items } = await apiClient.get('/reports/top-products', { params })
  return items
}
