import { apiClient } from '@/services/api-client'
import { PERIOD_DAY, PERIOD_YEAR } from '@/lib/date'

// The page's period filter → the API's period names.
function toApiPeriod(period) {
  if (period === PERIOD_DAY) {
    return 'daily'
  }

  return period === PERIOD_YEAR ? 'yearly' : 'monthly'
}

// GET /api/finance/summary?storeId=&period= → { period, from, to, storeId, totals, stores: [{ storeId, name, totals }] }.
// Takes `{ storeId, period }` for useApiQuery; an empty storeId means all stores.
export function fetchFinanceSummary({ storeId, period }) {
  return apiClient.get('/finance/summary', {
    params: { period: toApiPeriod(period), ...(storeId ? { storeId } : {}) },
  })
}

// GET /api/finance/mizan?period= → { period, storeId, rows: [{ key, from, to, totals }] }, newest first. The current
// row is the same as the company summary. Takes `{ period }` for useApiQuery.
export function fetchFinanceMizan({ period }) {
  return apiClient.get('/finance/mizan', { params: { period: toApiPeriod(period) } })
}

// The store panel's query: with no store selected it is the company summary, which the page already loads.
export function fetchStoreFinanceSummary({ storeId, period }) {
  return storeId ? fetchFinanceSummary({ storeId, period }) : Promise.resolve(null)
}

// "+37.1%" / "−16.7%", or '—' without revenue.
export function formatMargin(margin) {
  if (margin === null || margin === undefined) {
    return '—'
  }

  return `${margin > 0 ? '+' : margin < 0 ? '−' : ''}${Math.abs(margin).toFixed(1)}%`
}
