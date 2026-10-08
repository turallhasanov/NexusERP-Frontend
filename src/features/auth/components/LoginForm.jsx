import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'
import { DEMO_USER, setAuthUser } from '@/store/auth-store'
import { getCompanyState } from '@/store/company-store'

export function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError('E-poçt və şifrə tələb olunur.')
      return
    }

    setAuthUser(DEMO_USER)
    navigate(getCompanyState().company ? routes.dashboard : routes.setup, { replace: true })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Field label="E-poçt">
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="aysel@nexuserp.az"
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
      <Button type="submit">Daxil ol</Button>
    </form>
  )
}
