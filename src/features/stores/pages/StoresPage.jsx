import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { deleteStore } from '@/features/stores/api/manage-store'
import { StoreEditModal } from '@/features/stores/components/StoreEditModal'
import { StoreForm } from '@/features/stores/components/StoreForm'
import { StoreTable } from '@/features/stores/components/StoreTable'
import { useStores } from '@/features/stores/api/use-stores'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'
import { showToast } from '@/store/toast-store'
import { isCompanyManager } from '@/types/auth'

export function StoresPage() {
  const { stores, isLoading, error, reload } = useStores()
  const { user } = useAuthStore()
  const canManage = isCompanyManager(user)
  const [editing, setEditing] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  useDocumentTitle('Mağaza')

  async function handleDelete(store) {
    if (!window.confirm(`«${store.name}» (${store.code}) mağazası silinsin? Bu əməliyyat geri qaytarıla bilməz.`)) {
      return
    }

    setDeletingId(store.id)

    try {
      await deleteStore(store.id)
      showToast(`Mağaza silindi: ${store.name}`)
    } catch (deleteError) {
      // 409 with the reason ("Bu mağazaya bağlı əməliyyatlar var, silmək mümkün deyil (satış: 3, …)").
      showToast(deleteError.message, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <PageContainer title="Mağaza" description="Pərakəndə satış nöqtələri.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Mağaza sayı</p>
          <p className={styles.summaryValue}>{isLoading ? '…' : stores.length}</p>
        </Card>
      </div>
      <StoreForm />
      <StoreTable
        stores={stores}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        canManage={canManage}
        deletingId={deletingId}
        onEdit={setEditing}
        onDelete={handleDelete}
      />
      {editing ? (
        <StoreEditModal
          store={editing}
          onClose={() => setEditing(null)}
          onSaved={(store) => {
            setEditing(null)
            showToast(`Mağaza yeniləndi: ${store.name}`)
          }}
        />
      ) : null}
    </PageContainer>
  )
}
