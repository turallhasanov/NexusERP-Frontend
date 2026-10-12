import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { joinCompany } from '@/features/company/api/join-company'
import { styles } from '@/lib/styles'

// On success the auth store gets the company, so /select-company moves on to the dashboard by itself.
export function JoinCompanyForm() {
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const result = await joinCompany({ inviteCode })

    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <Field label="Dəvət kodu">
        <Input
          className={styles.inviteInput}
          value={inviteCode}
          onChange={(event) => setInviteCode(event.target.value)}
          placeholder="ABCD2345"
          maxLength={12}
          autoComplete="off"
          autoFocus
        />
      </Field>
      <p className={styles.fieldHint}>Kodu şirkətinizin idarəçisindən alın (Parametrlər bölməsində göstərilir).</p>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Qoşulur…' : 'Qoşul'}
      </Button>
    </form>
  )
}
