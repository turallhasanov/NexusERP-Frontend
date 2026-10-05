import { useMemo } from 'react'

const MOCK_PRODUCTS = [
  { id: '1', name: 'A4 surətkağızı', sku: 'STK-001', quantity: 120, minQuantity: 40 },
  { id: '2', name: 'Mürəkkəb kartrici', sku: 'STK-014', quantity: 8, minQuantity: 10 },
  { id: '3', name: 'Bağlama lenti', sku: 'STK-032', quantity: 54, minQuantity: 20 },
]

export function useProducts() {
  const products = useMemo(() => MOCK_PRODUCTS, [])

  return {
    products,
    isLoading: false,
  }
}
