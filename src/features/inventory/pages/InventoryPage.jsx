import { useEffect, useState } from 'react'
import { DekontPreview, DekontPrintRoot } from '@/components/dekont/DekontPreview'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { buildInventoryDekont, inventoryStockValue, openInventoryDekontPdf } from '@/features/inventory/api/inventory-dekont'
import { useProducts } from '@/features/inventory/api/use-products'
import { useWarehouses } from '@/features/inventory/api/use-warehouses'
import { ProductTable } from '@/features/inventory/components/ProductTable'
import { ReceiveStockForm } from '@/features/inventory/components/ReceiveStockForm'
import { WarehouseForm } from '@/features/inventory/components/WarehouseForm'
import { WarehouseTable } from '@/features/inventory/components/WarehouseTable'
import { FinanceReportActions } from '@/features/finance/components/FinanceReportActions'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

export function InventoryPage() {
  const { products, criticalStock } = useProducts()
  const { warehouses } = useWarehouses()
  const [preview, setPreview] = useState(false)
  const [shouldPrint, setShouldPrint] = useState(false)
  const stockValue = inventoryStockValue(products)
  const dekont = buildInventoryDekont(products, warehouses)
  useDocumentTitle('Anbar')

  useEffect(() => {
    if (!shouldPrint) {
      return
    }

    window.print()
    setShouldPrint(false)
  }, [shouldPrint])

  function viewPdf() {
    void openInventoryDekontPdf(products, warehouses)
    setPreview(true)
  }

  return (
    <PageContainer title="Anbar" description="Depolar, məhsul girişi və cari qalıq.">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className={styles.sectionTitle}>Anbar hesabatı</h2>
          <FinanceReportActions
            onView={() => setPreview(true)}
            onPrint={() => {
              setPreview(true)
              setShouldPrint(true)
            }}
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
      <h2 className={styles.sectionTitle}>Depolar</h2>
      <WarehouseForm />
      <WarehouseTable warehouses={warehouses} />
      <ReceiveStockForm />
      <ProductTable products={products} warehouses={warehouses} />
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
