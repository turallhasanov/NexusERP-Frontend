import { NavLink } from 'react-router-dom'
import { BrandLockup } from '@/components/brand/BrandLockup'
import { navItems } from '@/components/layout/nav-items'
import { useCompany } from '@/features/company/api/use-company'
import { cn } from '@/lib/cn'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'

export function Sidebar() {
  const { company } = useCompany()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <BrandLockup companyName={company?.name} />
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === routes.dashboard}
            className={({ isActive }) =>
              cn(styles.navLink, isActive ? styles.navLinkActive : styles.navLinkIdle)
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
