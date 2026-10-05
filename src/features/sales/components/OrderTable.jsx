import { Card } from '@/components/ui/card'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Qaimə', 'Kontragent', 'Məhsul', 'Say', 'Məbləğ']

export function OrderTable({ orders }) {
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
          {orders.length === 0 ? (
            <tr>
              <td className={styles.tableEmpty} colSpan={TABLE_COLUMNS.length}>
                Hələ sifariş yoxdur.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{order.number}</td>
                <td className={styles.tableCell}>{order.customer}</td>
                <td className={styles.tableCellMuted}>{order.product}</td>
                <td className={styles.tableCell}>{order.quantity}</td>
                <td className={styles.tableCell}>{formatAzn(order.total)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Card>
  )
}
