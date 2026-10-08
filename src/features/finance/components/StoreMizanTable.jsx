import { Card } from '@/components/ui/card'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Mağaza', 'Ay', 'Mədaxil', 'Məxaric', 'Qalıq']

export function StoreMizanTable({ rows }) {
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
          {rows.length === 0 ? (
            <tr>
              <td className={styles.tableEmpty} colSpan={TABLE_COLUMNS.length}>
                Hələ mağaza mizanı yoxdur.
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
