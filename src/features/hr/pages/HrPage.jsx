import { PageContainer } from '@/components/layout/PageContainer'
import { Card } from '@/components/ui/card'
import { EmployeeTable } from '@/features/hr/components/EmployeeTable'
import { useEmployees } from '@/features/hr/api/use-employees'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'

export function HrPage() {
  const { employees, headcount } = useEmployees()
  useDocumentTitle('İnsan resursları')

  return (
    <PageContainer title="İnsan resursları" description="Şirkətdəki işçilərin siyahısı.">
      <div className={styles.summaryGrid}>
        <Card>
          <p className={styles.summaryLabel}>İşçi sayı</p>
          <p className={styles.summaryValue}>{headcount}</p>
        </Card>
      </div>
      <EmployeeTable employees={employees} />
    </PageContainer>
  )
}
