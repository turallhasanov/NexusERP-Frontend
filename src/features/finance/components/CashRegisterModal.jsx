import { useState } from 'react'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { createCashRegister } from '@/features/finance/api/create-cash-register'
import { styles } from '@/lib/styles'

// Quick "+ Yeni kassa" from the expense form; the new register is handed back so the form can select it.
export function CashRegisterModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', openingBalance: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      onCreated(await createCashRegister({ name: form.name.trim(), openingBalance: form.openingBalance }))
    } catch (submitError) {
      setError(submitError.message)
      setSubmitting(false)
    }
  }

  return (
    <AdminModal title="Yeni kassa" labelId="cash-register-title" width="narrow" onClose={onClose}>
      <form className={styles.adminForm} onSubmit={handleSubmit}>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Kassa adı</span>
          <input
            className={styles.adminInput}
            value={form.name}
            onChange={updateField('name')}
            placeholder="Məs.: Bakı mağaza kassası, Kapital Bank hesabı"
            required
            maxLength={200}
            autoFocus
            autoComplete="off"
          />
        </label>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Başlanğıc qalıq (₼, istəyə bağlı)</span>
          <input
            type="number"
            min={0}
            step="0.01"
            className={styles.adminInput}
            value={form.openingBalance}
            onChange={updateField('openingBalance')}
            placeholder="0.00"
          />
        </label>
        <p className={styles.adminFormHint}>
          Xərc yalnız kassadakı vəsait qədər ödənilə bilər. Kassada artıq pul varsa, onu başlanğıc qalıq kimi yazın: mədaxil
          əməliyyatı kimi qeyd olunur.
        </p>

        {error ? <p className={styles.adminFormError}>{error}</p> : null}

        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose}>
            Ləğv et
          </button>
          <button type="submit" className={styles.adminButtonPrimary} disabled={submitting}>
            {submitting ? 'Yaradılır…' : 'Kassanı yarat'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
