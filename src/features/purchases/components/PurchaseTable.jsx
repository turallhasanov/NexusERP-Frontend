import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { TableState } from '@/components/ui/table-state'
import { OrderStatusBadge } from '@/features/sales/components/OrderStatusBadge'
import { formatDate } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Qaimə', 'Tarix', 'Kontragent', 'VÖEN', 'Anbar', 'Sətir', 'Məbləğ', 'Status', 'Əməliyyat']

export function PurchaseTable({ purchases, isLoading, error, onRetry, onView, onApprove, approvingId }) {
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
            isEmpty={purchases.length === 0}
            emptyText="Hələ alış yoxdur."
          />
          {showRows
            ? purchases.map((purchase) => (
                <tr key={purchase.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{purchase.number}</td>
                  <td className={styles.tableCellMuted}>{formatDate(purchase.createdAt)}</td>
                  <td className={styles.tableCell}>{purchase.customer}</td>
                  <td className={styles.tableCellMuted}>{purchase.voen}</td>
                  <td className={styles.tableCellMuted}>{purchase.warehouse}</td>
                  <td className={styles.tableCellMuted}>{purchase.itemCount}</td>
                  <td className={styles.tableCell}>{formatAzn(purchase.total)}</td>
                  <td className={styles.tableCell}>
                    <OrderStatusBadge status={purchase.status} />
                  </td>
                  <td className={styles.tableCell}>
                    <div className={styles.rowActions}>
                      <button type="button" className={styles.headerAction} onClick={() => onView(purchase.id)}>
                        Bax
                      </button>
                      {purchase.status === 'draft' ? (
                        <button
                          type="button"
                          className={styles.textActionStrong}
                          onClick={() => onApprove(purchase)}
                          disabled={Boolean(approvingId)}
                        >
                          {approvingId === purchase.id ? <Spinner /> : 'Təsdiqlə'}
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
