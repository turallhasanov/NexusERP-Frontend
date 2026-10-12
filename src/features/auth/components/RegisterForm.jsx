import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { register } from '@/features/auth/api/register'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'

const EMPTY_FORM = {
  fullName: '',
  email: '',
  password: '',
  passwordConfirm: '',
}

export function RegisterForm() {
  const navigate = useNavigate()
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
    setSubmitting(true)

    const result = await register(form)

    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    // The account is created but unconfirmed: the code e-mailed to the user logs them in.
    navigate(`${routes.verifyEmail}?email=${encodeURIComponent(result.email)}`, {
      replace: true,
      state: { notice: result.message, resendAfterSeconds: result.resendAfterSeconds },
    })
  }

  return (
    // noValidate: the browser's own e-mail tooltip is not in Azerbaijani; the server's message is shown instead.
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <Field label="Ad Soyad">
        <Input
          value={form.fullName}
          onChange={updateField('fullName')}
          placeholder="Aysel Məmmədova"
          autoComplete="name"
        />
      </Field>
      <Field label="E-poçt">
        <Input
          type="email"
          value={form.email}
          onChange={updateField('email')}
          placeholder="aysel@nexuserp.az"
          autoComplete="email"
        />
      </Field>
      <Field label="Şifrə">
        <Input
          type="password"
          value={form.password}
          onChange={updateField('password')}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </Field>
      <p className={styles.fieldHint}>Ən azı 6 simvol, içində hərf və rəqəm olmalıdır.</p>
      <Field label="Şifrə təkrarı">
        <Input
          type="password"
          value={form.passwordConfirm}
          onChange={updateField('passwordConfirm')}
          placeholder="••••••••"
          autoComplete="new-password"
        />
      </Field>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <div className={styles.authActions}>
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting ? 'Qeydiyyat aparılır…' : 'Qeydiyyatdan keç'}
        </Button>
        <ButtonLink to={routes.login} variant="outline" className="flex-1">
          Daxil ol
        </ButtonLink>
      </div>
    </form>
  )
}
