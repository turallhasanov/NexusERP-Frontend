import { useState } from 'react'
import { DocumentLinesEditor } from '@/components/documents/DocumentLinesEditor'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { placeOrder } from '@/features/sales/api/place-order'
import { emptyLine } from '@/lib/document-lines'
import { styles } from '@/lib/styles'
import { useCustomersStore } from '@/store/customers-store'
import { useInventoryStore } from '@/store/inventory-store'
import { useStoresStore } from '@/store/stores-store'
import { useWarehousesStore } from '@/store/warehouses-store'
import { showToast } from '@/store/toast-store'

function emptyForm() {
  return {
    storeId: '',
    customerId: '',
    warehouseId: '',
    lines: [emptyLine()],
  }
}

// Creates a draft sale. Stock is decreased only when the draft is approved.
export function OrderForm({ onCreated }) {
  const { customers } = useCustomersStore()
  const { products } = useInventoryStore()
  const { stores } = useStoresStore()
  const { warehouses } = useWarehousesStore()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const selectedStore = stores.find((store) => store.id === form.storeId)
  const stockWarehouseId = form.warehouseId || selectedStore?.warehouseId

  function updateField(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const result = await placeOrder(form)

    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setForm(emptyForm())
    showToast(`Satış sənədi yaradıldı: ${result.order.number}`)
    onCreated?.(result.order)
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.sectionTitle}>Yeni satış (qaralama)</h2>
        <div className={styles.formGrid}>
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
          <Field label="Kontragent">
            <select className={styles.input} value={form.customerId} onChange={updateField('customerId')}>
              <option value="">Pərakəndə alıcı</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Depo">
            <select className={styles.input} value={form.warehouseId} onChange={updateField('warehouseId')}>
              <option value="">{selectedStore ? `Mağazanın deposu (${selectedStore.warehouse?.name ?? '—'})` : 'Mağazanın deposu'}</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <DocumentLinesEditor
          lines={form.lines}
          onChange={(lines) => setForm((current) => ({ ...current, lines }))}
          products={products}
          defaultPrice={(product) => product.unitPrice}
          stockWarehouseId={stockWarehouseId}
          pricePlaceholder="Satış qiyməti"
        />
        {error ? <p className={styles.formError}>{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Yadda saxlanılır…' : 'Qaralamanı yadda saxla'}
        </Button>
      </form>
    </Card>
  )
}
