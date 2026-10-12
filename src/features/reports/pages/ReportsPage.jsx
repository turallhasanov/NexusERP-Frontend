import { PageContainer } from '@/components/layout/PageContainer'
import { InventoryValueReport } from '@/features/reports/components/InventoryValueReport'
import { ProfitLossReport } from '@/features/reports/components/ProfitLossReport'
import { TopProductsReport } from '@/features/reports/components/TopProductsReport'
import { useDocumentTitle } from '@/hooks/use-document-title'

export function ReportsPage() {
  useDocumentTitle('Hesabatlar')

  return (
    <PageContainer title="Hesabatlar" description="Mənfəət və zərər, anbar dəyəri və ən çox satılan məhsullar.">
      <ProfitLossReport />
      <InventoryValueReport />
      <TopProductsReport />
    </PageContainer>
  )
}
