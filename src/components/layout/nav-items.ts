import { routes } from '@/lib/routes.ts'

export type NavItem = {
  label: string
  href: string
}

export const navItems: NavItem[] = [
  { label: 'İdarə paneli', href: routes.dashboard },
  { label: 'Anbar', href: routes.inventory },
  { label: 'Satış', href: routes.sales },
  { label: 'İnsan resursları', href: routes.hr },
  { label: 'Maliyyə', href: routes.finance },
]
