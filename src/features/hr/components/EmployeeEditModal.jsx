import { useState } from 'react'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { updateEmployee } from '@/features/hr/api/employees-api'
import { DEPARTMENTS } from '@/features/hr/lib/hr-options'
import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'
import { useStoresStore } from '@/store/stores-store'

// Corrects an employee's profile, including the store whose profit the salary counts toward. The server validates.
export function EmployeeEditModal({ employee, onClose, onSaved }) {
  const { stores } = useStoresStore()
  const [form, setForm] = useState({
    name: employee.name,
    title: employee.title,
    department: employee.department,
    hiredAt: employee.hiredAt,
    salary: String(employee.salary),
    storeId: employee.storeId ?? '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const departments = DEPARTMENTS.includes(employee.department) ? DEPARTMENTS : [employee.department, ...DEPARTMENTS]
  // A store closed since stays selectable for the employee already in it.
  const storeOptions = stores.filter((store) => store.isActive !== false || store.id === employee.storeId)
  const input = cn(styles.adminInput, styles.adminDateInput)

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      onSaved(await updateEmployee(employee.id, { ...form, name: form.name.trim(), title: form.title.trim(), salary: Number(form.salary) }))
    } catch (submitError) {
      setError(submitError.message)
      setSubmitting(false)
    }
  }

  return (
    <AdminModal title="İşçini redaktə et" labelId="employee-edit-title" width="narrow" onClose={onClose}>
      <form className={styles.adminForm} onSubmit={handleSubmit}>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Ad və soyad</span>
          <input className={styles.adminInput} value={form.name} onChange={updateField('name')} required maxLength={200} autoFocus />
        </label>
        <div className={styles.hrDateGrid}>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Vəzifə</span>
            <input className={styles.adminInput} value={form.title} onChange={updateField('title')} required maxLength={100} />
          </label>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Şöbə</span>
            <select className={input} value={form.department} onChange={updateField('department')}>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>İşə qəbul</span>
            <input type="date" className={input} value={form.hiredAt} onChange={updateField('hiredAt')} required />
          </label>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Maaş (₼)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className={styles.adminInput}
              value={form.salary}
              onChange={updateField('salary')}
              required
            />
          </label>
        </div>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Mağaza</span>
          <select className={input} value={form.storeId} onChange={updateField('storeId')}>
            <option value="">Ümumi (ofis, rəhbərlik)</option>
            {storeOptions.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </label>
        <p className={styles.adminFormHint}>
          Maaş seçilmiş mağazanın mənfəət/zərər hesabına düşür. Status, məzuniyyət və işdən çıxma öz düymələri ilə dəyişir.
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
