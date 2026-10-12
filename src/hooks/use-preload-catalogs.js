import { useCustomersStore } from '@/store/customers-store'
import { useProductTypesStore } from '@/store/product-types-store'
import { useProductUnitsStore } from '@/store/product-units-store'
import { useStoresStore } from '@/store/stores-store'
import { useWarehousesStore } from '@/store/warehouses-store'

// Loads the small reference lists once per session and re-renders the shell when they arrive.
// Pages resolve names through plain lookups (getProductUnit, getCustomer, ...) that do not subscribe
// themselves, so without this a page that never mounts, say, the units list would show bare quantities.
export function usePreloadCatalogs() {
  useWarehousesStore()
  useStoresStore()
  useCustomersStore()
  useProductTypesStore()
  useProductUnitsStore()
}
