import { useEffect, useState } from 'react'
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
import { useFinanceLedger } from '@/features/finance/api/use-finance-ledger'
import { ExpenseForm } from '@/features/finance/components/ExpenseForm'
import { ExpenseTable } from '@/features/finance/components/ExpenseTable'
import { FinanceReportActions } from '@/features/finance/components/FinanceReportActions'
import { IncomeTable } from '@/features/finance/components/IncomeTable'
import { MizanTable } from '@/features/finance/components/MizanTable'
import { PeriodFilter } from '@/features/finance/components/PeriodFilter'
import { StoreMizanTable } from '@/features/finance/components/StoreMizanTable'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { PERIOD_MONTH, periodCardLabels } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

export function FinancePage() {
  const [period, setPeriod] = useState(PERIOD_MONTH)
  const { entries, expenses, months, storeMonths, income, expenseTotal, payroll, balance } =
    useFinanceLedger(period)
  const labels = periodCardLabels(period)
  const reports = {
    balance: buildBalanceDekont({ income, expenseTotal, balance, payroll, labels, period }),
    mizan: buildMizanDekont(months, period),
    store: buildStoreMizanDekont(storeMonths, period),
    income: buildIncomeDekont(entries, period),
    expense: buildExpenseDekont(expenses, period),
  }
  const [kind, setKind] = useState('balance')
  const [preview, setPreview] = useState(false)
  const [shouldPrint, setShouldPrint] = useState(false)
  const dekont = reports[kind]
  useDocumentTitle('Maliyyə')

  useEffect(() => {
    if (!shouldPrint) {
      return
    }

    window.print()
    setShouldPrint(false)
  }, [shouldPrint, kind])

  function viewReport(next) {
    setKind(next)
    setPreview(true)
  }

  function printReport(next) {
    setKind(next)
    setPreview(true)
    setShouldPrint(true)
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
        <div className={styles.summaryGrid}>
          <Card>
            <p className={styles.summaryLabel}>{labels.income}</p>
            <p className={styles.summaryValue}>{formatAzn(income)}</p>
          </Card>
          <Card>
            <p className={styles.summaryLabel}>{labels.expense}</p>
            <p className={styles.summaryValue}>{formatAzn(expenseTotal)}</p>
          </Card>
          <Card>
            <p className={styles.summaryLabel}>{labels.balance}</p>
            <p className={styles.summaryValue}>{formatAzn(balance)}</p>
          </Card>
          <Card>
            <p className={styles.summaryLabel}>{labels.payroll}</p>
            <p className={styles.summaryValue}>{formatAzn(payroll)}</p>
          </Card>
        </div>
      </section>
      <MizanTable
        months={months}
        period={period}
        onView={() => viewReport('mizan')}
        onPrint={() => printReport('mizan')}
        onPdf={() => pdfReport('mizan')}
      />
      <StoreMizanTable
        rows={storeMonths}
        period={period}
        onView={() => viewReport('store')}
        onPrint={() => printReport('store')}
        onPdf={() => pdfReport('store')}
      />
      <ExpenseForm />
      <IncomeTable
        entries={entries}
        onView={() => viewReport('income')}
        onPrint={() => printReport('income')}
        onPdf={() => pdfReport('income')}
      />
      <ExpenseTable
        expenses={expenses}
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
