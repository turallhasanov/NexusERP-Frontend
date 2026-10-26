import { useState } from 'react'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { createRole, updateRole } from '@/features/roles/api/roles-api'
import { PERMISSION_OPTIONS } from '@/features/roles/permissions'
import { styles } from '@/lib/styles'

// Creates a role, or edits `role` when one is given. The server validates; its message is shown as is.
export function RoleFormModal({ role, onClose, onSaved }) {
  const isEdit = Boolean(role)
  const [form, setForm] = useState({
    name: role?.name ?? '',
    description: role?.description ?? '',
    permissions: role?.permissions ?? [],
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function togglePermission(id) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(id)
        ? current.permissions.filter((permission) => permission !== id)
        : [...current.permissions, id],
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const saved = isEdit ? await updateRole(role.id, form) : await createRole(form)
      onSaved(saved)
    } catch (submitError) {
      setError(submitError.message)
      setSubmitting(false)
    }
  }

  return (
    <AdminModal
      title={isEdit ? 'Rolu redaktə et' : 'Yeni rol yarat'}
      labelId="role-form-title"
      width="narrow"
      onClose={onClose}
    >
      <form className={styles.adminForm} onSubmit={handleSubmit}>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Rolun adı</span>
          <input
            className={styles.adminInput}
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Anbardar, Maliyyəçi, Satış Meneceri"
            autoFocus
            required
            maxLength={100}
            autoComplete="off"
          />
        </label>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Təsviri</span>
          <textarea
            className={styles.adminInput}
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Bu rolun vəzifə və məsuliyyətləri"
            rows={3}
            maxLength={500}
          />
        </label>
        <fieldset className="space-y-2">
          <legend className={styles.adminFieldLabel}>İcazələr (modullar)</legend>
          <div className={styles.roleCheckGrid}>
            {PERMISSION_OPTIONS.map((option) => (
              <label key={option.id} className={styles.roleCheck}>
                <input
                  type="checkbox"
                  className={styles.roleCheckInput}
                  checked={form.permissions.includes(option.id)}
                  onChange={() => togglePermission(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
          <p className={styles.adminFormHint}>
            İcazələr rolun hansı modullar üçün nəzərdə tutulduğunu qeyd edir. Sistemə giriş hüquqlarını hələlik
            istifadəçinin giriş səviyyəsi (İdarəçi, İT İdarəçisi, İşçi) müəyyən edir.
          </p>
        </fieldset>

        {error ? <p className={styles.adminFormError}>{error}</p> : null}

        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose}>
            Ləğv et
          </button>
          <button type="submit" className={styles.adminButtonPrimary} disabled={submitting}>
            {submitting ? 'Yadda saxlanılır…' : isEdit ? 'Yadda saxla' : 'Rolu yarat'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
