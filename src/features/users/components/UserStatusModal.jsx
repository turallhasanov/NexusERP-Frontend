import { AdminModal } from '@/features/admin/components/AdminUi'
import { styles } from '@/lib/styles'

// Asks before PATCH /api/users/{id}/status; the caller runs the request and closes the dialog.
export function UserStatusModal({ user, saving, onConfirm, onClose }) {
  const deactivating = user.isActive

  return (
    <AdminModal
      title={deactivating ? 'İstifadəçini deaktiv et' : 'İstifadəçini aktivləşdir'}
      labelId="user-status-title"
      width="narrow"
      onClose={onClose}
    >
      <div className={styles.adminForm}>
        <p className={styles.adminPageDescription}>
          {deactivating
            ? `${user.name} (${user.email}) hesabını deaktiv etmək istədiyinizdən əminsiniz?`
            : `${user.name} (${user.email}) hesabını yenidən aktivləşdirmək istəyirsiniz?`}
        </p>
        <p className={styles.adminFormHint}>
          {deactivating
            ? 'İstifadəçi sistemə daxil ola bilməyəcək və hazırkı sessiyası növbəti sorğuda bağlanacaq. Məlumatları silinmir.'
            : 'İstifadəçi yenidən daxil ola biləcək.'}
        </p>
        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose} disabled={saving}>
            Ləğv et
          </button>
          <button type="button" className={styles.adminButtonPrimary} onClick={onConfirm} disabled={saving}>
            {saving ? 'Saxlanılır…' : deactivating ? 'Bəli, deaktiv et' : 'Bəli, aktivləşdir'}
          </button>
        </div>
      </div>
    </AdminModal>
  )
}
