import { useState } from 'react'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { terminateEmployee } from '@/features/hr/api/employees-api'
import { OTHER_REASON, TERMINATION_REASONS } from '@/features/hr/lib/hr-options'
import { cn } from '@/lib/cn'
import { toDateInput } from '@/lib/date'
import { styles } from '@/lib/styles'

// Asks for the date and reason before POST /api/employees/{id}/terminate; nothing is sent until confirmed.
export function TerminateModal({ employee, onClose, onTerminated }) {
  const [terminationDate, setTerminationDate] = useState(toDateInput())
  const [choice, setChoice] = useState(TERMINATION_REASONS[0])
  const [customReason, setCustomReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const reason = choice === OTHER_REASON ? customReason.trim() : choice

    if (!reason) {
      setError('İşdən çıxma səbəbini yazın.')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      onTerminated(await terminateEmployee(employee.id, { terminationDate, reason }))
    } catch (submitError) {
      setError(submitError.message)
      setSubmitting(false)
    }
  }

  return (
    <AdminModal
      title="İşdən çıxar"
      labelId="terminate-title"
      width="narrow"
      onClose={submitting ? () => {} : onClose}
      header={<p className={styles.adminPageDescription}>{`${employee.name} · ${employee.title}, ${employee.department}`}</p>}
    >
      <form className={styles.adminForm} onSubmit={handleSubmit}>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>İşdən çıxma tarixi</span>
          <input
            type="date"
            className={cn(styles.adminInput, styles.adminDateInput)}
            value={terminationDate}
            min={employee.hiredAt}
            onChange={(event) => setTerminationDate(event.target.value)}
            required
          />
        </label>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>İşdən çıxma səbəbi</span>
          <select
            className={cn(styles.adminInput, styles.adminDateInput)}
            value={choice}
            onChange={(event) => setChoice(event.target.value)}
          >
            {TERMINATION_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
            <option value={OTHER_REASON}>Digər (sərbəst mətn)</option>
          </select>
        </label>
        {choice === OTHER_REASON ? (
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Səbəb</span>
            <textarea
              className={styles.adminInput}
              value={customReason}
              onChange={(event) => setCustomReason(event.target.value)}
              placeholder="İşdən çıxma səbəbini yazın"
              rows={3}
              maxLength={500}
              autoFocus
            />
          </label>
        ) : null}
        <p className={styles.adminFormHint}>
          İşçinin statusu «İşdən çıxıb» olacaq və nömrəli işdən çıxma əmri yaradılacaq. Bu əməliyyat geri qaytarılmır.
        </p>

        {error ? <p className={styles.adminFormError}>{error}</p> : null}

        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose} disabled={submitting}>
            Ləğv et
          </button>
          <button type="submit" className={styles.adminButtonDanger} disabled={submitting}>
            {submitting ? 'Yadda saxlanılır…' : 'İşdən çıxar'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
