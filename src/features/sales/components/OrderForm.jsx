import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { placeOrder } from '@/features/sales/api/place-order'
import { styles } from '@/lib/styles'
import { useCustomersStore } from '@/store/customers-store'
import { useInventoryStore } from '@/store/inventory-store'
import { useStoresStore } from '@/store/stores-store'
import { useWarehousesStore } from '@/store/warehouses-store'

const EMPTY_FORM = {
  type: 'wholesale',
  customerId: '',
  storeId: '',
  productId: '',
  warehouseId: '',
  quantity: 1,
  unitPrice: '',
}

export function OrderForm() {
  const { customers } = useCustomersStore()
  const { products } = useInventoryStore()
  const { stores } = useStoresStore()
  const { warehouses } = useWarehousesStore()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const isRetail = form.type === 'retail'
  const selectedStore = stores.find((store) => store.id === form.storeId)
  const stockWarehouseId = isRetail ? selectedStore?.warehouseId : form.warehouseId

  function updateField(field) {
    return (event) => {
      const value = event.target.value
      setForm((current) => {
        const next = {
          ...current,
          [field]: value,
          ...(field === 'type' ? { storeId: '', warehouseId: '', customerId: '' } : {}),
        }

        if (field === 'productId') {
          const product = products.find((item) => item.id === value)
          next.unitPrice = product ? String(product.unitPrice) : ''
        }

        return next
      })
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const type = form.type
    const customerId = form.customerId
    const storeId = form.storeId
    const productId = form.productId
    const warehouseId = form.warehouseId
    const quantity = Number(form.quantity)
    const unitPrice = Number(form.unitPrice)

    if (type === 'retail' && !storeId) {
      setError('Mağaza tələb olunur.')
      return
    }

    if (type !== 'retail' && (!customerId || !warehouseId)) {
      setError('Kontragent, məhsul və depo tələb olunur.')
      return
    }

    if (!productId) {
      setError(type === 'retail' ? 'Məhsul və mağaza tələb olunur.' : 'Kontragent, məhsul və depo tələb olunur.')
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

    const result = placeOrder({ type, customerId, storeId, productId, warehouseId, quantity, unitPrice })

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
          <Field label="Növ">
            <select className={styles.input} value={form.type} onChange={updateField('type')}>
              <option value="wholesale">Toptan</option>
              <option value="retail">Pərakəndə</option>
            </select>
          </Field>
          {isRetail ? (
            <Field label="Mağaza">
              <select className={styles.input} value={form.storeId} onChange={updateField('storeId')}>
                <option value="">Mağazanı seçin</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="Kontragent">
              <select className={styles.input} value={form.customerId} onChange={updateField('customerId')}>
                <option value="">Kontragenti seçin</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <Field label="Məhsul">
            <select className={styles.input} value={form.productId} onChange={updateField('productId')}>
              <option value="">Məhsulu seçin</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({stockWarehouseId ? (product.stocks[stockWarehouseId] ?? 0) : product.quantity})
                </option>
              ))}
            </select>
          </Field>
          {isRetail ? null : (
            <Field label="Depo">
              <select className={styles.input} value={form.warehouseId} onChange={updateField('warehouseId')}>
                <option value="">Depo seçin</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
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
