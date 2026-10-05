import { PageContainer } from '@/components/layout/PageContainer'
import { InvoiceReceipt } from '@/features/sales/components/InvoiceReceipt'
import { OrderForm } from '@/features/sales/components/OrderForm'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'

export function SalesPage() {
  useDocumentTitle('Satış')

  return (
    <PageContainer title="Satış" description="Sifariş girişi və qaimə qaralaması.">
      <div className={styles.salesLayout}>
        <OrderForm />
        <InvoiceReceipt />
      </div>
    </PageContainer>
  )
}
