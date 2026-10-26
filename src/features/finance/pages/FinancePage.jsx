import { useState } from 'react'
import { DekontPreview, DekontPrintRoot } from '@/components/dekont/DekontPreview'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import {
  buildBalanceDekont,
  buildExpenseDekont,
  buildIncomeDekont,
  buildMizanDekont,
  buildStoreMizanDekont,
  financePdfName,
  openFinanceDekontPdf,
} from '@/features/finance/api/finance-dekont'
import { fetchFinanceMizan, fetchFinanceSummary, fetchStoreFinanceSummary } from '@/features/finance/api/finance-summary'
import { useFinanceLedger } from '@/features/finance/api/use-finance-ledger'
import { DepositModal } from '@/features/finance/components/DepositModal'
import { ExpenseForm } from '@/features/finance/components/ExpenseForm'
import { ExpenseTable } from '@/features/finance/components/ExpenseTable'
import { FinanceReportActions } from '@/features/finance/components/FinanceReportActions'
import { IncomeTable } from '@/features/finance/components/IncomeTable'
import { MizanTable } from '@/features/finance/components/MizanTable'
import { PeriodFilter } from '@/features/finance/components/PeriodFilter'
import { StoreProfitPanel } from '@/features/finance/components/StoreProfitPanel'
import { useApiQuery } from '@/hooks/use-api-query'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { PERIOD_MONTH, periodCardLabels } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { printAfterRender } from '@/lib/print'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'
import { useStoresStore } from '@/store/stores-store'
import { showToast } from '@/store/toast-store'
import { isCompanyManager } from '@/types/auth'

export function FinancePage() {
  const [period, setPeriod] = useState(PERIOD_MONTH)
  const [storeId, setStoreId] = useState('')
  const [depositing, setDepositing] = useState(false)
  const { stores } = useStoresStore()
  // Company-wide figures for the cards and "Bütün mağazalar"; the store panel loads its own only for one store.
  const companySummary = useApiQuery(fetchFinanceSummary, { storeId: '', period })
  const storeSummary = useApiQuery(fetchStoreFinanceSummary, { storeId, period })
  const summary = storeId ? storeSummary : companySummary
  const mizan = useApiQuery(fetchFinanceMizan, { period })
  const totals = companySummary.data?.totals ?? null
  const selectedStore = stores.find((store) => store.id === storeId) ?? null
  const { entries, expenses } = useFinanceLedger(period)
  const { user } = useAuthStore()
  const canManage = isCompanyManager(user)
  const labels = periodCardLabels(period)
  const reports = {
    balance: buildBalanceDekont({ totals, labels, period }),
    mizan: buildMizanDekont(mizan.data?.rows ?? [], period),
    store: buildStoreMizanDekont(summary.data?.stores ?? [], period, selectedStore?.name ?? null),
    income: buildIncomeDekont(entries, period),
    expense: buildExpenseDekont(expenses, period),
  }
  const [kind, setKind] = useState('balance')
  const [preview, setPreview] = useState(false)
  const dekont = reports[kind]
  useDocumentTitle('Maliyyə')

  // Moving an expense to another store changes the summaries (the company mizan total stays, but reload it too).
  function reloadSummaries() {
    companySummary.reload()
    storeSummary.reload()
    mizan.reload()
  }

  // '…' until the first summary arrives.
  const money = (value) => (totals ? formatAzn(value) : '…')

  function viewReport(next) {
    setKind(next)
    setPreview(true)
  }

  function printReport(next) {
    printAfterRender(() => {
      setKind(next)
      setPreview(true)
    })
  }

  function pdfReport(next) {
    void openFinanceDekontPdf(reports[next], financePdfName(next, period))
    setKind(next)
    setPreview(true)
  }

  return (
    <PageContainer
      title="Maliyyə"
      description="Satış mədaxili, alış məxarici və maaş fondu."
      action={<PeriodFilter value={period} onChange={setPeriod} />}
    >
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className={styles.sectionTitle}>Balans hesabatı</h2>
          <FinanceReportActions
            onView={() => viewReport('balance')}
            onPrint={() => printReport('balance')}
            onPdf={() => pdfReport('balance')}
          />
        </div>
        <div className={styles.kpiGrid} aria-busy={companySummary.isLoading}>
          <Card>
            <p className={styles.summaryLabel}>{labels.income}</p>
            <p className={styles.summaryValue}>{money(totals?.revenue)}</p>
          </Card>
          <Card>
            <p className={styles.summaryLabel}>{labels.expense}</p>
            <p className={styles.summaryValue}>{money(totals?.totalExpenses)}</p>
            <p className={styles.summaryHint}>Maya dəyəri, əməliyyat xərcləri və maaş</p>
          </Card>
          <Card>
            <p className={styles.summaryLabel}>{labels.balance}</p>
            <p
              className={
                !totals ? styles.summaryValue : totals.netProfit < 0 ? styles.summaryValueNegative : styles.summaryValuePositive
              }
            >
              {money(totals?.netProfit)}
            </p>
          </Card>
          <Card>
            <p className={styles.summaryLabel}>{labels.payroll}</p>
            <p className={styles.summaryValue}>{money(totals?.payroll)}</p>
          </Card>
        </div>
        {companySummary.error && !totals ? <p className={styles.formError}>{companySummary.error}</p> : null}
      </section>
      <MizanTable
        mizan={mizan}
        period={period}
        onView={() => viewReport('mizan')}
        onPrint={() => printReport('mizan')}
        onPdf={() => pdfReport('mizan')}
      />
      <StoreProfitPanel
        stores={stores}
        storeId={storeId}
        onStoreChange={setStoreId}
        summary={summary}
        onView={() => viewReport('store')}
        onPrint={() => printReport('store')}
        onPdf={() => pdfReport('store')}
      />
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Kassa əməliyyatları</h2>
        <button type="button" className={styles.buttonOutline} onClick={() => setDepositing(true)}>
          + Mədaxil et
        </button>
      </div>
      <ExpenseForm />
      {depositing ? (
        <DepositModal
          onClose={() => setDepositing(false)}
          onDone={({ register, amount }) => {
            setDepositing(false)
            showToast(`${register?.name ?? 'Kassa'}: ${formatAzn(amount)} mədaxil edildi.`)
          }}
        />
      ) : null}
      <IncomeTable
        entries={entries}
        onView={() => viewReport('income')}
        onPrint={() => printReport('income')}
        onPdf={() => pdfReport('income')}
      />
      <ExpenseTable
        expenses={expenses}
        canManage={canManage}
        onStoreChanged={reloadSummaries}
        onView={() => viewReport('expense')}
        onPrint={() => printReport('expense')}
        onPdf={() => pdfReport('expense')}
      />
      {preview ? (
        <DekontPreview
          title={dekont.title}
          dekont={dekont}
          onClose={() => setPreview(false)}
          onPrint={() => window.print()}
          onPdf={() => pdfReport(kind)}
        />
      ) : null}
      <DekontPrintRoot dekont={dekont} />
    </PageContainer>
  )
}
