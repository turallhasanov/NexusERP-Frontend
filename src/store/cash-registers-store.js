import { createApiCollection } from '@/store/create-api-collection'

// GET /api/cash-registers → { id, code, name, balance, isActive }. A company without registers gets
// "Əsas kassa" (KSA-001) from the server on that first load.
const cashRegisters = createApiCollection({ path: '/cash-registers' })

export const loadCashRegisters = cashRegisters.load

export function getCashRegister(cashRegisterId) {
  return cashRegisters.find(cashRegisterId)
}

// Adds a row returned by POST /api/cash-registers (new codes sort last, as on the server).
export function addCashRegister(cashRegister) {
  return cashRegisters.add(cashRegister)
}

export function useCashRegistersStore() {
  const { items, isLoading, error, reload } = cashRegisters.useCollection()

  return { cashRegisters: items, isLoading, error, reload }
}
