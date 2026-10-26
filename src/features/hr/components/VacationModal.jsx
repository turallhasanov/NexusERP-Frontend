import { useState } from 'react'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { sendOnVacation } from '@/features/hr/api/employees-api'
import { daysInclusive, LEAVE_TYPES } from '@/features/hr/lib/hr-options'
import { cn } from '@/lib/cn'
import { toDateInput } from '@/lib/date'
import { styles } from '@/lib/styles'

// Sends `employee` on leave, or changes the dates of a leave in progress. The server validates the dates.
export function VacationModal({ employee, onClose, onSaved }) {
  const isChange = employee.status === 'leave'
  const [form, setForm] = useState({
    startDate: (isChange && employee.vacationStartDate) || toDateInput(),
    endDate: (isChange && employee.vacationEndDate) || '',
    leaveType: (isChange && employee.leaveType) || 'annual',
    note: (isChange && employee.vacationNote) || '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const days = daysInclusive(form.startDate, form.endDate)

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      onSaved(await sendOnVacation(employee.id, form))
    } catch (submitError) {
      setError(submitError.message)
      setSubmitting(false)
    }
  }

  return (
    <AdminModal
      title={isChange ? 'Məzuniyyəti dəyiş' : 'Məzuniyyətə göndər'}
      labelId="vacation-title"
      width="narrow"
      onClose={onClose}
      header={<p className={styles.adminPageDescription}>{`${employee.name} · ${employee.title}`}</p>}
    >
      <form className={styles.adminForm} onSubmit={handleSubmit}>
        <div className={styles.hrDateGrid}>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Başlanğıc tarixi</span>
            <input
              type="date"
              className={cn(styles.adminInput, styles.adminDateInput)}
              value={form.startDate}
              min={employee.hiredAt}
              onChange={updateField('startDate')}
              required
            />
          </label>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Bitmə tarixi</span>
            <input
              type="date"
              className={cn(styles.adminInput, styles.adminDateInput)}
              value={form.endDate}
              min={form.startDate || undefined}
              onChange={updateField('endDate')}
              required
            />
          </label>
        </div>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Məzuniyyət növü</span>
          <select className={cn(styles.adminInput, styles.adminDateInput)} value={form.leaveType} onChange={updateField('leaveType')}>
            {LEAVE_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Qeyd</span>
          <textarea
            className={styles.adminInput}
            value={form.note}
            onChange={updateField('note')}
            placeholder="Məs.: 2026-cı il üzrə illik məzuniyyətin birinci hissəsi"
            rows={2}
            maxLength={500}
          />
        </label>
        <p className={styles.adminFormHint}>
          {days > 0 ? `Cəmi ${days} təqvim günü. ` : ''}
          Bitmə tarixindən sonra işçi avtomatik «Aktiv» olur; daha tez qayıtsa, «İşə qayıtdı» düyməsini basın.
        </p>

        {error ? <p className={styles.adminFormError}>{error}</p> : null}

        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose}>
            Ləğv et
          </button>
          <button type="submit" className={styles.adminButtonPrimary} disabled={submitting}>
            {submitting ? 'Yadda saxlanılır…' : isChange ? 'Yadda saxla' : 'Məzuniyyətə göndər'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
