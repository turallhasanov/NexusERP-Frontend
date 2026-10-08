import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { DekontPreview, DekontPrintRoot } from '@/components/dekont/DekontPreview'
import { buildSalesDekont, openSalesDekontPdf } from '@/features/sales/api/sales-dekont'
import { InvoiceReceipt } from '@/features/sales/components/InvoiceReceipt'
import { OrderForm } from '@/features/sales/components/OrderForm'
import { OrderTable } from '@/features/sales/components/OrderTable'
import { useOrders } from '@/features/sales/api/use-orders'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'

export function SalesPage() {
  const { orders, openOrders, closedOrders } = useOrders()
  const [selectedId, setSelectedId] = useState('')
  const [preview, setPreview] = useState(false)
  const selectedOrder = orders.find((order) => order.id === selectedId) ?? orders[0]
  const dekont = selectedOrder ? buildSalesDekont(selectedOrder) : null
  useDocumentTitle('Satış')

  function viewOrder(orderId) {
    setSelectedId(orderId)
    setPreview(true)
  }

  function viewPdf() {
    if (!selectedOrder) {
      return
    }

    openSalesDekontPdf(selectedOrder)
    setPreview(true)
  }

  return (
    <PageContainer
      title="Satış"
      description="Sifariş girişi və qaimə qaralaması."
      action={
        <Link to={routes.pos} className={styles.buttonPrimary}>
          POS kassa
        </Link>
      }
    >
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Açıq sifariş</p>
          <p className={styles.summaryValue}>{openOrders}</p>
        </Card>
        <Card>
          <p className={styles.summaryLabel}>Bağlı sifariş</p>
          <p className={styles.summaryValue}>{closedOrders}</p>
        </Card>
      </div>
      <div className={styles.salesLayout}>
        <OrderForm />
        <InvoiceReceipt
          order={selectedOrder}
          onView={() => selectedOrder && viewOrder(selectedOrder.id)}
          onPrint={() => window.print()}
          onPdf={viewPdf}
        />
      </div>
      <OrderTable orders={orders} onView={viewOrder} />
      {preview ? (
        <DekontPreview title="Satış dekontu" dekont={dekont} onClose={() => setPreview(false)} />
      ) : null}
      <DekontPrintRoot dekont={dekont} />
    </PageContainer>
  )
}
