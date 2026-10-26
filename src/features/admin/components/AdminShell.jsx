import { Suspense } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { NexusMark } from '@/components/brand/NexusMark'
import { GlassBackdrop } from '@/components/layout/GlassBackdrop'
import { RouteFallback } from '@/components/layout/RouteFallback'
import { Toaster } from '@/components/ui/toaster'
import { signOut } from '@/features/auth/api/sign-out'
import { cn } from '@/lib/cn'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'
import { USER_ROLE_LABELS } from '@/types/auth'

const NAV_ITEMS = [
  { label: 'Şirkətlər', href: routes.adminTenants },
  { label: 'Analitika', href: routes.adminAnalytics },
  { label: 'Dəstək çatı', href: routes.adminSupport },
  { label: 'Parametrlər', href: routes.adminSettings },
]

// Layout of the platform admin portal, in the splash screen's visual language (deep slate, emerald glow,
// pixel grid), so it reads as one product with the intro yet is never mistaken for a company's own app.
export function AdminShell() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  function handleLogout() {
    signOut()
    navigate(routes.login, { replace: true })
  }

  const links = NAV_ITEMS.map((item) => (
    <NavLink
      key={item.href}
      to={item.href}
      className={({ isActive }) => cn(styles.adminNavLink, isActive ? styles.adminNavLinkActive : styles.adminNavLinkIdle)}
    >
      {item.label}
    </NavLink>
  ))

  return (
    <div className={styles.adminShell} data-surface="glass">
      <GlassBackdrop />
      <aside className={styles.adminSidebar}>
        <div className={styles.adminBrand}>
          <NexusMark className={styles.brandMark} />
          <div>
            <p className={styles.adminBrandName}>
              Nexus<span className="text-emerald-300">ERP</span>
            </p>
            <p className={styles.adminBrandTag}>Platforma</p>
          </div>
        </div>
        <nav className={styles.adminNav}>{links}</nav>
      </aside>
      <div className={styles.adminColumn}>
        <header className={styles.adminHeader}>
          <p className={styles.adminHeaderMeta}>Platforma idarəetməsi</p>
          {user ? (
            <div className={styles.adminHeaderUser}>
              <span className="hidden sm:inline">{user.name}</span>
              <span className={cn(styles.adminBadge, styles.adminBadgePlatform)}>{USER_ROLE_LABELS[user.role]}</span>
              <button type="button" className={styles.adminHeaderAction} onClick={handleLogout}>
                Çıxış
              </button>
            </div>
          ) : null}
        </header>
        <nav className={styles.adminNavTop}>{links}</nav>
        <main className={styles.adminMain}>
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
