import { useState } from 'react'
import { updateTenantStatus } from '@/features/admin/api/admin-api'
import { TENANT_STATUSES, tenantStatus } from '@/features/admin/lib/tenant-status'
import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'
import { showToast } from '@/store/toast-store'

const selectTones = {
  success: styles.adminBadgeSuccess,
  muted: styles.adminBadgeMuted,
  warning: styles.adminBadgeWarning,
  danger: styles.adminBadgeDanger,
}

// Status picker for one tenant. Passive and suspended sign the company's users out, so they ask first.
export function TenantStatusControl({ tenant, onChanged }) {
  const [pending, setPending] = useState(null)
  const [saving, setSaving] = useState(false)
  const current = tenantStatus(tenant.status)

  async function save(next) {
    setSaving(true)

    try {
      const updated = await updateTenantStatus(tenant.id, next)
      showToast(`«${updated.name}»: status «${tenantStatus(updated.status).label}» oldu.`)
      onChanged?.(updated)
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setSaving(false)
      setPending(null)
    }
  }

  function handleChange(event) {
    const next = event.target.value

    if (next === tenant.status) {
      return
    }

    if (tenantStatus(next).confirm) {
      setPending(next)
      return
    }

    void save(next)
  }

  if (pending) {
    return (
      <div className={styles.adminConfirm}>
        <span className={styles.adminConfirmText}>{tenantStatus(pending).confirm}</span>
        <button type="button" className={styles.adminButtonSmall} disabled={saving} onClick={() => save(pending)}>
          {saving ? 'Saxlanılır…' : 'Təsdiqlə'}
        </button>
        <button type="button" className={styles.adminButtonSmall} disabled={saving} onClick={() => setPending(null)}>
          Ləğv et
        </button>
      </div>
    )
  }

  return (
    <select
      aria-label={`«${tenant.name}» statusu`}
      className={cn(styles.adminSelect, selectTones[current.tone])}
      value={tenant.status}
      disabled={saving}
      onChange={handleChange}
    >
      {TENANT_STATUSES.map((status) => (
        <option key={status.id} value={status.id}>
          {status.label}
        </option>
      ))}
    </select>
  )
}
