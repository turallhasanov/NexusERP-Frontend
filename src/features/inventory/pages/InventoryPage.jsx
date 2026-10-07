import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { ProductTable } from '@/features/inventory/components/ProductTable'
import { ReceiveStockForm } from '@/features/inventory/components/ReceiveStockForm'
import { WarehouseForm } from '@/features/inventory/components/WarehouseForm'
import { WarehouseTable } from '@/features/inventory/components/WarehouseTable'
import { useProducts } from '@/features/inventory/api/use-products'
import { useWarehouses } from '@/features/inventory/api/use-warehouses'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'

export function InventoryPage() {
  const { products, criticalStock } = useProducts()
  const { warehouses } = useWarehouses()
  useDocumentTitle('Anbar')

  return (
    <PageContainer title="Anbar" description="Depolar, məhsul girişi və cari qalıq.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Kritik ehtiyat</p>
          <p className={styles.summaryValue}>{criticalStock}</p>
        </Card>
        <Card>
          <p className={styles.summaryLabel}>Depo sayı</p>
          <p className={styles.summaryValue}>{warehouses.length}</p>
        </Card>
      </div>
      <h2 className={styles.sectionTitle}>Depolar</h2>
      <WarehouseForm />
      <WarehouseTable warehouses={warehouses} />
      <ReceiveStockForm />
      <ProductTable products={products} />
    </PageContainer>
  )
}
