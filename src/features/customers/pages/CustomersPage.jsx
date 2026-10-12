import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { CustomerForm } from '@/features/customers/components/CustomerForm'
import { CustomerTable } from '@/features/customers/components/CustomerTable'
import { useCustomers } from '@/features/customers/api/use-customers'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'

export function CustomersPage() {
  const { customers, isLoading, error, reload } = useCustomers()
  useDocumentTitle('Kontragent')

  return (
    <PageContainer title="Kontragent" description="Alış və satış üçün şirkət kartı.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Kontragent sayı</p>
          <p className={styles.summaryValue}>{isLoading ? '…' : customers.length}</p>
        </Card>
      </div>
      <CustomerForm />
      <CustomerTable customers={customers} isLoading={isLoading} error={error} onRetry={reload} />
    </PageContainer>
  )
}
