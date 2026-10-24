import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthShell } from '@/components/layout/AuthShell'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { RequireCompany } from '@/components/layout/RequireCompany'
import { RequireSuperAdmin } from '@/components/layout/RequireSuperAdmin'
import { AdminShell } from '@/features/admin/components/AdminShell'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage'
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage'
import { SplashPage } from '@/features/splash/pages/SplashPage'
import { SelectCompanyPage } from '@/features/company/pages/SelectCompanyPage'
import { routes } from '@/lib/routes'

// Pages behind sign-in load on first visit, so the sign-in screens stay small; each shell shows a
// fallback (RouteFallback) while a page's code downloads. Pages are named exports, hence the mapping.
function lazyPage(load, name) {
  return lazy(() => load().then((module) => ({ default: module[name] })))
}

const AdminAnalyticsPage = lazyPage(() => import('@/features/admin/pages/AdminAnalyticsPage'), 'AdminAnalyticsPage')
const AdminSettingsPage = lazyPage(() => import('@/features/admin/pages/AdminSettingsPage'), 'AdminSettingsPage')
const AdminTenantsPage = lazyPage(() => import('@/features/admin/pages/AdminTenantsPage'), 'AdminTenantsPage')
const DashboardPage = lazyPage(() => import('@/features/dashboard/pages/DashboardPage'), 'DashboardPage')
const FinancePage = lazyPage(() => import('@/features/finance/pages/FinancePage'), 'FinancePage')
const HrPage = lazyPage(() => import('@/features/hr/pages/HrPage'), 'HrPage')
const InventoryPage = lazyPage(() => import('@/features/inventory/pages/InventoryPage'), 'InventoryPage')
const WarehousesPage = lazyPage(() => import('@/features/warehouses/pages/WarehousesPage'), 'WarehousesPage')
const StoresPage = lazyPage(() => import('@/features/stores/pages/StoresPage'), 'StoresPage')
const CustomersPage = lazyPage(() => import('@/features/customers/pages/CustomersPage'), 'CustomersPage')
const ProductsPage = lazyPage(() => import('@/features/products/pages/ProductsPage'), 'ProductsPage')
const PurchasesPage = lazyPage(() => import('@/features/purchases/pages/PurchasesPage'), 'PurchasesPage')
const SalesPage = lazyPage(() => import('@/features/sales/pages/SalesPage'), 'SalesPage')
const PosPage = lazyPage(() => import('@/features/pos/pages/PosPage'), 'PosPage')
const ReportsPage = lazyPage(() => import('@/features/reports/pages/ReportsPage'), 'ReportsPage')
const SettingsPage = lazyPage(() => import('@/features/settings/pages/SettingsPage'), 'SettingsPage')

export default function App() {
  return (
    <Routes>
      <Route path={routes.welcome} element={<SplashPage />} />

      <Route element={<AuthShell />}>
        <Route path={routes.login} element={<LoginPage />} />
        <Route path={routes.register} element={<RegisterPage />} />
        <Route path={routes.verifyEmail} element={<VerifyEmailPage />} />
        <Route path={routes.forgotPassword} element={<ForgotPasswordPage />} />
        <Route path={routes.resetPassword} element={<ResetPasswordPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AuthShell />}>
          <Route path={routes.selectCompany} element={<SelectCompanyPage />} />
        </Route>
        <Route element={<RequireSuperAdmin />}>
          <Route element={<AdminShell />}>
            <Route path={routes.admin} element={<Navigate to={routes.adminTenants} replace />} />
            <Route path={routes.adminTenants} element={<AdminTenantsPage />} />
            <Route path={routes.adminAnalytics} element={<AdminAnalyticsPage />} />
            <Route path={routes.adminSettings} element={<AdminSettingsPage />} />
          </Route>
        </Route>
        <Route element={<RequireCompany />}>
          <Route element={<AppShell />}>
            <Route path={routes.dashboard} element={<DashboardPage />} />
            <Route path={routes.inventory} element={<InventoryPage />} />
            <Route path={routes.warehouses} element={<WarehousesPage />} />
            <Route path={routes.stores} element={<StoresPage />} />
            <Route path={routes.products} element={<ProductsPage />} />
            <Route path={routes.customers} element={<CustomersPage />} />
            <Route path={routes.purchases} element={<PurchasesPage />} />
            <Route path={routes.sales} element={<SalesPage />} />
            <Route path={routes.pos} element={<PosPage />} />
            <Route path={routes.hr} element={<HrPage />} />
            <Route path={routes.finance} element={<FinancePage />} />
            <Route path={routes.reports} element={<ReportsPage />} />
            <Route path={routes.settings} element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Old company-setup URL, kept so existing bookmarks still land on the right page. */}
      <Route path="/setup" element={<Navigate to={routes.selectCompany} replace />} />
      <Route path="*" element={<Navigate to={routes.dashboard} replace />} />
    </Routes>
  )
}
