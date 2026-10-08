import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createProduct } from '@/features/products/api/create-product'
import { useProductTypes } from '@/features/products/api/use-product-types'
import { useProductUnits } from '@/features/products/api/use-product-units'
import { styles } from '@/lib/styles'

const EMPTY_FORM = {
  name: '',
  barcode: '',
  typeId: '',
  unitId: '',
  unitPrice: '',
  quantity: 1,
  minQuantity: 1,
}

export function ProductForm() {
  const { types } = useProductTypes()
  const { units } = useProductUnits()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  function updateField(field) {
    return (event) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const name = form.name.trim()
    const barcode = form.barcode.trim()
    const typeId = form.typeId
    const unitId = form.unitId
    const unitPrice = Number(form.unitPrice)
    const quantity = Number(form.quantity)
    const minQuantity = Number(form.minQuantity)

    if (!name) {
      setError('Məhsul adı tələb olunur.')
      return
    }

    if (!barcode) {
      setError('Barkod tələb olunur.')
      return
    }

    if (!typeId) {
      setError('Məhsul tipi tələb olunur.')
      return
    }

    if (!unitId) {
      setError('Ölçü vahidi tələb olunur.')
      return
    }

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      setError('Qiymət 0-dan böyük olmalıdır.')
      return
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError('Say 0-dan böyük olmalıdır.')
      return
    }

    if (!Number.isFinite(minQuantity) || minQuantity < 0) {
      setError('Minimum ehtiyat 0 və ya daha çox olmalıdır.')
      return
    }

    const result = createProduct({ name, barcode, typeId, unitId, unitPrice, quantity, minQuantity })

    if (!result.ok) {
      setError(result.error)
      return
    }

    setForm(EMPTY_FORM)
    setError('')
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Field label="Ad">
            <Input
              value={form.name}
              onChange={updateField('name')}
              placeholder="Məhsul adı"
            />
          </Field>
          <Field label="Barkod">
            <Input
              value={form.barcode}
              onChange={updateField('barcode')}
              placeholder="2000001000000"
            />
          </Field>
          <Field label="Tip">
            <select className={styles.input} value={form.typeId} onChange={updateField('typeId')}>
              <option value="">Tipi seçin</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Vahid">
            <select className={styles.input} value={form.unitId} onChange={updateField('unitId')}>
              <option value="">Vahidi seçin</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Qiymət (₼)">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.unitPrice}
              onChange={updateField('unitPrice')}
              placeholder="0.00"
            />
          </Field>
          <Field label="Say">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.quantity}
              onChange={updateField('quantity')}
            />
          </Field>
          <Field label="Minimum">
            <Input
              type="number"
              min={0}
              value={form.minQuantity}
              onChange={updateField('minQuantity')}
            />
          </Field>
        </div>
        {error ? <p className={styles.pageDescription}>{error}</p> : null}
        <Button type="submit">Məhsulu yadda saxla</Button>
      </form>
    </Card>
  )
}
