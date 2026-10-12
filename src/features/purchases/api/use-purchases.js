import { PURCHASE_APPROVED, PURCHASE_DRAFT, usePurchasesStore } from '@/store/purchases-store'

export function usePurchases() {
  const { purchases, isLoading, error, reload } = usePurchasesStore()

  return {
    purchases,
    draftPurchases: purchases.filter((purchase) => purchase.status === PURCHASE_DRAFT).length,
    approvedPurchases: purchases.filter((purchase) => purchase.status === PURCHASE_APPROVED).length,
    isLoading,
    error,
    reload,
  }
}
