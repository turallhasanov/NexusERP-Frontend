import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { signIn } from '@/features/auth/api/sign-in'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'

export function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const result = await signIn({ email, password })

    setSubmitting(false)

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
      {error ? <p className={styles.pageDescription}>{error}</p> : null}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Yoxlanılır…' : 'Daxil ol'}
      </Button>
    </form>
  )
}
