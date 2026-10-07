import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { placeOrder } from '@/features/sales/api/place-order'
import { styles } from '@/lib/styles'
import { useCustomersStore } from '@/store/customers-store'
import { useInventoryStore } from '@/store/inventory-store'
import { useWarehousesStore } from '@/store/warehouses-store'

const EMPTY_FORM = {
  customerId: '',
  productId: '',
  warehouseId: '',
  quantity: 1,
  unitPrice: '',
}

export function OrderForm() {
  const { customers } = useCustomersStore()
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

    const customerId = form.customerId
    const productId = form.productId
    const warehouseId = form.warehouseId
    const quantity = Number(form.quantity)
    const unitPrice = Number(form.unitPrice)

    if (!customerId || !productId || !warehouseId) {
      setError('Kontragent, məhsul və depo tələb olunur.')
      return
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      setError('Say ən azı 1 olmalıdır.')
      return
    }

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      setError('Qiymət 0-dan böyük olmalıdır.')
      return
    }

    const result = placeOrder({ customerId, productId, warehouseId, quantity, unitPrice })

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
          <Field label="Kontragent">
            <select
              className={styles.input}
              value={form.customerId}
              onChange={updateField('customerId')}
            >
              <option value="">Kontragenti seçin</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Məhsul">
            <select
              className={styles.input}
              value={form.productId}
              onChange={updateField('productId')}
            >
              <option value="">Məhsulu seçin</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({form.warehouseId ? (product.stocks[form.warehouseId] ?? 0) : product.quantity})
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
              min={1}
              value={form.quantity}
              onChange={updateField('quantity')}
            />
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
        </div>
        {error ? <p className={styles.pageDescription}>{error}</p> : null}
        <Button type="submit">Sifarişi yadda saxla</Button>
      </form>
    </Card>
  )
}
