import { useState } from 'react'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { deleteEmployee } from '@/features/hr/api/employees-api'
import { styles } from '@/lib/styles'

// Asks before DELETE /api/employees/{id} (IT admins only); nothing is sent until "Bəli, sil".
export function DeleteEmployeeModal({ employee, onClose, onDeleted }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    setError('')
    setSubmitting(true)

    try {
      await deleteEmployee(employee.id)
      onDeleted(employee)
    } catch (deleteError) {
      setError(deleteError.message)
      setSubmitting(false)
    }
  }

  return (
    <AdminModal title="İşçini sil" labelId="delete-employee-title" width="narrow" onClose={submitting ? () => {} : onClose}>
      <div className={styles.adminForm}>
        <p className="text-sm leading-relaxed text-slate-300">
          <strong className="font-semibold text-white">{employee.name}</strong> ({employee.title}, {employee.department}) —
          işçini silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
        </p>
        <p className={styles.adminFormHint}>
          İşçinin bütün məlumatları, məzuniyyət qeydləri və işdən çıxma əmri silinir; maaşı keçmiş dövrlər daxil olmaqla
          maliyyə hesabatlarından çıxır. İşdən çıxıbsa, adətən «İşdən çıxar» kifayətdir: tarixçə saxlanılır.
        </p>

        {error ? <p className={styles.adminFormError}>{error}</p> : null}

        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose} disabled={submitting}>
            Ləğv et
          </button>
          <button type="button" className={styles.adminButtonDanger} onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Silinir…' : 'Bəli, sil'}
          </button>
        </div>
      </div>
    </AdminModal>
  )
}
