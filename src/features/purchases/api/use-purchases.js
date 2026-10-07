import { usePurchasesStore } from '@/store/purchases-store'

export function usePurchases() {
  const { purchases } = usePurchasesStore()

  return {
    purchases,
  }
}
