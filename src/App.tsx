import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell.tsx'
import { AuthShell } from '@/components/layout/AuthShell.tsx'
import { RequireAuth } from '@/components/layout/RequireAuth.tsx'
import { LoginPage } from '@/features/auth/pages/LoginPage.tsx'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage.tsx'
import { FinancePage } from '@/features/finance/pages/FinancePage.tsx'
import { HrPage } from '@/features/hr/pages/HrPage.tsx'
import { InventoryPage } from '@/features/inventory/pages/InventoryPage.tsx'
import { SalesPage } from '@/features/sales/pages/SalesPage.tsx'
import { routes } from '@/lib/routes.ts'

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
          <Route path={routes.sales} element={<SalesPage />} />
          <Route path={routes.hr} element={<HrPage />} />
          <Route path={routes.finance} element={<FinancePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={routes.dashboard} replace />} />
    </Routes>
  )
}
