import { useState } from 'react'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { createWarehouse, updateWarehouse } from '@/features/warehouses/api/warehouses-api'
import { styles } from '@/lib/styles'

// Creates a warehouse, or edits `warehouse` when one is given. The server validates; its message is shown as is.
export function WarehouseFormModal({ warehouse, onClose, onSaved }) {
  const isEdit = Boolean(warehouse)
  const [form, setForm] = useState({
    name: warehouse?.name ?? '',
    address: warehouse?.address ?? '',
    responsiblePerson: warehouse?.responsiblePerson ?? '',
    capacity: warehouse?.capacity ?? '',
  })
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
      const saved = isEdit ? await updateWarehouse(warehouse.id, form) : await createWarehouse(form)
      onSaved(saved)
    } catch (submitError) {
      setError(submitError.message)
      setSubmitting(false)
    }
  }

  return (
    <AdminModal
      title={isEdit ? 'Anbarı redaktə et' : 'Yeni anbar yarat'}
      labelId="warehouse-form-title"
      width="narrow"
      onClose={onClose}
    >
      <form className={styles.adminForm} onSubmit={handleSubmit}>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Anbarın adı</span>
          <input
            className={styles.adminInput}
            value={form.name}
            onChange={updateField('name')}
            placeholder="Mərkəzi anbar"
            autoFocus
            required
            maxLength={200}
            autoComplete="off"
          />
        </label>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Ünvan</span>
          <input
            className={styles.adminInput}
            value={form.address}
            onChange={updateField('address')}
            placeholder="Bakı, Nərimanov r."
            maxLength={500}
            autoComplete="off"
          />
        </label>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Məsul şəxs</span>
          <input
            className={styles.adminInput}
            value={form.responsiblePerson}
            onChange={updateField('responsiblePerson')}
            placeholder="Anbardarın adı və soyadı"
            maxLength={200}
            autoComplete="off"
          />
        </label>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Tutum (vahid)</span>
          <input
            className={styles.adminInput}
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={form.capacity}
            onChange={updateField('capacity')}
            placeholder="Məs.: 10000"
          />
        </label>
        <p className={styles.adminFormHint}>
          Tutum məlumat xarakterlidir: doluluq faizini göstərir, mal qəbulunu məhdudlaşdırmır.
        </p>

        {error ? <p className={styles.adminFormError}>{error}</p> : null}

        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose}>
            Ləğv et
          </button>
          <button type="submit" className={styles.adminButtonPrimary} disabled={submitting}>
            {submitting ? 'Yadda saxlanılır…' : isEdit ? 'Yadda saxla' : 'Anbarı yarat'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
