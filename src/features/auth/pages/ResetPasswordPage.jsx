import { useState } from 'react'
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthPanel } from '@/components/layout/AuthPanel'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { OtpInput } from '@/components/ui/otp-input'
import { requestPasswordReset, resetPassword } from '@/features/auth/api/email-codes'
import { useCountdown } from '@/hooks/use-countdown'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'

// Step 2 of password reset: the e-mailed code plus the new password. ?email= comes from step 1.
export function ResetPasswordPage() {
  const { token } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(location.state?.notice ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const countdown = useCountdown(location.state?.resendAfterSeconds ?? 0)
  useDocumentTitle('Şifrəni yenilə')

  if (token) {
    return <Navigate to={routes.dashboard} replace />
  }

  if (!email) {
    return <Navigate to={routes.forgotPassword} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    const result = await resetPassword({ email, code, newPassword, confirmPassword })
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      setNotice('')
      return
    }

    navigate(routes.login, { replace: true, state: { notice: result.message, email } })
  }

  async function resend() {
    setError('')
    setResending(true)
    const result = await requestPasswordReset(email)
    setResending(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setCode('')
    setNotice('Yeni kod göndərildi.')
    countdown.start(result.resendAfterSeconds)
  }

  return (
    <AuthPanel title="Şifrəni yenilə" description={`${email} ünvanına göndərilən 6 rəqəmli kodu daxil edin.`}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <OtpInput value={code} onChange={setCode} disabled={submitting} autoFocus />
        <div className={styles.resendRow}>
          <span>Kodu almadınız?</span>
          <button
            type="button"
            className={styles.textAction}
            onClick={resend}
            disabled={resending || countdown.secondsLeft > 0}
          >
            {resending
              ? 'Göndərilir…'
              : countdown.secondsLeft > 0
                ? `Yeni kod göndər (${countdown.secondsLeft} san)`
                : 'Yeni kod göndər'}
          </button>
        </div>
        <Field label="Yeni şifrə">
          <Input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>
        <p className={styles.fieldHint}>Ən azı 6 simvol, içində hərf və rəqəm olmalıdır.</p>
        <Field label="Şifrə təkrarı">
          <Input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>
        {notice && !error ? <p className={styles.formNotice}>{notice}</p> : null}
        {error ? <p className={styles.formError}>{error}</p> : null}
        <div className={styles.authActions}>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? 'Yenilənir…' : 'Şifrəni yenilə'}
          </Button>
          <ButtonLink to={routes.login} variant="outline" className="flex-1">
            Daxil ol
          </ButtonLink>
        </div>
      </form>
    </AuthPanel>
  )
}
