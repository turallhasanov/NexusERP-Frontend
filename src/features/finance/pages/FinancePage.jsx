import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { IncomeTable } from '@/features/finance/components/IncomeTable'
import { useFinanceLedger } from '@/features/finance/api/use-finance-ledger'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

export function FinancePage() {
  const { entries, income } = useFinanceLedger()
  useDocumentTitle('Maliyyə')

  return (
    <PageContainer title="Maliyyə" description="Satışdan gələn mədaxil qeydləri.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Bu günkü mədaxil</p>
          <p className={styles.summaryValue}>{formatAzn(income)}</p>
        </Card>
      </div>
      <IncomeTable entries={entries} />
    </PageContainer>
  )
}
