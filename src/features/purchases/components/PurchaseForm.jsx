import { useState } from 'react'
import { DocumentLinesEditor } from '@/components/documents/DocumentLinesEditor'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { placePurchase } from '@/features/purchases/api/place-purchase'
import { emptyLine } from '@/lib/document-lines'
import { styles } from '@/lib/styles'
import { useCustomersStore } from '@/store/customers-store'
import { useInventoryStore } from '@/store/inventory-store'
import { useWarehousesStore } from '@/store/warehouses-store'
import { showToast } from '@/store/toast-store'

function emptyForm() {
  return {
    customerId: '',
    warehouseId: '',
    lines: [emptyLine()],
  }
}

// Creates a draft purchase. Stock is increased only when the draft is approved.
export function PurchaseForm({ onCreated }) {
  const { customers } = useCustomersStore()
  const { products } = useInventoryStore()
  const { warehouses } = useWarehousesStore()
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(field) {
    return (event) => {
      setForm((current) => ({ ...current, [field]: event.target.value }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const result = await placePurchase(form)

    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setForm(emptyForm())
    showToast(`Alış sənədi yaradıldı: ${result.purchase.number}`)
    onCreated?.(result.purchase)
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.sectionTitle}>Yeni alış (qaralama)</h2>
        <div className={styles.formGrid}>
          <Field label="Təchizatçı (kontragent)">
            <select className={styles.input} value={form.customerId} onChange={updateField('customerId')}>
              <option value="">Kontragenti seçin</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </Field>
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
        </div>
        <DocumentLinesEditor
          lines={form.lines}
          onChange={(lines) => setForm((current) => ({ ...current, lines }))}
          products={products}
          defaultPrice={(product) => product.purchasePrice}
          stockWarehouseId={form.warehouseId}
          pricePlaceholder="Alış qiyməti"
        />
        {error ? <p className={styles.formError}>{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Yadda saxlanılır…' : 'Qaralamanı yadda saxla'}
        </Button>
      </form>
    </Card>
  )
}
