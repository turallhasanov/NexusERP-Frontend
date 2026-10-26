import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createProduct } from '@/features/products/api/create-product'
import { generateBarcode } from '@/features/products/api/generate-barcode'
import { useProductTypes } from '@/features/products/api/use-product-types'
import { useProductUnits } from '@/features/products/api/use-product-units'
import { styles } from '@/lib/styles'
import { showToast } from '@/store/toast-store'

const EMPTY_FORM = {
  name: '',
  barcode: '',
  categoryId: '',
  unitId: '',
  purchasePrice: '',
  salePrice: '',
}

export function ProductForm({ onCreated }) {
  const { types, isLoading: typesLoading } = useProductTypes()
  const { units, isLoading: unitsLoading } = useProductUnits()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [generating, setGenerating] = useState(false)

  function updateField(field) {
    return (event) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }
  }

  async function handleGenerateBarcode() {
    setError('')
    setGenerating(true)

    const result = await generateBarcode()

    setGenerating(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setForm((current) => ({ ...current, barcode: result.barcode }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const result = await createProduct(form)

    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setForm(EMPTY_FORM)
    showToast(`Məhsul yaradıldı: ${result.product.sku} · ${result.product.name}`)
    onCreated?.(result.product)
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Field label="Ad">
            <Input value={form.name} onChange={updateField('name')} placeholder="Məhsul adı" />
          </Field>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Barkod</span>
            <div className={styles.inlineField}>
              <Input
                className="flex-1"
                value={form.barcode}
                onChange={updateField('barcode')}
                placeholder="Boş qalsa, avtomatik yaradılır"
              />
              <button
                type="button"
                className={styles.buttonSecondary}
                onClick={handleGenerateBarcode}
                disabled={generating}
              >
                {generating ? 'Yaradılır…' : 'EAN-13 yarat'}
              </button>
            </div>
          </label>
          <Field label="Kateqoriya">
            <select className={styles.input} value={form.categoryId} onChange={updateField('categoryId')}>
              <option value="">{typesLoading ? 'Yüklənir…' : 'Kateqoriya seçin'}</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Vahid">
            <select className={styles.input} value={form.unitId} onChange={updateField('unitId')}>
              <option value="">{unitsLoading ? 'Yüklənir…' : 'Vahidi seçin'}</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Alış qiyməti (₼, istəyə bağlı)">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.purchasePrice}
              onChange={updateField('purchasePrice')}
              placeholder="Boş qala bilər"
            />
            <span className={styles.fieldHint}>
              Alış qiyməti alış sənədi (qaimə) əlavə edildikdə avtomatik yenilənəcəkdir.
            </span>
          </Field>
          <Field label="Satış qiyməti (₼)">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.salePrice}
              onChange={updateField('salePrice')}
              placeholder="0.00"
            />
          </Field>
        </div>
        <p className={styles.fieldHint}>Məhsul kodu (MHS-001, …) avtomatik verilir.</p>
        {error ? <p className={styles.formError}>{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Yadda saxlanılır…' : 'Məhsulu yadda saxla'}
        </Button>
      </form>
    </Card>
  )
}
