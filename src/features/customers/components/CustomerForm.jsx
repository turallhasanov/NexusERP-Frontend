import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createCustomer } from '@/features/customers/api/create-customer'
import { styles } from '@/lib/styles'

const EMPTY_FORM = {
  name: '',
}

export function CustomerForm() {
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

    if (!name) {
      setError('Kontragent adı tələb olunur.')
      return
    }

    createCustomer({ name })
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
              placeholder="Şirkətin adı"
            />
          </Field>
        </div>
        {error ? <p className={styles.pageDescription}>{error}</p> : null}
        <Button type="submit">Kontragenti yadda saxla</Button>
      </form>
    </Card>
  )
}
