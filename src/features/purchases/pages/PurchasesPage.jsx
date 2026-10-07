import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { PurchaseForm } from '@/features/purchases/components/PurchaseForm'
import { PurchaseTable } from '@/features/purchases/components/PurchaseTable'
import { usePurchases } from '@/features/purchases/api/use-purchases'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'

export function PurchasesPage() {
  const { purchases } = usePurchases()
  useDocumentTitle('Alış')

  return (
    <PageContainer title="Alış" description="Toptan mal girişi və depo qalığı.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Alış sayı</p>
          <p className={styles.summaryValue}>{purchases.length}</p>
        </Card>
      </div>
      <PurchaseForm />
      <PurchaseTable purchases={purchases} />
    </PageContainer>
  )
}
