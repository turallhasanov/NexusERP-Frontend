import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { TableState } from '@/components/ui/table-state'
import { OrderStatusBadge } from '@/features/sales/components/OrderStatusBadge'
import { formatDate } from '@/lib/date'
import { displayPhone } from '@/lib/phone'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'
import { CHANNEL_ONLINE } from '@/store/orders-store'

function orderTypeLabel(order) {
  if (order.channel === CHANNEL_ONLINE) {
    return 'Online (Khazar)'
  }

  return order.type === 'retail' ? 'Pərakəndə' : 'Toptan'
}

const TABLE_COLUMNS = ['Qaimə', 'Tarix', 'Növ', 'Müştəri / Kontragent', 'Mağaza', 'Anbar', 'Sətir', 'Məbləğ', 'Status', 'Əməliyyat']

export function OrderTable({ orders, isLoading, error, onRetry, onView, onApprove, approvingId, emptyText = 'Hələ satış yoxdur.' }) {
  const showRows = !isLoading && !error

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
          <TableState
            colSpan={TABLE_COLUMNS.length}
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            isEmpty={orders.length === 0}
            emptyText={emptyText}
          />
          {showRows
            ? orders.map((order) => (
                <tr key={order.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>
                    {order.number}
                    {order.externalOrderNumber ? (
                      <span className={styles.cellSubtext}>{order.externalOrderNumber}</span>
                    ) : null}
                  </td>
                  <td className={styles.tableCellMuted}>{formatDate(order.createdAt)}</td>
                  <td className={styles.tableCell}>{orderTypeLabel(order)}</td>
                  <td className={styles.tableCell}>
                    {order.customer}
                    {order.retailCustomer?.phone ? (
                      <span className={styles.cellSubtext}>{displayPhone(order.retailCustomer.phone)}</span>
                    ) : null}
                  </td>
                  <td className={styles.tableCellMuted}>{order.store}</td>
                  <td className={styles.tableCellMuted}>{order.warehouse}</td>
                  <td className={styles.tableCellMuted}>{order.itemCount}</td>
                  <td className={styles.tableCell}>{formatAzn(order.total)}</td>
                  <td className={styles.tableCell}>
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.rowActions}>
                      <button type="button" className={styles.headerAction} onClick={() => onView(order.id)}>
                        Bax
                      </button>
                      {order.status === 'draft' ? (
                        <button
                          type="button"
                          className={styles.textActionStrong}
                          onClick={() => onApprove(order)}
                          disabled={Boolean(approvingId)}
                        >
                          {approvingId === order.id ? <Spinner /> : 'Təsdiqlə'}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </Card>
  )
}
