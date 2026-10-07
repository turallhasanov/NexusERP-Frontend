import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { CustomerForm } from '@/features/customers/components/CustomerForm'
import { CustomerTable } from '@/features/customers/components/CustomerTable'
import { useCustomers } from '@/features/customers/api/use-customers'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'

export function CustomersPage() {
  const { customers } = useCustomers()
  useDocumentTitle('Kontragent')

  return (
    <PageContainer title="Kontragent" description="Satış üçün şirkət kartı.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Kontragent sayı</p>
          <p className={styles.summaryValue}>{customers.length}</p>
        </Card>
      </div>
      <CustomerForm />
      <CustomerTable customers={customers} />
    </PageContainer>
  )
}
