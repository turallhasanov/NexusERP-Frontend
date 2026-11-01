import { useState } from 'react'
import { AdminModal } from '@/features/admin/components/AdminUi'
import { updateProduct } from '@/features/products/api/update-product'
import { ProductImageField } from '@/features/products/components/ProductImageField'
import { ProductVariantFields } from '@/features/products/components/ProductVariantFields'
import { useProductTypes } from '@/features/products/api/use-product-types'
import { useProductUnits } from '@/features/products/api/use-product-units'
import { parseProductName } from '@/lib/product-name'
import { styles } from '@/lib/styles'
import { showToast } from '@/store/toast-store'

// "Düzəliş et": PUT /api/products/{id}. The barcode is shown but cannot change (it is the product's SKU in the Khazar store).
export function EditProductModal({ product, onClose, onSaved }) {
  const { types, isLoading: typesLoading } = useProductTypes()
  const { units, isLoading: unitsLoading } = useProductUnits()
  // The saved name may already be "Name (Color / Size)"; the form edits its parts, so saving does not add a second suffix.
  const [form, setForm] = useState(() => ({
    ...parseProductName(product.name),
    categoryId: product.typeId,
    unitId: product.unitId,
    purchasePrice: String(product.purchasePrice ?? ''),
    salePrice: String(product.unitPrice ?? ''),
    showOnWebsite: Boolean(product.showOnWebsite),
  }))
  const [image, setImage] = useState(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(field) {
    return (event) => setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const result = await updateProduct(product.id, { ...form, image, removeImage })

    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    const saved = `Məhsul yeniləndi: ${product.sku} · ${result.product.name}`

    // A failed push leaves the change saved here; the message says so, and saving again retries the push.
    if (result.storefront.status === 'synced') {
      showToast(`${saved}. Khazar saytı yeniləndi.`)
    } else if (result.storefront.status === 'hidden') {
      showToast(`${saved}. Khazar saytından gizlədildi.`)
    } else if (result.storefront.status === 'failed') {
      showToast(`${saved}. Amma Khazar saytı yenilənmədi: ${result.storefront.message}`, 'error')
    } else {
      showToast(saved)
    }

    onSaved?.(result.product)
    onClose()
  }

  return (
    <AdminModal title="Məhsula düzəliş" labelId="edit-product-title" width="narrow" onClose={onClose}>
      <form className={styles.adminForm} onSubmit={handleSubmit}>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Ad</span>
          <input
            className={styles.adminInput}
            value={form.name}
            onChange={updateField('name')}
            required
            maxLength={200}
            autoFocus
            autoComplete="off"
          />
        </label>
        <ProductVariantFields
          theme="admin"
          name={form.name}
          color={form.color}
          size={form.size}
          onColorChange={(color) => setForm((current) => ({ ...current, color }))}
          onSizeChange={(size) => setForm((current) => ({ ...current, size }))}
        />
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Barkod (dəyişmir)</span>
          <input className={`${styles.adminInput} opacity-60`} value={product.barcode} readOnly tabIndex={-1} />
        </label>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Kateqoriya</span>
          <select className={`${styles.adminInput} [&>option]:text-neutral-900`} value={form.categoryId} onChange={updateField('categoryId')}>
            <option value="">{typesLoading ? 'Yüklənir…' : 'Kateqoriya seçin'}</option>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.adminField}>
          <span className={styles.adminFieldLabel}>Vahid</span>
          <select className={`${styles.adminInput} [&>option]:text-neutral-900`} value={form.unitId} onChange={updateField('unitId')}>
            <option value="">{unitsLoading ? 'Yüklənir…' : 'Vahidi seçin'}</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Alış qiyməti (₼)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className={styles.adminInput}
              value={form.purchasePrice}
              onChange={updateField('purchasePrice')}
            />
          </label>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Satış qiyməti (₼)</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className={styles.adminInput}
              value={form.salePrice}
              onChange={updateField('salePrice')}
              required
            />
          </label>
        </div>

        <ProductImageField
          inputId="edit-product-image"
          theme="admin"
          file={image}
          onFileChange={setImage}
          onError={setError}
          currentUrl={product.imageUrl}
          removeCurrent={removeImage}
          onRemoveCurrentChange={setRemoveImage}
        />

        <div>
          <div className="flex items-center gap-2">
            <input
              id="edit-show-on-website"
              type="checkbox"
              checked={form.showOnWebsite}
              onChange={(event) => setForm((current) => ({ ...current, showOnWebsite: event.target.checked }))}
            />
            <label htmlFor="edit-show-on-website" className="cursor-pointer text-sm font-medium text-slate-200">
              Khazar Storefront-da göstər
            </label>
          </div>
          <p className={`${styles.adminFormHint} mt-1`}>
            Yadda saxlayanda dəyişikliklər (və yeni şəkil) Khazar saytının kataloquna göndərilir. İşarəni götürsəniz, məhsul
            saytdan gizlədilir.
          </p>
        </div>

        {error ? <p className={styles.adminFormError}>{error}</p> : null}

        <div className={styles.adminModalActions}>
          <button type="button" className={styles.adminButtonGhost} onClick={onClose} disabled={submitting}>
            Ləğv et
          </button>
          <button type="submit" className={styles.adminButtonPrimary} disabled={submitting}>
            {submitting ? 'Yadda saxlanılır…' : 'Yadda saxla'}
          </button>
        </div>
      </form>
    </AdminModal>
  )
}
