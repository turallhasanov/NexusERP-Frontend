import { NavLink } from 'react-router-dom'
import { navItems } from '@/components/layout/nav-items.ts'
import { cn } from '@/lib/cn.ts'
import { APP_NAME } from '@/lib/constants.ts'
import { routes } from '@/lib/routes.ts'
import { styles } from '@/lib/styles.ts'

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
