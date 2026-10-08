import { useEffect, useState } from 'react'
import { DekontPreview, DekontPrintRoot } from '@/components/dekont/DekontPreview'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { buildPayrollDekont, openPayrollDekontPdf } from '@/features/hr/api/hr-dekont'
import { payrollForPeriod } from '@/features/hr/api/payroll'
import { useEmployees } from '@/features/hr/api/use-employees'
import { EmployeeForm } from '@/features/hr/components/EmployeeForm'
import { EmployeeTable } from '@/features/hr/components/EmployeeTable'
import { FinanceReportActions } from '@/features/finance/components/FinanceReportActions'
import { PeriodFilter } from '@/features/finance/components/PeriodFilter'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { PERIOD_MONTH, periodCardLabels } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

export function HrPage() {
  const { employees, headcount, onLeave } = useEmployees()
  const [period, setPeriod] = useState(PERIOD_MONTH)
  const [preview, setPreview] = useState(false)
  const [shouldPrint, setShouldPrint] = useState(false)
  const payroll = payrollForPeriod(employees, period)
  const labels = periodCardLabels(period)
  const dekont = buildPayrollDekont(employees, period)
  useDocumentTitle('İnsan resursları')

  useEffect(() => {
    if (!shouldPrint) {
      return
    }

    window.print()
    setShouldPrint(false)
  }, [shouldPrint])

  function viewPdf() {
    void openPayrollDekontPdf(employees, period)
    setPreview(true)
  }

  return (
    <PageContainer
      title="İnsan resursları"
      description="Kadr siyahısı, maaş və işə qəbul."
      action={<PeriodFilter value={period} onChange={setPeriod} />}
    >
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className={styles.sectionTitle}>Maaş hesabatı</h2>
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
          <Card>
            <p className={styles.summaryLabel}>İşçi sayı</p>
            <p className={styles.summaryValue}>{headcount}</p>
          </Card>
          <Card>
            <p className={styles.summaryLabel}>Məzuniyyətdə</p>
            <p className={styles.summaryValue}>{onLeave}</p>
          </Card>
          <Card>
            <p className={styles.summaryLabel}>{labels.payroll}</p>
            <p className={styles.summaryValue}>{formatAzn(payroll)}</p>
          </Card>
        </div>
      </section>
      <EmployeeForm />
      <EmployeeTable employees={employees} />
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
