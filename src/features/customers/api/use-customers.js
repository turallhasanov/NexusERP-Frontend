import { useCustomersStore } from '@/store/customers-store'

export function useCustomers() {
  const { customers, isLoading, error, reload } = useCustomersStore()

  return { customers, isLoading, error, reload }
}
