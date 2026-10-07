import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createProduct } from '@/features/products/api/create-product'
import { styles } from '@/lib/styles'

const EMPTY_FORM = {
  name: '',
  quantity: 1,
  minQuantity: 1,
}

export function ProductForm() {
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
    const quantity = Number(form.quantity)
    const minQuantity = Number(form.minQuantity)

    if (!name) {
      setError('Məhsul adı tələb olunur.')
      return
    }

    if (!Number.isFinite(quantity) || quantity < 1) {
      setError('Say ən azı 1 olmalıdır.')
      return
    }

    if (!Number.isFinite(minQuantity) || minQuantity < 0) {
      setError('Minimum ehtiyat 0 və ya daha çox olmalıdır.')
      return
    }

    createProduct({ name, quantity, minQuantity })
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
          <Field label="Say">
            <Input
              type="number"
              min={1}
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
