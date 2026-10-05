import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { styles } from '@/lib/styles'
import { addOrder } from '@/store/orders-store'

const EMPTY_FORM = {
  customer: '',
  product: '',
  quantity: 1,
  unitPrice: '',
}

export function OrderForm() {
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

    const customer = form.customer.trim()
    const product = form.product.trim()
    const quantity = Number(form.quantity)
    const unitPrice = Number(form.unitPrice)

    if (!customer || !product) {
      setError('Kontragent və məhsul tələb olunur.')
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

    addOrder({ customer, product, quantity, unitPrice })
    setForm(EMPTY_FORM)
    setError('')
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Field label="Kontragent">
            <Input
              value={form.customer}
              onChange={updateField('customer')}
              placeholder="Şirkətin adı"
            />
          </Field>
          <Field label="Məhsul">
            <Input
              value={form.product}
              onChange={updateField('product')}
              placeholder="Məhsulun adı"
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
