import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { RouteFallback } from '@/components/layout/RouteFallback'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toaster } from '@/components/ui/toaster'
import { ImpersonationBanner } from '@/features/admin/components/ImpersonationBanner'
import { usePreloadCatalogs } from '@/hooks/use-preload-catalogs'
import { styles } from '@/lib/styles'

export function AppShell() {
  usePreloadCatalogs()

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
      <Toaster />
    </div>
  )
}
