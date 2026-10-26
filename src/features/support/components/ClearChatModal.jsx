import { useState } from 'react'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { styles } from '@/lib/styles'

// Confirms "Söhbəti təmizlə"; `onConfirm` runs the request and returns true when it worked.
export function ClearChatModal({ onClose, onConfirm }) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleConfirm() {
    setError('')
    setSubmitting(true)

    try {
      await onConfirm()
    } catch (clearError) {
      setError(clearError.message)
      setSubmitting(false)
    }
  }

  return (
    <AdminModal title="Söhbəti təmizlə" labelId="clear-chat-title" width="narrow" onClose={submitting ? () => {} : onClose}>
      <div className={styles.adminForm}>
        <p className="text-sm leading-relaxed text-slate-300">
          Söhbət tarixçəsini ekranınızdan təmizləmək istədiyinizdən əminsiniz?
        </p>
        <p className={styles.adminFormHint}>
          Yalnız sizin görünüşünüz təmizlənir: mesajlar silinmir, qarşı tərəf və dəstək tarixçəsi onları görməyə davam edir.
          Yeni mesajlar yenə burada görünəcək.
        </p>

        {error ? <p className={styles.adminFormError}>{error}</p> : null}

        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose} disabled={submitting}>
            Ləğv et
          </button>
          <button type="button" className={styles.adminButtonDanger} onClick={handleConfirm} disabled={submitting}>
            {submitting ? 'Təmizlənir…' : 'Təmizlə'}
          </button>
        </div>
      </div>
    </AdminModal>
  )
}
