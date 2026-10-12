import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { signIn } from '@/features/auth/api/sign-in'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'

// `initialEmail` / `notice` come from the password reset page ("Şifrəniz yeniləndi…").
export function LoginForm({ initialEmail = '', notice = '' }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const result = await signIn({ email, password })

    setSubmitting(false)

    // Right password, e-mail not confirmed yet: continue on the code screen (a new code can be sent there).
    if (result.status === 403) {
      navigate(`${routes.verifyEmail}?email=${encodeURIComponent(email.trim().toLowerCase())}`, {
        state: { notice: result.error },
      })
      return
    }

    if (!result.ok) {
      setError(result.error)
      return
    }

    // The company page picks the user's company (or offers to create one) and then opens the dashboard.
    navigate(routes.selectCompany, { replace: true })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Field label="E-poçt">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="demo@nexuserp.az"
          autoComplete="email"
        />
      </Field>
      <Field label="Şifrə">
        <Input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </Field>
      <div className={styles.authLinkRow}>
        <Link to={routes.forgotPassword} state={{ email }} className={styles.authLink}>
          Şifrəni unutmusunuz?
        </Link>
      </div>
      {notice && !error ? <p className={styles.formNotice}>{notice}</p> : null}
      {error ? <p className={styles.pageDescription}>{error}</p> : null}
      <div className={styles.authActions}>
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting ? 'Yoxlanılır…' : 'Daxil ol'}
        </Button>
        <ButtonLink to={routes.register} variant="outline" className="flex-1">
          Qeydiyyatdan keç
        </ButtonLink>
      </div>
    </form>
  )
}
