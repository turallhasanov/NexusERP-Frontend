import { Card } from '@/components/ui/card'
import { FinanceReportActions } from '@/features/finance/components/FinanceReportActions'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Ay', 'Mədaxil', 'Məxaric', 'Qalıq']

export function MizanTable({ months, onView, onPrint, onPdf }) {
  return (
    <Card padded={false}>
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <h2 className={styles.sectionTitle}>Mizan hesabatı</h2>
        <FinanceReportActions onView={onView} onPrint={onPrint} onPdf={onPdf} />
      </div>
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
          {months.length === 0 ? (
            <tr>
              <td className={styles.tableEmpty} colSpan={TABLE_COLUMNS.length}>
                Hələ mizan hesabatı yoxdur.
              </td>
            </tr>
          ) : (
            months.map((month) => (
              <tr key={month.key} className={styles.tableRow}>
                <td className={styles.tableCell}>{month.label}</td>
                <td className={styles.tableCell}>{formatAzn(month.income)}</td>
                <td className={styles.tableCell}>{formatAzn(month.expense)}</td>
                <td className={styles.tableCell}>{formatAzn(month.balance)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  )
}
