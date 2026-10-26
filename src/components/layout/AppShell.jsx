import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { RouteFallback } from '@/components/layout/RouteFallback'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toaster } from '@/components/ui/toaster'
import { ImpersonationBanner } from '@/features/admin/components/ImpersonationBanner'
import { SupportWidget } from '@/features/support/components/SupportWidget'
import { usePreloadCatalogs } from '@/hooks/use-preload-catalogs'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'

export function AppShell() {
  usePreloadCatalogs()
  // A platform admin viewing a company read-only answers from the support desk, not from the company's widget.
  const { impersonation } = useAuthStore()

  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.contentColumn}>
        <ImpersonationBanner />
        <Header />
        <main className={styles.main}>
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      {impersonation ? null : <SupportWidget />}
      <Toaster />
    </div>
  )
}
