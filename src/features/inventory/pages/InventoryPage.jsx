import { useState } from 'react'
import { DekontPreview, DekontPrintRoot } from '@/components/dekont/DekontPreview'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { buildInventoryDekont, inventoryStockValue, openInventoryDekontPdf } from '@/features/inventory/api/inventory-dekont'
import { useProducts } from '@/features/inventory/api/use-products'
import { useWarehouses } from '@/features/inventory/api/use-warehouses'
import { ProductTable } from '@/features/inventory/components/ProductTable'
import { ReceiveStockForm } from '@/features/inventory/components/ReceiveStockForm'
import { FinanceReportActions } from '@/features/finance/components/FinanceReportActions'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatAzn } from '@/lib/money'
import { printAfterRender } from '@/lib/print'
import { styles } from '@/lib/styles'

export function InventoryPage() {
  const { products, criticalStock, isLoading, error, reload } = useProducts()
  const { warehouses } = useWarehouses()
  const [preview, setPreview] = useState(false)
  const stockValue = inventoryStockValue(products)
  const dekont = buildInventoryDekont(products, warehouses)
  useDocumentTitle('Anbar')

  function viewPdf() {
    void openInventoryDekontPdf(products, warehouses)
    setPreview(true)
  }

  return (
    <PageContainer title="Anbar" description="Məhsul girişi və depolar üzrə cari qalıq.">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className={styles.sectionTitle}>Anbar hesabatı</h2>
          <FinanceReportActions
            onView={() => setPreview(true)}
            onPrint={() => printAfterRender(() => setPreview(true))}
            onPdf={viewPdf}
          />
        </div>
        <div className={styles.summaryGrid}>
          <Card>
            <p className={styles.summaryLabel}>Kritik ehtiyat</p>
            <p className={styles.summaryValue}>{criticalStock}</p>
          </Card>
          <Card>
            <p className={styles.summaryLabel}>Depo sayı</p>
            <p className={styles.summaryValue}>{warehouses.length}</p>
          </Card>
          <Card>
            <p className={styles.summaryLabel}>Cəm dəyər</p>
            <p className={styles.summaryValue}>{formatAzn(stockValue)}</p>
          </Card>
        </div>
      </section>
      <ReceiveStockForm />
      <ProductTable
        products={products}
        warehouses={warehouses}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
      />
      {preview ? (
        <DekontPreview
          title={dekont.title}
          dekont={dekont}
          onClose={() => setPreview(false)}
          onPrint={() => window.print()}
          onPdf={viewPdf}
        />
      ) : null}
      <DekontPrintRoot dekont={dekont} />
    </PageContainer>
  )
}
