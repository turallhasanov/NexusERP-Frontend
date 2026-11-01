import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { CustomerForm } from '@/features/customers/components/CustomerForm'
import { CustomerTable } from '@/features/customers/components/CustomerTable'
import { deleteCustomer } from '@/features/customers/api/delete-customer'
import { useCustomers } from '@/features/customers/api/use-customers'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'
import { showToast } from '@/store/toast-store'
import { isCompanyManager } from '@/types/auth'

export function CustomersPage() {
  const { customers, isLoading, error, reload } = useCustomers()
  // Deleting is for company admins and IT admins (the API returns 403 to staff).
  const { user } = useAuthStore()
  const canDelete = isCompanyManager(user)
  const [deletingId, setDeletingId] = useState(null)
  useDocumentTitle('Kontragent')

  async function handleDelete(customer) {
    if (!window.confirm('Bu kontragenti silmək istədiyinizdən əminsiniz?')) {
      return
    }

    setDeletingId(customer.id)
    const result = await deleteCustomer(customer.id)
    setDeletingId(null)

    if (!result.ok) {
      showToast(result.error, 'error')
      return
    }

    // The counterparty is gone from the list either way (removed, or deactivated because documents still use it).
    showToast(result.message)
  }

  return (
    <PageContainer title="Kontragent" description="Alış və satış üçün şirkət kartı.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Kontragent sayı</p>
          <p className={styles.summaryValue}>{isLoading ? '…' : customers.length}</p>
        </Card>
      </div>
      <CustomerForm />
      <CustomerTable
        customers={customers}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        onDelete={canDelete ? handleDelete : undefined}
        deletingId={deletingId}
      />
    </PageContainer>
  )
}
