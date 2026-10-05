import { PageContainer } from '@/components/layout/PageContainer'
import { InvoiceReceipt } from '@/features/sales/components/InvoiceReceipt'
import { OrderForm } from '@/features/sales/components/OrderForm'
import { OrderTable } from '@/features/sales/components/OrderTable'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'
import { useOrdersStore } from '@/store/orders-store'

export function SalesPage() {
  const { orders } = useOrdersStore()
  useDocumentTitle('Satış')

  return (
    <PageContainer title="Satış" description="Sifariş girişi və qaimə qaralaması.">
      <div className={styles.salesLayout}>
        <OrderForm />
        <InvoiceReceipt />
      </div>
      <OrderTable orders={orders} />
    </PageContainer>
  )
}
