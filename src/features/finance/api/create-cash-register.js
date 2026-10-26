import { apiClient } from '@/services/api-client'
import { addCashRegister } from '@/store/cash-registers-store'

// POST /api/cash-registers. A positive opening balance is recorded as an income "Başlanğıc qalıq".
export async function createCashRegister({ name, openingBalance }) {
  const cashRegister = await apiClient.post('/cash-registers', {
    name,
    openingBalance: openingBalance === '' || openingBalance === undefined ? null : Number(openingBalance),
  })
  return addCashRegister(cashRegister)
}
