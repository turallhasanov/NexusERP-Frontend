import { apiClient } from '@/services/api-client'
import { loadCashRegisters } from '@/store/cash-registers-store'

// POST /api/cash-registers/transactions { transactionType: 'income' }: money into the register (mədaxil).
export async function depositCash({ cashRegisterId, amount, description }) {
  const transaction = await apiClient.post('/cash-registers/transactions', {
    cashRegisterId,
    transactionType: 'income',
    amount,
    description: description || null,
  })

  // The balance changed on the server; reload so every register dropdown shows it.
  await loadCashRegisters()
  return transaction
}
