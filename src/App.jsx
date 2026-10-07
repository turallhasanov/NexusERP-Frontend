import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AuthShell } from '@/components/layout/AuthShell'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { FinancePage } from '@/features/finance/pages/FinancePage'
import { HrPage } from '@/features/hr/pages/HrPage'
import { InventoryPage } from '@/features/inventory/pages/InventoryPage'
import { StoresPage } from '@/features/stores/pages/StoresPage'
import { CustomersPage } from '@/features/customers/pages/CustomersPage'
import { ProductsPage } from '@/features/products/pages/ProductsPage'
import { PurchasesPage } from '@/features/purchases/pages/PurchasesPage'
import { SalesPage } from '@/features/sales/pages/SalesPage'
import { routes } from '@/lib/routes'

export default function App() {
  return (
    <Routes>
      <Route element={<AuthShell />}>
        <Route path={routes.login} element={<LoginPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path={routes.dashboard} element={<DashboardPage />} />
          <Route path={routes.inventory} element={<InventoryPage />} />
          <Route path={routes.stores} element={<StoresPage />} />
          <Route path={routes.products} element={<ProductsPage />} />
          <Route path={routes.customers} element={<CustomersPage />} />
          <Route path={routes.purchases} element={<PurchasesPage />} />
          <Route path={routes.sales} element={<SalesPage />} />
          <Route path={routes.hr} element={<HrPage />} />
          <Route path={routes.finance} element={<FinancePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={routes.dashboard} replace />} />
    </Routes>
  )
}
