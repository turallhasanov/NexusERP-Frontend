import { useWarehousesStore } from '@/store/warehouses-store'

export function useWarehouses() {
  const { warehouses } = useWarehousesStore()

  return {
    warehouses,
    isLoading: false,
  }
}
