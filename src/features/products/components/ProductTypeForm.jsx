import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createProductType } from '@/features/products/api/create-product-type'
import { styles } from '@/lib/styles'

const EMPTY_FORM = {
  name: '',
}

export function ProductTypeForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const result = createProductType({ name: form.name })

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
          <Field label="Tip adı">
            <Input
              value={form.name}
              onChange={(event) => setForm({ name: event.target.value })}
              placeholder="Kağız, içki, tekstil"
            />
          </Field>
        </div>
        {error ? <p className={styles.pageDescription}>{error}</p> : null}
        <Button type="submit">Tipi yadda saxla</Button>
      </form>
    </Card>
  )
}
