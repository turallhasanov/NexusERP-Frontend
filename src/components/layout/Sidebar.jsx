import { NavLink } from 'react-router-dom'
import { navItems } from '@/components/layout/nav-items'
import { cn } from '@/lib/cn'
import { APP_NAME } from '@/lib/constants'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>{APP_NAME}</div>
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
