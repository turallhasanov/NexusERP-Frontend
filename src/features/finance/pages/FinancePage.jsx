import { useEffect, useState } from 'react'
import { DekontPreview, DekontPrintRoot } from '@/components/dekont/DekontPreview'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import {
  buildBalanceDekont,
  buildMizanDekont,
  buildStoreMizanDekont,
  openFinanceDekontPdf,
} from '@/features/finance/api/finance-dekont'
import { useFinanceLedger } from '@/features/finance/api/use-finance-ledger'
import { ExpenseForm } from '@/features/finance/components/ExpenseForm'
import { ExpenseTable } from '@/features/finance/components/ExpenseTable'
import { FinanceReportActions } from '@/features/finance/components/FinanceReportActions'
import { IncomeTable } from '@/features/finance/components/IncomeTable'
import { MizanTable } from '@/features/finance/components/MizanTable'
import { StoreMizanTable } from '@/features/finance/components/StoreMizanTable'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

const PDF_NAMES = {
  balance: 'bilanco.pdf',
  mizan: 'ayliq-mizan.pdf',
  store: 'magaza-mizani.pdf',
}

export function FinancePage() {
  const { entries, expenses, months, storeMonths, income, expenseTotal, payroll, balance } =
    useFinanceLedger()
  const reports = {
    balance: buildBalanceDekont({ income, expenseTotal, balance, payroll }),
    mizan: buildMizanDekont(months),
    store: buildStoreMizanDekont(storeMonths),
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
    openFinanceDekontPdf(reports[next], PDF_NAMES[next])
    setKind(next)
    setPreview(true)
  }

  return (
    <PageContainer title="Maliyyə" description="Satış mədaxili, alış məxarici və maaş fondu.">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className={styles.sectionTitle}>Günün bilançosu</h2>
          <FinanceReportActions
            onView={() => viewReport('balance')}
            onPrint={() => printReport('balance')}
            onPdf={() => pdfReport('balance')}
          />
        </div>
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
      </section>
      <MizanTable
        months={months}
        onView={() => viewReport('mizan')}
        onPrint={() => printReport('mizan')}
        onPdf={() => pdfReport('mizan')}
      />
      <StoreMizanTable
        rows={storeMonths}
        onView={() => viewReport('store')}
        onPrint={() => printReport('store')}
        onPdf={() => pdfReport('store')}
      />
      <ExpenseForm />
      <IncomeTable entries={entries} />
      <ExpenseTable expenses={expenses} />
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
