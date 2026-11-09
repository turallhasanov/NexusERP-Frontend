import { Suspense, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { RouteFallback } from '@/components/layout/RouteFallback'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toaster } from '@/components/ui/toaster'
import { ImpersonationBanner } from '@/features/admin/components/ImpersonationBanner'
import { SupportWidget } from '@/features/support/components/SupportWidget'
import { usePreloadCatalogs } from '@/hooks/use-preload-catalogs'
import { fetchMe } from '@/features/auth/api/fetch-me'
import { fetchCompany } from '@/features/company/api/fetch-company'
import { isStaff } from '@/lib/access'
import { styles } from '@/lib/styles'
import { updateUser, useAuthStore } from '@/store/auth-store'
import { setCompany } from '@/store/company-store'

export function AppShell() {
  usePreloadCatalogs()
  // A platform admin viewing a company read-only answers from the support desk, not from the company's widget.
  const { impersonation, user } = useAuthStore()
  const staff = isStaff(user)

  // A staff member's menu follows their role's modules. The token is older than any later edit of the role, so the
  // current profile (with `permissions`) is fetched when the app opens.
  useEffect(() => {
    if (staff && !impersonation) {
      fetchMe().then(updateUser).catch(() => {})
    }
  }, [staff, impersonation])

  // The cached company can predate a change of its storefront connection, so it is refreshed when the app opens.
  // A platform admin's company view already carries the company from the impersonation response.
  useEffect(() => {
    if (impersonation || !user?.companyId) return
    fetchCompany()
      .then((company) => {
        if (company?.id === user.companyId) setCompany(company)
      })
      .catch(() => {})
  }, [impersonation, user?.companyId])

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
