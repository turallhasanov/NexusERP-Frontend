import { routes } from '@/lib/routes'

export const navItems = [
  { label: 'İdarə paneli', href: routes.dashboard },
  { label: 'Anbar', href: routes.inventory },
  { label: 'Mağaza', href: routes.stores },
  { label: 'Məhsul', href: routes.products },
  { label: 'Kontragent', href: routes.customers },
  { label: 'Alış', href: routes.purchases },
  { label: 'Satış', href: routes.sales },
  { label: 'İnsan resursları', href: routes.hr },
  { label: 'Maliyyə', href: routes.finance },
]
