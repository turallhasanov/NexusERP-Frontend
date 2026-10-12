import { useWarehousesStore } from '@/store/warehouses-store'

export function useWarehouses() {
  const { warehouses, isLoading, error, reload } = useWarehousesStore()

  return { warehouses, isLoading, error, reload }
}
