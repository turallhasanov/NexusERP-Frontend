import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { useWarehouses } from '@/features/inventory/api/use-warehouses'
import { WarehouseForm } from '@/features/inventory/components/WarehouseForm'
import { WarehouseTable } from '@/features/inventory/components/WarehouseTable'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'

export function WarehousesPage() {
  const { warehouses, isLoading, error, reload } = useWarehouses()
  useDocumentTitle('Depo')

  return (
    <PageContainer title="Depo" description="Malın saxlandığı anbarlar. Hər mağaza bir depodan təchiz olunur.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Depo sayı</p>
          <p className={styles.summaryValue}>{isLoading ? '…' : warehouses.length}</p>
        </Card>
      </div>
      <WarehouseForm />
      <WarehouseTable warehouses={warehouses} isLoading={isLoading} error={error} onRetry={reload} />
    </PageContainer>
  )
}
