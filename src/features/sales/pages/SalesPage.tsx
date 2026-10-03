import { PageContainer } from '@/components/layout/PageContainer.tsx'
import { InvoiceReceipt } from '@/features/sales/components/InvoiceReceipt.tsx'
import { OrderForm } from '@/features/sales/components/OrderForm.tsx'
import { useDocumentTitle } from '@/hooks/use-document-title.ts'
import { styles } from '@/lib/styles.ts'

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
