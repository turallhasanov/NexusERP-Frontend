import { useState } from 'react'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { styles } from '@/lib/styles'
import { COMPANY_ROLE_OPTIONS, ROLE_STAFF } from '@/types/auth'

// «Təsdiqlə / Rol təyin et»: picks the role of a user who is waiting for approval; the caller runs POST /api/users/{id}/approve.
export function UserApproveModal({ user, saving, onConfirm, onClose }) {
  const [role, setRole] = useState(ROLE_STAFF)

  return (
    <AdminModal title="İstifadəçini təsdiqlə və rol ver" labelId="user-approve-title" width="narrow" onClose={onClose}>
      <div className={styles.adminForm}>
        <p className={styles.adminPageDescription}>
          {user.name} ({user.email}) hesabı təsdiq gözləyir. Təsdiqlənənədək şirkət məlumatlarına çıxışı yoxdur.
        </p>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Rol</span>
          <select className={styles.input} value={role} onChange={(event) => setRole(event.target.value)}>
            {COMPANY_ROLE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose} disabled={saving}>
            Ləğv et
          </button>
          <button type="button" className={styles.adminButtonPrimary} onClick={() => onConfirm(role)} disabled={saving}>
            {saving ? 'Saxlanılır…' : 'Təsdiqlə'}
          </button>
        </div>
      </div>
    </AdminModal>
  )
}
