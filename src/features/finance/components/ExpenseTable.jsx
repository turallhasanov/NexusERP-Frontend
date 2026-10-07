import { Card } from '@/components/ui/card'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Qaimə', 'Kateqoriya', 'Növ', 'Məbləğ']

export function ExpenseTable({ expenses }) {
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
          {expenses.length === 0 ? (
            <tr>
              <td className={styles.tableEmpty} colSpan={TABLE_COLUMNS.length}>
                Hələ məxaric yoxdur.
              </td>
            </tr>
          ) : (
            expenses.map((expense) => (
              <tr key={expense.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{expense.number}</td>
                <td className={styles.tableCell}>{expense.category}</td>
                <td className={styles.tableCellMuted}>Məxaric</td>
                <td className={styles.tableCell}>{formatAzn(expense.amount)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  )
}
