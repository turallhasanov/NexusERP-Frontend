import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createProductType } from '@/features/products/api/create-product-type'
import { styles } from '@/lib/styles'
import { showToast } from '@/store/toast-store'

const EMPTY_FORM = {
  name: '',
}

export function ProductTypeForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const result = await createProductType(form)

    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setForm(EMPTY_FORM)
    showToast(`Kateqoriya yaradıldı: ${result.type.name}`)
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Field label="Kateqoriya adı">
            <Input
              value={form.name}
              onChange={(event) => setForm({ name: event.target.value })}
              placeholder="Kağız, içki, tekstil"
            />
          </Field>
        </div>
        {error ? <p className={styles.formError}>{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Yadda saxlanılır…' : 'Kateqoriyanı yadda saxla'}
        </Button>
      </form>
    </Card>
  )
}
