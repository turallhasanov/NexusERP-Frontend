import { useCompanyStore } from '@/store/company-store'

export function useCompany() {
  const { company } = useCompanyStore()

  return { company }
}

// The e-commerce storefront the active company is connected to. `enabled` is false when it has none, and then the
// "show on storefront" option and the storefront sync actions are not offered.
export function useStorefront() {
  const { company } = useCompanyStore()
  const name = company?.storefrontName?.trim() || ''

  return { enabled: Boolean(name), name }
}
