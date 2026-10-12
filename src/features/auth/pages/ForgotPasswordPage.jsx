import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthPanel } from '@/components/layout/AuthPanel'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { requestPasswordReset } from '@/features/auth/api/email-codes'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'

// Step 1 of password reset: e-mail a code. Step 2 is /reset-password.
export function ForgotPasswordPage() {
  const { token } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState(location.state?.email ?? '')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  useDocumentTitle('Şifrəni unutmusunuz?')

  if (token) {
    return <Navigate to={routes.dashboard} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await requestPasswordReset(email)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    navigate(`${routes.resetPassword}?email=${encodeURIComponent(result.email)}`, {
      state: { notice: result.message, resendAfterSeconds: result.resendAfterSeconds },
    })
  }

  return (
    <AuthPanel title="Şifrəni unutmusunuz?" description="E-poçt ünvanınızı yazın, şifrəni yeniləmək üçün kod göndərək.">
      {/* noValidate: the browser's own e-mail tooltip is not in Azerbaijani; the server's message is shown. */}
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Field label="E-poçt">
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="aysel@nexuserp.az"
            autoComplete="email"
            autoFocus
          />
        </Field>
        {error ? <p className={styles.formError}>{error}</p> : null}
        <div className={styles.authActions}>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? 'Göndərilir…' : 'Kod göndər'}
          </Button>
          <ButtonLink to={routes.login} variant="outline" className="flex-1">
            Daxil ol
          </ButtonLink>
        </div>
      </form>
    </AuthPanel>
  )
}
