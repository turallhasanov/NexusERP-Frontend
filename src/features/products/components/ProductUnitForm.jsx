import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createProductUnit } from '@/features/products/api/create-product-unit'
import { styles } from '@/lib/styles'

const EMPTY_FORM = {
  name: '',
}

export function ProductUnitForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const result = createProductUnit({ name: form.name })

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
          <Field label="Vahid adı">
            <Input
              value={form.name}
              onChange={(event) => setForm({ name: event.target.value })}
              placeholder="ədəd, kq, litr"
            />
          </Field>
        </div>
        {error ? <p className={styles.pageDescription}>{error}</p> : null}
        <Button type="submit">Vahidi yadda saxla</Button>
      </form>
    </Card>
  )
}
