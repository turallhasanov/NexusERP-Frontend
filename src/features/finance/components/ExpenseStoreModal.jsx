import { useState } from 'react'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { updateExpenseStore } from '@/features/finance/api/update-expense-store'
import { cn } from '@/lib/cn'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'
import { useStoresStore } from '@/store/stores-store'

// Moves an expense to another store (or makes it company-wide). Amount and cash register stay as recorded.
export function ExpenseStoreModal({ expense, onClose, onSaved }) {
  const { stores } = useStoresStore()
  const [storeId, setStoreId] = useState(expense.storeId ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // A store closed since stays selectable for the expense already in it.
  const options = stores.filter((store) => store.isActive !== false || store.id === expense.storeId)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      onSaved(await updateExpenseStore(expense.id, storeId))
    } catch (submitError) {
      setError(submitError.message)
      setSubmitting(false)
    }
  }

  return (
    <AdminModal
      title="Xərcin mağazasını dəyiş"
      labelId="expense-store-title"
      width="narrow"
      onClose={onClose}
      header={
        <p className={styles.adminPageDescription}>
          {expense.category} · {formatAzn(expense.amount)} · {expense.number}
        </p>
      }
    >
      <form className={styles.adminForm} onSubmit={handleSubmit}>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Mağaza</span>
          <select
            className={cn(styles.adminInput, styles.adminDateInput)}
            value={storeId}
            onChange={(event) => setStoreId(event.target.value)}
            autoFocus
          >
            <option value="">Ümumi (mağazaya aid deyil)</option>
            {options.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </label>
        <p className={styles.adminFormHint}>
          Yalnız mağaza dəyişir: məbləğ, kateqoriya və kassa olduğu kimi qalır, mağazaların mənfəət/zərər hesabı yenilənir.
        </p>

        {error ? <p className={styles.adminFormError}>{error}</p> : null}

        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose}>
            Ləğv et
          </button>
          <button type="submit" className={styles.adminButtonPrimary} disabled={submitting}>
            {submitting ? 'Yadda saxlanılır…' : 'Yadda saxla'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
