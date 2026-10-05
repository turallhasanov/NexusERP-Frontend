import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { styles } from '@/lib/styles'

export function OrderForm() {
  const [customer, setCustomer] = useState('')
  const [product, setProduct] = useState('')
  const [quantity, setQuantity] = useState(1)

  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Field label="Kontragent">
            <Input
              value={customer}
              onChange={(event) => setCustomer(event.target.value)}
              placeholder="Şirkətin adı"
            />
          </Field>
          <Field label="Məhsul">
            <Input
              value={product}
              onChange={(event) => setProduct(event.target.value)}
              placeholder="Məhsulun adı"
            />
          </Field>
          <Field label="Say">
            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
            />
          </Field>
        </div>
        <Button type="submit">Sifarişi yadda saxla</Button>
      </form>
    </Card>
  )
}
