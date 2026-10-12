import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { StoreForm } from '@/features/stores/components/StoreForm'
import { StoreTable } from '@/features/stores/components/StoreTable'
import { useStores } from '@/features/stores/api/use-stores'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'

export function StoresPage() {
  const { stores, isLoading, error, reload } = useStores()
  useDocumentTitle('Mağaza')

  return (
    <PageContainer title="Mağaza" description="Pərakəndə satış nöqtələri.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Mağaza sayı</p>
          <p className={styles.summaryValue}>{isLoading ? '…' : stores.length}</p>
        </Card>
      </div>
      <StoreForm />
      <StoreTable stores={stores} isLoading={isLoading} error={error} onRetry={reload} />
    </PageContainer>
  )
}
