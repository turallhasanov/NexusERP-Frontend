import { useEffect, useState } from 'react'
import { DekontPreview, DekontPrintRoot } from '@/components/dekont/DekontPreview'
import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { buildPayrollDekont, openPayrollDekontPdf } from '@/features/hr/api/hr-dekont'
import { payrollForPeriod } from '@/features/hr/api/payroll'
import { returnFromVacation } from '@/features/hr/api/employees-api'
import { useEmployees } from '@/features/hr/api/use-employees'
import { DeleteEmployeeModal } from '@/features/hr/components/DeleteEmployeeModal'
import { EmployeeEditModal } from '@/features/hr/components/EmployeeEditModal'
import { EmployeeForm } from '@/features/hr/components/EmployeeForm'
import { EmployeeTable } from '@/features/hr/components/EmployeeTable'
import { TerminateModal } from '@/features/hr/components/TerminateModal'
import { TerminationDocumentModal } from '@/features/hr/components/TerminationDocumentModal'
import { VacationModal } from '@/features/hr/components/VacationModal'
import { formatDateRange } from '@/features/hr/lib/hr-options'
import { FinanceReportActions } from '@/features/finance/components/FinanceReportActions'
import { PeriodFilter } from '@/features/finance/components/PeriodFilter'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { PERIOD_MONTH, periodCardLabels } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { printAfterRender } from '@/lib/print'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'
import { showToast } from '@/store/toast-store'
import { isCompanyManager, isItAdmin } from '@/types/auth'

export function HrPage() {
  const { employees, isLoading, error, reload, headcount, onLeave } = useEmployees()
  const { user } = useAuthStore()
  const canManage = isCompanyManager(user)
  // Permanent deletion is for IT admins only; company admins terminate instead.
  const canDelete = isItAdmin(user)
  const [period, setPeriod] = useState(PERIOD_MONTH)
  const [preview, setPreview] = useState(false)
  // { type: 'edit' | 'delete' | 'vacation' | 'terminate' | 'document', employee }
  const [dialog, setDialog] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const payroll = payrollForPeriod(employees, period)
  const labels = periodCardLabels(period)
  const dekont = buildPayrollDekont(employees, period)
  useDocumentTitle('İnsan resursları')

  // Leaves that ended are closed by the server when the list loads, so refresh it on every visit.
  useEffect(() => {
    void reload()
  }, [reload])

  function handleVacationSaved(employee) {
    setDialog(null)
    showToast(`${employee.name} məzuniyyətə göndərildi: ${formatDateRange(employee.vacationStartDate, employee.vacationEndDate)}`)
  }

  // Straight to the order, so it can be printed right away.
  function handleTerminated(employee) {
    setDialog({ type: 'document', employee })
    showToast(`${employee.name} işdən çıxarıldı. Əmr № ${employee.terminationOrderNumber} yaradıldı.`)
  }

  async function handleReturn(employee) {
    setBusyId(employee.id)

    try {
      const updated = await returnFromVacation(employee.id)
      showToast(`${updated.name} işə qayıtdı.`)
    } catch (returnError) {
      showToast(returnError.message, 'error')
    } finally {
      setBusyId(null)
    }
  }

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
            onPrint={() => printAfterRender(() => setPreview(true))}
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
      {canManage ? <EmployeeForm /> : null}
      <EmployeeTable
        employees={employees}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        canManage={canManage}
        busyId={busyId}
        onVacation={(employee) => setDialog({ type: 'vacation', employee })}
        onReturn={handleReturn}
        onTerminate={(employee) => setDialog({ type: 'terminate', employee })}
        onDocument={(employee) => setDialog({ type: 'document', employee })}
        onEdit={(employee) => setDialog({ type: 'edit', employee })}
        onDelete={canDelete ? (employee) => setDialog({ type: 'delete', employee }) : undefined}
      />
      {dialog?.type === 'delete' ? (
        <DeleteEmployeeModal
          employee={dialog.employee}
          onClose={() => setDialog(null)}
          onDeleted={(employee) => {
            setDialog(null)
            showToast(`İşçi silindi: ${employee.name}`)
          }}
        />
      ) : null}
      {dialog?.type === 'edit' ? (
        <EmployeeEditModal
          employee={dialog.employee}
          onClose={() => setDialog(null)}
          onSaved={(employee) => {
            setDialog(null)
            showToast(`İşçinin məlumatları yeniləndi: ${employee.name}`)
          }}
        />
      ) : null}
      {dialog?.type === 'vacation' ? (
        <VacationModal employee={dialog.employee} onClose={() => setDialog(null)} onSaved={handleVacationSaved} />
      ) : null}
      {dialog?.type === 'terminate' ? (
        <TerminateModal employee={dialog.employee} onClose={() => setDialog(null)} onTerminated={handleTerminated} />
      ) : null}
      {dialog?.type === 'document' ? (
        <TerminationDocumentModal employee={dialog.employee} onClose={() => setDialog(null)} />
      ) : null}
      {preview ? (
        <DekontPreview
          title={dekont.title}
          dekont={dekont}
          onClose={() => setPreview(false)}
          onPrint={() => window.print()}
          onPdf={viewPdf}
        />
      ) : null}
      {/* Only one print root at a time: while the termination order is open, it is what gets printed. */}
      {dialog?.type === 'document' ? null : <DekontPrintRoot dekont={dekont} />}
    </PageContainer>
  )
}
