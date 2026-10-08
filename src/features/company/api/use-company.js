import { useCompanyStore } from '@/store/company-store'

export function useCompany() {
  const { company } = useCompanyStore()

  return { company }
}
