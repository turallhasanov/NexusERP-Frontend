import { useState } from 'react'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { depositCash } from '@/features/finance/api/deposit-cash'
import { cn } from '@/lib/cn'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'
import { useCashRegistersStore } from '@/store/cash-registers-store'

const DEFAULT_REGISTER_CODE = 'KSA-001'
const PURPOSES = ['Təsisçi tərəfindən kassa artırılması', 'Bankdan nağdlaşdırma', 'Digər daxilolma']

// "Mədaxil et": adds money to a cash register (an income transaction), e.g. so it can pay expenses.
export function DepositModal({ onClose, onDone }) {
  const { cashRegisters } = useCashRegistersStore()
  const active = cashRegisters.filter((register) => register.isActive)
  const fallback = active.find((register) => register.code === DEFAULT_REGISTER_CODE) ?? active[0] ?? null
  const [form, setForm] = useState({ cashRegisterId: '', amount: '', description: PURPOSES[0] })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const cashRegisterId = form.cashRegisterId || fallback?.id || ''
  const input = cn(styles.adminInput, styles.adminDateInput)

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const amount = Number(form.amount)

    if (!cashRegisterId) {
      setError('Kassanı seçin.')
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Məbləğ 0-dan böyük olmalıdır.')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      await depositCash({ cashRegisterId, amount, description: form.description.trim() })
      onDone({ register: active.find((register) => register.id === cashRegisterId), amount })
    } catch (submitError) {
      setError(submitError.message)
      setSubmitting(false)
    }
  }

  return (
    <AdminModal title="Kassaya mədaxil" labelId="deposit-title" width="narrow" onClose={onClose}>
      <form className={styles.adminForm} onSubmit={handleSubmit}>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Kassa</span>
          <select className={input} value={cashRegisterId} onChange={updateField('cashRegisterId')}>
            {active.length === 0 ? <option value="">Kassa yoxdur</option> : null}
            {active.map((register) => (
              <option key={register.id} value={register.id}>
                {register.name} · {formatAzn(register.balance)}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Məbləğ (₼)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className={styles.adminInput}
            value={form.amount}
            onChange={updateField('amount')}
            placeholder="0.00"
            required
            autoFocus
          />
        </label>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Təyinat / təsvir</span>
          <input
            className={styles.adminInput}
            value={form.description}
            onChange={updateField('description')}
            list="deposit-purposes"
            maxLength={500}
            placeholder="Məs.: Bankdan nağdlaşdırma"
          />
          <datalist id="deposit-purposes">
            {PURPOSES.map((purpose) => (
              <option key={purpose} value={purpose} />
            ))}
          </datalist>
        </label>
        <p className={styles.adminFormHint}>
          Məbləğ kassanın balansına əlavə olunur və mədaxil əməliyyatı kimi qeyd edilir. Satış gəliri deyil: mənfəət/zərər
          hesabatına düşmür.
        </p>

        {error ? <p className={styles.adminFormError}>{error}</p> : null}

        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose}>
            Ləğv et
          </button>
          <button type="submit" className={styles.adminButtonPrimary} disabled={submitting}>
            {submitting ? 'Yadda saxlanılır…' : 'Mədaxil et'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
