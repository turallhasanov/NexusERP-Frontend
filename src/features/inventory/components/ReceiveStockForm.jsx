import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { addStock } from '@/features/inventory/api/receive-stock'
import { styles } from '@/lib/styles'
import { useInventoryStore } from '@/store/inventory-store'
import { formatQuantity } from '@/store/product-units-store'
import { useWarehousesStore } from '@/store/warehouses-store'

const EMPTY_FORM = {
  productId: '',
  warehouseId: '',
  quantity: 1,
}

export function ReceiveStockForm() {
  const { products } = useInventoryStore()
  const { warehouses } = useWarehousesStore()
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

    const productId = form.productId
    const warehouseId = form.warehouseId
    const quantity = Number(form.quantity)

    if (!productId || !warehouseId) {
      setError('Məhsul və depo tələb olunur.')
      return
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      setError('Say 0-dan böyük olmalıdır.')
      return
    }

    const result = addStock({ productId, warehouseId, quantity })

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
          <Field label="Məhsul">
            <select
              className={styles.input}
              value={form.productId}
              onChange={updateField('productId')}
            >
              <option value="">Məhsulu seçin</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({formatQuantity(product.quantity, product.unitId)})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Depo">
            <select
              className={styles.input}
              value={form.warehouseId}
              onChange={updateField('warehouseId')}
            >
              <option value="">Depo seçin</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
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
        </div>
        {error ? <p className={styles.pageDescription}>{error}</p> : null}
        <Button type="submit">Anbara əlavə et</Button>
      </form>
    </Card>
  )
}
