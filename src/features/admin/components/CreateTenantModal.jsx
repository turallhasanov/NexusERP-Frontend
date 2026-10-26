import { useState } from 'react'
import { createTenant } from '@/features/admin/api/admin-api'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { styles } from '@/lib/styles'
import { COMPANY_ROLE_OPTIONS, ROLE_IT_ADMIN, ROLE_STAFF } from '@/types/auth'

const EMPTY_FORM = { name: '', voen: '', adminName: '', adminEmail: '', adminPassword: '', adminRole: ROLE_IT_ADMIN }

// The first user must be able to manage the company, so staff is not offered; IT admin is the default.
const FIRST_USER_ROLES = COMPANY_ROLE_OPTIONS.filter((role) => role.id !== ROLE_STAFF).sort(
  (a, b) => (b.id === ROLE_IT_ADMIN) - (a.id === ROLE_IT_ADMIN),
)

// New company with its first admin. The server validates everything; its message is shown as is.
export function CreateTenantModal({ onClose, onCreated }) {
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
      const result = await createTenant({
        name: form.name,
        voen: form.voen,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
        adminRole: form.adminRole,
      })
      onCreated(result)
    } catch (submitError) {
      setError(submitError.message)
      setSubmitting(false)
    }
  }

  return (
    <AdminModal title="Yeni şirkət" labelId="create-tenant-title" width="narrow" onClose={onClose}>
      <form className={styles.adminForm} onSubmit={handleSubmit}>
        <p className={styles.adminFormSection}>Şirkət</p>
        <div className={styles.adminFormGrid}>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Şirkət adı</span>
            <input {...field('name')} autoFocus required maxLength={200} />
          </label>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>VÖEN (könüllü)</span>
            <input {...field('voen')} maxLength={50} />
          </label>
        </div>

        <p className={styles.adminFormSection}>Şirkət administratoru</p>
        <div className={styles.adminFormGrid}>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Ad Soyad</span>
            <input {...field('adminName')} required maxLength={150} autoComplete="off" />
          </label>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>E-poçt</span>
            <input {...field('adminEmail')} type="email" required maxLength={150} autoComplete="off" />
          </label>
          <label className={`${styles.adminField} sm:col-span-2`}>
            <span className={styles.adminFieldLabel}>Rol</span>
            <select {...field('adminRole')}>
              {FIRST_USER_ROLES.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.label}
                </option>
              ))}
            </select>
          </label>
          <label className={`${styles.adminField} sm:col-span-2`}>
            <span className={styles.adminFieldLabel}>İlkin şifrə</span>
            <input {...field('adminPassword')} type="password" required autoComplete="new-password" />
            <span className={styles.adminFormHint}>
              Ən azı 6 simvol, bir hərf və bir rəqəm. Hesab təsdiqlənmiş yaradılır; şifrəni administratora təhlükəsiz
              yolla çatdırın.
            </span>
          </label>
        </div>

        {error ? <p className={styles.adminFormError}>{error}</p> : null}

        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose}>
            Ləğv et
          </button>
          <button type="submit" className={styles.adminButtonPrimary} disabled={submitting}>
            {submitting ? 'Yaradılır…' : 'Şirkəti yarat'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
