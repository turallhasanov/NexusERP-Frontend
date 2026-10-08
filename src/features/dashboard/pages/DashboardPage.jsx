import { useEffect, useState } from 'react'
import { DekontPreview, DekontPrintRoot } from '@/components/dekont/DekontPreview'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import {
  buildDashboardCards,
  buildDashboardDekont,
  openDashboardDekontPdf,
} from '@/features/dashboard/api/dashboard-dekont'
import { useDashboardSummary } from '@/features/dashboard/api/use-dashboard-summary'
import { FinanceReportActions } from '@/features/finance/components/FinanceReportActions'
import { PeriodFilter } from '@/features/finance/components/PeriodFilter'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { PERIOD_MONTH } from '@/lib/date'
import { styles } from '@/lib/styles'

export function DashboardPage() {
  const [period, setPeriod] = useState(PERIOD_MONTH)
  const [preview, setPreview] = useState(false)
  const [shouldPrint, setShouldPrint] = useState(false)
  const summary = useDashboardSummary(period)
  const cards = buildDashboardCards(summary, period)
  const dekont = buildDashboardDekont(cards, period)
  useDocumentTitle('İdarə paneli')

  useEffect(() => {
    if (!shouldPrint) {
      return
    }

    window.print()
    setShouldPrint(false)
  }, [shouldPrint])

  function viewPdf() {
    void openDashboardDekontPdf(cards, period)
    setPreview(true)
  }

  return (
    <PageContainer
      title="İdarə paneli"
      description="Dövrə görə xülasə rəqəmləri."
      action={<PeriodFilter value={period} onChange={setPeriod} />}
    >
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className={styles.sectionTitle}>Xülasə hesabatı</h2>
          <FinanceReportActions
            onView={() => setPreview(true)}
            onPrint={() => {
              setPreview(true)
              setShouldPrint(true)
            }}
            onPdf={viewPdf}
          />
        </div>
        <div className={styles.summaryGrid}>
          {cards.map((card) => (
            <Card key={card.label}>
              <p className={styles.summaryLabel}>{card.label}</p>
              <p className={styles.summaryValue}>{card.value}</p>
            </Card>
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
