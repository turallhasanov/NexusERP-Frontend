import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DekontPreview, DekontPrintRoot } from '@/components/dekont/DekontPreview'
import { PageContainer } from '@/components/layout/PageContainer'
import { StatCard } from '@/components/ui/stat-card'
import { Spinner } from '@/components/ui/spinner'
import {
  buildDashboardDekont,
  buildKpiCards,
  buildOperationsCards,
  openDashboardDekontPdf,
  rangeLabel,
} from '@/features/dashboard/api/dashboard-dekont'
import { useDashboardSummary, useOperationsSummary } from '@/features/dashboard/api/use-dashboard-summary'
import { FinanceReportActions } from '@/features/finance/components/FinanceReportActions'
import { PeriodFilter } from '@/features/finance/components/PeriodFilter'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { printAfterRender } from '@/lib/print'
import { RANGE_MONTH, RANGE_PRESETS } from '@/lib/report-range'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'

export function DashboardPage() {
  const [rangeId, setRangeId] = useState(RANGE_MONTH)
  const [preview, setPreview] = useState(false)
  const summary = useDashboardSummary(rangeId)
  const operations = useOperationsSummary()
  const kpiCards = buildKpiCards(summary.data)
  const operationsCards = buildOperationsCards(operations)
  const dekont = buildDashboardDekont([...kpiCards, ...operationsCards], rangeId)
  useDocumentTitle('İdarə paneli')

  function viewPdf() {
    void openDashboardDekontPdf([...kpiCards, ...operationsCards], rangeId)
    setPreview(true)
  }

  return (
    <PageContainer
      title="İdarə paneli"
      description={rangeLabel(rangeId)}
      action={<PeriodFilter value={rangeId} onChange={setRangeId} options={RANGE_PRESETS} />}
    >
      <section className="space-y-4">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            Maliyyə göstəriciləri {summary.isLoading ? <Spinner className="ml-2 align-middle" /> : null}
          </h2>
          <div className="flex flex-wrap items-center gap-4">
            <Link to={routes.reports} className={styles.textAction}>
              Ətraflı hesabatlar
            </Link>
            <FinanceReportActions
              onView={() => setPreview(true)}
              onPrint={() => printAfterRender(() => setPreview(true))}
              onPdf={viewPdf}
            />
          </div>
        </div>
        {summary.error ? (
          <div className={styles.errorRow}>
            <span>{summary.error}</span>
            <button type="button" className={styles.textAction} onClick={summary.reload}>
              Yenidən cəhd et
            </button>
          </div>
        ) : null}
        <div className={styles.kpiGrid}>
          {kpiCards.map((card) => (
            <StatCard key={card.label} {...card} isLoading={summary.isLoading} />
          ))}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className={styles.sectionTitle}>Əməliyyatlar</h2>
        <div className={styles.kpiGrid}>
          {operationsCards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>
      </section>
      {preview ? (
        <DekontPreview
          title={dekont.title}
          dekont={dekont}
          onClose={() => setPreview(false)}
          onPrint={() => window.print()}
          onPdf={viewPdf}
        />
      ) : null}
      <DekontPrintRoot dekont={dekont} />
    </PageContainer>
  )
}
