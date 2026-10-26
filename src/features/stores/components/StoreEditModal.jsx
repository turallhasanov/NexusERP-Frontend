import { useState } from 'react'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { useWarehouses } from '@/features/inventory/api/use-warehouses'
import { updateStore } from '@/features/stores/api/manage-store'
import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

export function StoreEditModal({ store, onClose, onSaved }) {
  const { warehouses } = useWarehouses()
  const [form, setForm] = useState({ name: store.name, warehouseId: store.warehouseId, address: store.address ?? '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // The list holds active warehouses only; a store on one closed since keeps it as an option.
  const options =
    store.warehouse && !warehouses.some((warehouse) => warehouse.id === store.warehouseId)
      ? [store.warehouse, ...warehouses]
      : warehouses

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      onSaved(await updateStore(store.id, { ...form, name: form.name.trim(), address: form.address.trim() }))
    } catch (submitError) {
      setError(submitError.message)
      setSubmitting(false)
    }
  }

  return (
    <AdminModal title={`Mağazanı redaktə et · ${store.code}`} labelId="store-edit-title" width="narrow" onClose={onClose}>
      <form className={styles.adminForm} onSubmit={handleSubmit}>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Mağaza adı</span>
          <input className={styles.adminInput} value={form.name} onChange={updateField('name')} required maxLength={200} autoFocus />
        </label>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Anbar (təchizat)</span>
          <select className={cn(styles.adminInput, styles.adminDateInput)} value={form.warehouseId} onChange={updateField('warehouseId')}>
            {options.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Ünvan</span>
          <input className={styles.adminInput} value={form.address} onChange={updateField('address')} maxLength={500} />
        </label>
        <p className={styles.adminFormHint}>Anbar dəyişikliyi yeni satışlara aiddir; keçmiş sənədlər öz anbarında qalır.</p>

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
