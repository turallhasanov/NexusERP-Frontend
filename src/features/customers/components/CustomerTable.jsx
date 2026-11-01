import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { TableState } from '@/components/ui/table-state'
import { TrashIcon } from '@/components/ui/trash-icon'
import { displayPhone } from '@/lib/phone'
import { styles } from '@/lib/styles'

const TABLE_COLUMNS = ['Kod', 'Ad', 'VÖEN', 'Telefon', 'Ünvan']

const ACTION_COLUMN = 'Əməliyyat'

export function CustomerTable({
  customers,
  isLoading = false,
  error = '',
  onRetry,
  // Given only where the user may delete (company admins and IT admins): adds an "Əməliyyat" column.
  onDelete,
  deletingId = null,
}) {
  const columns = onDelete ? [...TABLE_COLUMNS, ACTION_COLUMN] : TABLE_COLUMNS
  const showRows = !isLoading && !error

  return (
    <Card padded={false}>
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
          <TableState
            colSpan={columns.length}
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
            isEmpty={customers.length === 0}
            emptyText="Hələ kontragent yoxdur."
          />
          {showRows
            ? customers.map((customer) => (
                <tr key={customer.id} className={styles.tableRow}>
                  <td className={styles.tableCellMuted}>{customer.code}</td>
                  <td className={styles.tableCell}>{customer.name}</td>
                  <td className={styles.tableCellMuted}>{customer.voen || '—'}</td>
                  <td className={styles.tableCellMuted}>{displayPhone(customer.phone) || '—'}</td>
                  <td className={styles.tableCellMuted}>{customer.address || '—'}</td>
                  {onDelete ? (
                    <td className={styles.tableCell}>
                      {/* Accounts the system created (e.g. the online-orders account) have no delete button. */}
                      {customer.isSystem ? (
                        <span className={styles.cellSubtext}>Sistem</span>
                      ) : (
                        <button
                          type="button"
                          className={styles.textActionDanger}
                          onClick={() => onDelete(customer)}
                          disabled={Boolean(deletingId)}
                          title="Kontragenti sil"
                        >
                          {deletingId === customer.id ? <Spinner /> : <TrashIcon />}
                          Sil
                        </button>
                      )}
                    </td>
                  ) : null}
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </Card>
  )
}
