import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useWarehouses } from '@/features/inventory/api/use-warehouses'
import { createStore } from '@/features/stores/api/create-store'
import { styles } from '@/lib/styles'
import { showToast } from '@/store/toast-store'

const EMPTY_FORM = {
  name: '',
  warehouseId: '',
  address: '',
}

export function StoreForm() {
  const { warehouses, isLoading: warehousesLoading } = useWarehouses()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function updateField(field) {
    return (event) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const result = await createStore(form)

    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setForm(EMPTY_FORM)
    showToast(`Mağaza yaradıldı: ${result.store.code}`)
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Field label="Ad">
            <Input value={form.name} onChange={updateField('name')} placeholder="Bakı mağazası" />
          </Field>
          <Field label="Anbar">
            <select className={styles.input} value={form.warehouseId} onChange={updateField('warehouseId')}>
              <option value="">{warehousesLoading ? 'Yüklənir…' : 'Anbar seçin'}</option>
              {warehouses.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ünvan">
            <Input value={form.address} onChange={updateField('address')} placeholder="Bakı, 28 May küç." />
          </Field>
        </div>
        {error ? <p className={styles.formError}>{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Yadda saxlanılır…' : 'Mağazanı yadda saxla'}
        </Button>
      </form>
    </Card>
  )
}
