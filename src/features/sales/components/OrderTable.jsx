import { Card } from '@/components/ui/card'
import { OrderStatusBadge } from '@/features/sales/components/OrderStatusBadge'
import { setOrderStatus } from '@/features/sales/api/toggle-order-status'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Qaimə', 'Kontragent', 'VÖEN', 'Məhsul', 'Say', 'Məbləğ', 'Status', 'Əməliyyat']

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
                <td className={styles.tableCellMuted}>{order.voen}</td>
                <td className={styles.tableCellMuted}>{order.product}</td>
                <td className={styles.tableCell}>{order.quantity}</td>
                <td className={styles.tableCell}>{formatAzn(order.total)}</td>
                <td className={styles.tableCell}>
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className={styles.tableCell}>
                  <button
                    type="button"
                    className={styles.headerAction}
                    onClick={() => setOrderStatus(order.id)}
                  >
                    {order.status === 'open' ? 'Bağla' : 'Yenidən aç'}
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
