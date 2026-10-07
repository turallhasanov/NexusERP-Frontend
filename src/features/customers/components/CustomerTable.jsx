import { Card } from '@/components/ui/card'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Ad', 'VÖEN', 'Kod']

export function CustomerTable({ customers }) {
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
          {customers.map((customer) => (
            <tr key={customer.id} className={styles.tableRow}>
              <td className={styles.tableCell}>{customer.name}</td>
              <td className={styles.tableCellMuted}>{customer.voen}</td>
              <td className={styles.tableCellMuted}>{customer.code}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
