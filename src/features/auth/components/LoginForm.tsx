import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.tsx'
import { Field } from '@/components/ui/field.tsx'
import { Input } from '@/components/ui/input.tsx'
import { routes } from '@/lib/routes.ts'
import { styles } from '@/lib/styles.ts'
import { DEMO_USER, setAuthUser } from '@/store/auth-store.ts'

export function LoginForm() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || !password.trim()) {
      setError('E-poçt və şifrə tələb olunur.')
      return
    }

    setAuthUser(DEMO_USER)
    navigate(routes.dashboard, { replace: true })
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
