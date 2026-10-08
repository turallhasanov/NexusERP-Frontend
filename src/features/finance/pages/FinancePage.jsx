import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { ExpenseForm } from '@/features/finance/components/ExpenseForm'
import { ExpenseTable } from '@/features/finance/components/ExpenseTable'
import { IncomeTable } from '@/features/finance/components/IncomeTable'
import { MizanTable } from '@/features/finance/components/MizanTable'
import { StoreMizanTable } from '@/features/finance/components/StoreMizanTable'
import { useFinanceLedger } from '@/features/finance/api/use-finance-ledger'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

export function FinancePage() {
  const { entries, expenses, months, storeMonths, income, expenseTotal, payroll, balance } =
    useFinanceLedger()
  useDocumentTitle('Maliyyə')

  return (
    <PageContainer title="Maliyyə" description="Satış mədaxili, alış məxarici və maaş fondu.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>Bu günkü mədaxil</p>
          <p className={styles.summaryValue}>{formatAzn(income)}</p>
        </Card>
        <Card>
          <p className={styles.summaryLabel}>Bu günkü məxaric</p>
          <p className={styles.summaryValue}>{formatAzn(expenseTotal)}</p>
        </Card>
        <Card>
          <p className={styles.summaryLabel}>Bu günkü qalıq</p>
          <p className={styles.summaryValue}>{formatAzn(balance)}</p>
        </Card>
        <Card>
          <p className={styles.summaryLabel}>Bu ayın maaş</p>
          <p className={styles.summaryValue}>{formatAzn(payroll)}</p>
        </Card>
      </div>
      <MizanTable months={months} />
      <StoreMizanTable rows={storeMonths} />
      <ExpenseForm />
      <IncomeTable entries={entries} />
      <ExpenseTable expenses={expenses} />
    </PageContainer>
  )
}
