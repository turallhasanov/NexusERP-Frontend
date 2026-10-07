import { useCustomersStore } from '@/store/customers-store'

export function useCustomers() {
  const { customers } = useCustomersStore()

  return {
    customers,
    isLoading: false,
  }
}
