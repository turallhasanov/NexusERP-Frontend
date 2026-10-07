import { Card } from '@/components/ui/card'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Qaimə', 'Kontragent', 'Məhsul', 'Növ', 'Məbləğ']

export function IncomeTable({ entries }) {
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
          {entries.length === 0 ? (
            <tr>
              <td className={styles.tableEmpty} colSpan={TABLE_COLUMNS.length}>
                Hələ mədaxil yoxdur.
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{entry.number}</td>
                <td className={styles.tableCell}>{entry.customer}</td>
                <td className={styles.tableCellMuted}>{entry.product}</td>
                <td className={styles.tableCellMuted}>Mədaxil</td>
                <td className={styles.tableCell}>{formatAzn(entry.total)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  )
}
