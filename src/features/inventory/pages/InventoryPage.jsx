import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { ProductTable } from '@/features/inventory/components/ProductTable'
import { ReceiveStockForm } from '@/features/inventory/components/ReceiveStockForm'
import { useProducts } from '@/features/inventory/api/use-products'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'

export function InventoryPage() {
  const { products, criticalStock } = useProducts()
  useDocumentTitle('Anbar')

  return (
    <PageContainer title="Anbar" description="Anbara məhsul girişi və cari qalıq.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Kritik ehtiyat</p>
          <p className={styles.summaryValue}>{criticalStock}</p>
        </Card>
      </div>
      <ReceiveStockForm />
      <ProductTable products={products} />
    </PageContainer>
  )
}
