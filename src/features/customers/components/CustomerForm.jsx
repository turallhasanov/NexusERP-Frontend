import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import { createCustomer } from '@/features/customers/api/create-customer'
import { isCompletePhone, toApiPhone } from '@/lib/phone'
import { styles } from '@/lib/styles'
import { showToast } from '@/store/toast-store'

const EMPTY_FORM = {
  name: '',
  voen: '',
  // The 9 local digits; PhoneInput shows them as +994 (50) 000-00-00.
  phone: '',
  address: '',
}

export function CustomerForm() {
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

    // The phone is optional, but a started number must be complete.
    if (form.phone && !isCompletePhone(form.phone)) {
      setError('Telefon nömrəsi 9 rəqəmdən ibarət olmalıdır: +994 (50) 000-00-00.')
      return
    }

    setSubmitting(true)

    const result = await createCustomer({ ...form, phone: toApiPhone(form.phone) })

    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setForm(EMPTY_FORM)
    showToast(`Kontragent yaradıldı: ${result.customer.code}`)
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Field label="Ad">
            <Input value={form.name} onChange={updateField('name')} placeholder="Şirkətin adı" />
          </Field>
          <Field label="VÖEN">
            <Input value={form.voen} onChange={updateField('voen')} placeholder="1400000001" />
          </Field>
          <Field label="Telefon">
            <PhoneInput value={form.phone} onChange={(phone) => setForm((current) => ({ ...current, phone }))} />
          </Field>
          <Field label="Ünvan">
            <Input value={form.address} onChange={updateField('address')} placeholder="Bakı, Yasamal r." />
          </Field>
        </div>
        {error ? <p className={styles.formError}>{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Yadda saxlanılır…' : 'Kontragenti yadda saxla'}
        </Button>
      </form>
    </Card>
  )
}
