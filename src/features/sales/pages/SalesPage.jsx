import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { InvoiceReceipt } from '@/features/sales/components/InvoiceReceipt'
import { OrderForm } from '@/features/sales/components/OrderForm'
import { OrderTable } from '@/features/sales/components/OrderTable'
import { useOrders } from '@/features/sales/api/use-orders'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'

export function SalesPage() {
  const { orders, openOrders } = useOrders()
  useDocumentTitle('Satış')

  return (
    <PageContainer title="Satış" description="Sifariş girişi və qaimə qaralaması.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Açıq sifariş</p>
          <p className={styles.summaryValue}>{openOrders}</p>
        </Card>
      </div>
      <div className={styles.salesLayout}>
        <OrderForm />
        <InvoiceReceipt />
      </div>
      <OrderTable orders={orders} />
    </PageContainer>
  )
}
