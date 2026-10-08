import { Card } from '@/components/ui/card'
import { FinanceReportActions } from '@/features/finance/components/FinanceReportActions'
import { formatAzn } from '@/lib/money'
import { periodColumn } from '@/lib/date'
import { styles } from '@/lib/styles'

export function StoreMizanTable({ rows, period, onView, onPrint, onPdf }) {
  const columns = ['Mağaza', periodColumn(period), 'Mədaxil', 'Məxaric', 'Qalıq']

  return (
    <Card padded={false}>
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <h2 className={styles.sectionTitle}>Mağaza mizan hesabatı</h2>
        <FinanceReportActions onView={onView} onPrint={onPrint} onPdf={onPdf} />
      </div>
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr>
            {columns.map((column) => (
              <th key={column} className={styles.tableHeadCell}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className={styles.tableEmpty} colSpan={columns.length}>
                Hələ mağaza mizan hesabatı yoxdur.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.key} className={styles.tableRow}>
                <td className={styles.tableCell}>{row.store}</td>
                <td className={styles.tableCell}>{row.label}</td>
                <td className={styles.tableCell}>{formatAzn(row.income)}</td>
                <td className={styles.tableCell}>{formatAzn(row.expense)}</td>
                <td className={styles.tableCell}>{formatAzn(row.balance)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  )
}
