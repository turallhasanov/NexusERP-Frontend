import { useState } from 'react'
import { createTenantUser } from '@/features/admin/api/admin-api'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { styles } from '@/lib/styles'
import { ROLE_IT_ADMIN, ROLE_STAFF } from '@/types/auth'

const ROLES = [
  { id: ROLE_IT_ADMIN, label: 'İT İdarəçisi / IT Admin' },
  { id: ROLE_STAFF, label: 'İşçi / Staff' },
]

const EMPTY_FORM = { fullName: '', email: '', password: '', role: ROLE_STAFF }

// New account inside an existing company. The server validates everything; its message is shown as is.
export function CreateTenantUserModal({ tenant, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function field(key) {
    return {
      value: form[key],
      onChange: (event) => setForm((current) => ({ ...current, [key]: event.target.value })),
      className: styles.adminInput,
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const user = await createTenantUser(tenant.id, form)
      onCreated(user)
    } catch (submitError) {
      setError(submitError.message)
      setSubmitting(false)
    }
  }

  return (
    <AdminModal title="Yeni istifadəçi əlavə et" labelId="create-tenant-user-title" width="narrow" onClose={onClose}>
      <form className={styles.adminForm} onSubmit={handleSubmit}>
        <p className={styles.adminFormSection}>Şirkət: {tenant.name}</p>
        <div className={styles.adminFormGrid}>
          <label className={`${styles.adminField} sm:col-span-2`}>
            <span className={styles.adminFieldLabel}>Ad və Soyad</span>
            <input {...field('fullName')} autoFocus required maxLength={150} autoComplete="off" />
          </label>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>E-poçt</span>
            <input {...field('email')} type="email" required maxLength={150} autoComplete="off" />
          </label>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Rol</span>
            <select {...field('role')}>
              {ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          <label className={`${styles.adminField} sm:col-span-2`}>
            <span className={styles.adminFieldLabel}>Müvəqqəti şifrə</span>
            <input {...field('password')} type="password" required autoComplete="new-password" />
            <span className={styles.adminFormHint}>
              Ən azı 6 simvol, bir hərf və bir rəqəm. Hesab təsdiqlənmiş yaradılır; şifrəni istifadəçiyə təhlükəsiz yolla
              çatdırın.
            </span>
          </label>
        </div>

        {error ? <p className={styles.adminFormError}>{error}</p> : null}

        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose}>
            Ləğv et
          </button>
          <button type="submit" className={styles.adminButtonPrimary} disabled={submitting}>
            {submitting ? 'Əlavə edilir…' : 'Əlavə et'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
