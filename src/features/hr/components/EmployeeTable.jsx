import { Card } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { TableState } from '@/components/ui/table-state'
import { EmployeeStatusBadge } from '@/features/hr/components/EmployeeStatusBadge'
import { formatDateRange, leaveTypeLabel } from '@/features/hr/lib/hr-options'
import { formatDate } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'
import { useStoresStore } from '@/store/stores-store'

const TABLE_COLUMNS = ['Ad', 'Vəzifə', 'Şöbə', 'İşə qəbul', 'İşdən çıxma', 'Maaş', 'Status', 'Əməliyyat']

// Changing or ending employment is for company admins and IT admins (`canManage`); staff see the roster only.
export function EmployeeTable({
  employees,
  isLoading = false,
  error = '',
  onRetry,
  canManage = false,
  busyId = null,
  onVacation,
  onReturn,
  onTerminate,
  onDocument,
  onEdit,
  // Only for IT admins: adds "Sil".
  onDelete,
}) {
  const showRows = !isLoading && !error
  const { stores } = useStoresStore()
  const storeName = (id) => stores.find((store) => store.id === id)?.name ?? '…'

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
            isEmpty={employees.length === 0}
            emptyText="Hələ işçi yoxdur."
          />
          {showRows
            ? employees.map((employee) => (
                <tr key={employee.id} className={styles.tableRow}>
                  <td className={styles.tableCell}>{employee.name}</td>
                  <td className={styles.tableCellMuted}>{employee.title}</td>
                  <td className={styles.tableCellMuted}>
                    {employee.department}
                    {employee.storeId ? (
                      <span className={styles.cellSubtext}>{storeName(employee.storeId)}</span>
                    ) : null}
                  </td>
                  <td className={styles.tableCellMuted}>{formatDate(employee.hiredAt)}</td>
                  <td className={styles.tableCellMuted}>{formatDate(employee.leftAt)}</td>
                  <td className={styles.tableCell}>{formatAzn(employee.salary)}</td>
                  <td className={styles.tableCell}>
                    <EmployeeStatusBadge status={employee.status} />
                    {employee.status === 'leave' && employee.vacationEndDate ? (
                      <span className={styles.cellSubtext}>
                        {formatDateRange(employee.vacationStartDate, employee.vacationEndDate)} ·{' '}
                        {leaveTypeLabel(employee.leaveType)}
                      </span>
                    ) : null}
                    {employee.status === 'left' && employee.terminationReason ? (
                      <span className={styles.cellSubtext}>{employee.terminationReason}</span>
                    ) : null}
                  </td>
                  <td className={styles.tableCell}>
                    {canManage ? (
                      <EmployeeActions
                        employee={employee}
                        busy={busyId === employee.id}
                        disabled={Boolean(busyId)}
                        onVacation={onVacation}
                        onReturn={onReturn}
                        onTerminate={onTerminate}
                        onDocument={onDocument}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </Card>
  )
}

function EmployeeActions({ employee, busy, disabled, onVacation, onReturn, onTerminate, onDocument, onEdit, onDelete }) {
  const editButton = (
    <>
      <button type="button" className={styles.headerAction} onClick={() => onEdit(employee)} disabled={disabled}>
        Redaktə et
      </button>
      {onDelete ? (
        <button type="button" className={styles.dangerAction} onClick={() => onDelete(employee)} disabled={disabled}>
          🗑 Sil
        </button>
      ) : null}
    </>
  )

  if (employee.status === 'left') {
    return (
      <div className={styles.rowActions}>
        <button type="button" className={styles.textActionStrong} onClick={() => onDocument(employee)}>
          Əmrə bax / Yazdır
        </button>
        {editButton}
      </div>
    )
  }

  return (
    <div className={styles.rowActions}>
      {employee.status === 'leave' ? (
        <>
          <button
            type="button"
            className={styles.textActionStrong}
            onClick={() => onReturn(employee)}
            disabled={disabled}
          >
            {busy ? <Spinner /> : 'İşə qayıtdı'}
          </button>
          <button type="button" className={styles.headerAction} onClick={() => onVacation(employee)} disabled={disabled}>
            Tarixləri dəyiş
          </button>
        </>
      ) : (
        <button type="button" className={styles.headerAction} onClick={() => onVacation(employee)} disabled={disabled}>
          Məzuniyyətə göndər
        </button>
      )}
      {editButton}
      <button type="button" className={styles.headerAction} onClick={() => onTerminate(employee)} disabled={disabled}>
        İşdən çıxar
      </button>
    </div>
  )
}
