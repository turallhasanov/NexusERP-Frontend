import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ExpenseStoreModal } from '@/features/finance/components/ExpenseStoreModal'
import { FinanceReportActions } from '@/features/finance/components/FinanceReportActions'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'
import { showToast } from '@/store/toast-store'

const BASE_COLUMNS = ['Sənəd / tarix', 'Kateqoriya', 'Mağaza', 'Məbləğ']

// `canManage` (admins and IT admins) adds "Mağazanı dəyiş" to recorded expenses; purchase and payroll rows have none.
export function ExpenseTable({ expenses, onView, onPrint, onPdf, canManage = false, onStoreChanged }) {
  const [editing, setEditing] = useState(null)
  const columns = canManage ? [...BASE_COLUMNS, 'Əməliyyat'] : BASE_COLUMNS

  function handleSaved(expense) {
    setEditing(null)
    showToast(expense.store ? `Xərc «${expense.store}» mağazasına keçirildi.` : 'Xərc ümumi xərclərə keçirildi.')
    onStoreChanged?.()
  }

  return (
    <Card padded={false}>
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <h2 className={styles.sectionTitle}>Məxaric hesabatı</h2>
        <FinanceReportActions onView={onView} onPrint={onPrint} onPdf={onPdf} />
      </div>
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
          {expenses.length === 0 ? (
            <tr>
              <td className={styles.tableEmpty} colSpan={columns.length}>
                Hələ məxaric yoxdur.
              </td>
            </tr>
          ) : (
            expenses.map((expense) => (
              <tr key={expense.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{expense.number}</td>
                <td className={styles.tableCell}>{expense.category}</td>
                <td className={styles.tableCellMuted}>{expense.store ?? '—'}</td>
                <td className={styles.tableCell}>{formatAzn(expense.amount)}</td>
                {canManage ? (
                  <td className={styles.tableCell}>
                    {expense.kind === 'expense' ? (
                      <button type="button" className={styles.headerAction} onClick={() => setEditing(expense)}>
                        Mağazanı dəyiş
                      </button>
                    ) : (
                      '—'
                    )}
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {editing ? <ExpenseStoreModal expense={editing} onClose={() => setEditing(null)} onSaved={handleSaved} /> : null}
    </Card>
  )
}
