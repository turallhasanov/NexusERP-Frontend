import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { EmployeeForm } from '@/features/hr/components/EmployeeForm'
import { EmployeeTable } from '@/features/hr/components/EmployeeTable'
import { useEmployees } from '@/features/hr/api/use-employees'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

export function HrPage() {
  const { employees, headcount, onLeave, payroll } = useEmployees()
  useDocumentTitle('İnsan resursları')

  return (
    <PageContainer title="İnsan resursları" description="Kadr siyahısı, maaş və işə qəbul.">
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
          <p className={styles.summaryLabel}>Bu ayın maaş</p>
          <p className={styles.summaryValue}>{formatAzn(payroll)}</p>
        </Card>
      </div>
      <EmployeeForm />
      <EmployeeTable employees={employees} />
    </PageContainer>
  )
}
