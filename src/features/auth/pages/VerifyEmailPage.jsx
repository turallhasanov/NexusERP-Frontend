import { useState } from 'react'
import { Navigate, useLocation, useSearchParams } from 'react-router-dom'
import { AuthPanel } from '@/components/layout/AuthPanel'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { OtpInput } from '@/components/ui/otp-input'
import { resendEmailCode, verifyEmailCode } from '@/features/auth/api/email-codes'
import { useCountdown } from '@/hooks/use-countdown'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { routes } from '@/lib/routes'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'

// Reached after registering, or from the login form when the account is not confirmed yet.
// ?email= keeps the page usable after a reload.
export function VerifyEmailPage() {
  const { token, activeCompanyId } = useAuthStore()
  const location = useLocation()
  const [params] = useSearchParams()
  const email = params.get('email') ?? ''
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState(location.state?.notice ?? 'Təsdiq kodu e-poçt ünvanınıza göndərildi.')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const countdown = useCountdown(location.state?.resendAfterSeconds ?? 0)
  useDocumentTitle('E-poçtu təsdiqlə')

  // Verifying logs the user in; a new account has no company yet, so this lands on company setup.
  if (token) {
    return <Navigate to={activeCompanyId ? routes.dashboard : routes.selectCompany} replace />
  }

  if (!email) {
    return (
      <AuthPanel title="E-poçtu təsdiqlə" description="Təsdiq ediləcək e-poçt ünvanı göstərilməyib.">
        <ButtonLink to={routes.register}>Qeydiyyata qayıt</ButtonLink>
      </AuthPanel>
    )
  }

  async function submit(value) {
    if (submitting) {
      return
    }

    if (value.length !== 6) {
      setError('Kod 6 rəqəmdən ibarət olmalıdır.')
      return
    }

    setError('')
    setSubmitting(true)
    const result = await verifyEmailCode({ email, code: value })
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      setNotice('')
      setCode('')
    }
  }

  async function resend() {
    setError('')
    setResending(true)
    const result = await resendEmailCode(email)
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
    <AuthPanel title="E-poçtu təsdiqlə" description={`6 rəqəmli kodu daxil edin: ${email}`}>
      <form
        className={styles.form}
        onSubmit={(event) => {
          event.preventDefault()
          void submit(code)
        }}
      >
        <OtpInput value={code} onChange={setCode} onComplete={submit} disabled={submitting} autoFocus />
        {notice && !error ? <p className={styles.formNotice}>{notice}</p> : null}
        {error ? <p className={styles.formError}>{error}</p> : null}
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
        <div className={styles.authActions}>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? 'Yoxlanılır…' : 'Təsdiqlə'}
          </Button>
          <ButtonLink to={routes.login} variant="outline" className="flex-1">
            Daxil ol
          </ButtonLink>
        </div>
      </form>
    </AuthPanel>
  )
}
