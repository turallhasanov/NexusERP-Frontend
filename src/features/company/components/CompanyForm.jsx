import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createCompany } from '@/features/company/api/create-company'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'

const EMPTY_FORM = {
  name: '',
  voen: '',
}

export function CompanyForm() {
  const navigate = useNavigate()
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

    const result = createCompany({ name: form.name, voen: form.voen })

    if (!result.ok) {
      setError(result.error)
      return
    }

    navigate(routes.dashboard, { replace: true })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Field label="Şirkət adı">
        <Input
          value={form.name}
          onChange={updateField('name')}
          placeholder="Şirkətin adı"
          autoComplete="organization"
        />
      </Field>
      <Field label="VÖEN">
        <Input
          value={form.voen}
          onChange={updateField('voen')}
          placeholder="1400000001"
        />
      </Field>
      {error ? <p className={styles.pageDescription}>{error}</p> : null}
      <Button type="submit">Şirkəti yarat</Button>
    </form>
  )
}
