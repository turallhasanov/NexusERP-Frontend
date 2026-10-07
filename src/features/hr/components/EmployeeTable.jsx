import { Card } from '@/components/ui/card'
import { EmployeeStatusBadge } from '@/features/hr/components/EmployeeStatusBadge'
import { setEmployeeLeave } from '@/features/hr/api/toggle-employee-leave'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Ad', 'Vəzifə', 'Şöbə', 'Status', 'Əməliyyat']

export function EmployeeTable({ employees }) {
  return (
    <Card padded={false}>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            {TABLE_COLUMNS.map((column) => (
              <th key={column} className={styles.tableHeadCell}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.length === 0 ? (
            <tr>
              <td className={styles.tableEmpty} colSpan={TABLE_COLUMNS.length}>
                Hələ işçi yoxdur.
              </td>
            </tr>
          ) : (
            employees.map((employee) => (
              <tr key={employee.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{employee.name}</td>
                <td className={styles.tableCellMuted}>{employee.title}</td>
                <td className={styles.tableCellMuted}>{employee.department}</td>
                <td className={styles.tableCell}>
                  <EmployeeStatusBadge status={employee.status} />
                </td>
                <td className={styles.tableCell}>
                  <button
                    type="button"
                    className={styles.headerAction}
                    onClick={() => setEmployeeLeave(employee.id)}
                  >
                    {employee.status === 'active' ? 'Məzuniyyətə göndər' : 'İşə qaytar'}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  )
}
