import { createApiCollection } from '@/store/create-api-collection'

// GET /api/cash-registers → { id, code, name, balance, isActive }
const cashRegisters = createApiCollection({ path: '/cash-registers' })

export const loadCashRegisters = cashRegisters.load

export function getCashRegister(cashRegisterId) {
  return cashRegisters.find(cashRegisterId)
}

export function useCashRegistersStore() {
  const { items, isLoading, error, reload } = cashRegisters.useCollection()

  return { cashRegisters: items, isLoading, error, reload }
}
