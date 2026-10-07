import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createStore } from '@/features/stores/api/create-store'
import { styles } from '@/lib/styles'
import { useWarehousesStore } from '@/store/warehouses-store'

const EMPTY_FORM = {
  name: '',
  warehouseId: '',
}

export function StoreForm() {
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

    const name = form.name.trim()
    const warehouseId = form.warehouseId

    if (!name || !warehouseId) {
      setError('Ad və depo tələb olunur.')
      return
    }

    const result = createStore({ name, warehouseId })

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
              placeholder="Bakı mağazası"
            />
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
        </div>
        {error ? <p className={styles.pageDescription}>{error}</p> : null}
        <Button type="submit">Mağazanı yadda saxla</Button>
      </form>
    </Card>
  )
}
