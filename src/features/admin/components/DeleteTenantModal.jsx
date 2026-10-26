import { useState } from 'react'
import { deleteTenant } from '@/features/admin/api/admin-api'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { styles } from '@/lib/styles'

// Asks before DELETE /api/admin/tenants/{id}; nothing is sent until "Hə, sil".
export function DeleteTenantModal({ tenant, onClose, onDeleted }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    setError('')
    setSubmitting(true)

    try {
      await deleteTenant(tenant.id)
      onDeleted(tenant)
    } catch (deleteError) {
      setError(deleteError.message)
      setSubmitting(false)
    }
  }

  return (
    <AdminModal title="Şirkəti sil" labelId="delete-tenant-title" width="narrow" onClose={submitting ? () => {} : onClose}>
      <div className={styles.adminForm}>
        <p className="text-sm leading-relaxed text-slate-300">
          <strong className="font-semibold text-white">{tenant.name}</strong> şirkətini silmək istədiyinizdən əminsiniz?
          Bu əməliyyat geri qaytarıla bilməz.
        </p>
        <p className={styles.adminFormHint}>
          Şirkətin istifadəçiləri sistemə daxil ola bilməyəcək. Sənədləri, stok və maliyyə məlumatları bütövlük üçün
          bazada saxlanılır, lakin heç yerdə göstərilmir.
        </p>

        {error ? <p className={styles.adminFormError}>{error}</p> : null}

        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose} disabled={submitting}>
            Ləğv et
          </button>
          <button type="button" className={styles.adminButtonDanger} onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Silinir…' : 'Hə, sil'}
          </button>
        </div>
      </div>
    </AdminModal>
  )
}
