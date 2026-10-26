import { AdminModal } from '@/features/admin/components/AdminUi'
import { styles } from '@/lib/styles'

// Asks before DELETE /api/products/{id}; the caller runs the request and closes the dialog.
export function DeleteProductModal({ product, deleting, onConfirm, onClose }) {
  return (
    <AdminModal title="Məhsulu sil" labelId="delete-product-title" width="narrow" onClose={onClose}>
      <div className={styles.adminForm}>
        <p className={styles.adminPageDescription}>
          Bu məhsulu silmək istədiyinizdən əminsiniz?
          <br />
          <span className="text-slate-200">
            {product.name} ({product.sku})
          </span>
        </p>
        <p className={styles.adminFormHint}>
          Məhsula bağlı alış və ya satış sənədi varsa, o silinmir, deaktiv edilir: sənədlərdə qalır, kataloqda
          görünmür.
        </p>
        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose} disabled={deleting}>
            Ləğv et
          </button>
          <button type="button" className={styles.adminButtonPrimary} onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Silinir…' : 'Bəli, sil'}
          </button>
        </div>
      </div>
    </AdminModal>
  )
}
