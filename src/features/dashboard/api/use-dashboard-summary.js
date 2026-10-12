import { payrollForPeriod } from '@/features/hr/api/payroll'
import { fetchDashboardSummary } from '@/features/reports/api/reports-api'
import { useApiQuery } from '@/hooks/use-api-query'
import { PERIOD_MONTH } from '@/lib/date'
import { presetRange, toApiRange } from '@/lib/report-range'
import { useCustomersStore } from '@/store/customers-store'
import { useHrStore } from '@/store/hr-store'
import { SALE_DRAFT, useOrdersStore } from '@/store/orders-store'
import { PURCHASE_DRAFT, usePurchasesStore } from '@/store/purchases-store'
import { useStoresStore } from '@/store/stores-store'

// Financial KPIs from GET /api/dashboard/summary for a range preset (today / week / month / all).
export function useDashboardSummary(rangeId) {
  return useApiQuery(fetchDashboardSummary, toApiRange(presetRange(rangeId)))
}

// Work-in-progress counts from the loaded lists, plus HR, which still runs in the browser.
export function useOperationsSummary() {
  const { orders } = useOrdersStore()
  const { purchases } = usePurchasesStore()
  const { customers } = useCustomersStore()
  const { stores } = useStoresStore()
  const { employees } = useHrStore()
  const roster = employees.filter((employee) => employee.status !== 'left')

  return {
    draftSales: orders.filter((order) => order.status === SALE_DRAFT).length,
    draftPurchases: purchases.filter((purchase) => purchase.status === PURCHASE_DRAFT).length,
    customerCount: customers.length,
    storeCount: stores.length,
    headcount: roster.length,
    onLeave: roster.filter((employee) => employee.status === 'leave').length,
    payroll: payrollForPeriod(employees, PERIOD_MONTH),
  }
}
