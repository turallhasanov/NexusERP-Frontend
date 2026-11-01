import { AdminModal } from '@/features/admin/components/AdminUi'
import { styles } from '@/lib/styles'

// Asks before POST /api/nexuserp/reset-stock; the caller runs the request and closes the dialog.
export function ResetStockModal({ resetting, onConfirm, onClose }) {
  return (
    <AdminModal title="Stok qalığını sil" labelId="reset-stock-title" width="narrow" onClose={onClose}>
      <div className={styles.adminForm}>
        <p className={styles.adminPageDescription}>
          Bütün anbar stok qalıqlarını sıfırlamaq istədiyinizdən əminsiniz?
        </p>
        <p className={styles.adminFormHint}>
          Bütün anbarlarda hər məhsulun qalığı 0 olacaq. Məhsullar və sənədlər silinmir, amma bu əməliyyat geri
          qaytarıla bilməz.
        </p>
        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose} disabled={resetting}>
            Ləğv et
          </button>
          <button type="button" className={styles.adminButtonPrimary} onClick={onConfirm} disabled={resetting}>
            {resetting ? 'Sıfırlanır…' : 'Bəli, sıfırla'}
          </button>
        </div>
      </div>
    </AdminModal>
  )
}
