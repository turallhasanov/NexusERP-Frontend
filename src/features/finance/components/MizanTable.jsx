import { Card } from '@/components/ui/card'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Ay', 'Mədaxil', 'Məxaric', 'Qalıq']

export function MizanTable({ months }) {
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
          {months.length === 0 ? (
            <tr>
              <td className={styles.tableEmpty} colSpan={TABLE_COLUMNS.length}>
                Hələ aylıq mizan yoxdur.
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
