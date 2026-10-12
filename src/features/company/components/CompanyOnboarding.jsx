import { useState } from 'react'
import { CompanyForm } from '@/features/company/components/CompanyForm'
import { JoinCompanyForm } from '@/features/company/components/JoinCompanyForm'
import { styles } from '@/lib/styles'

const CHOICES = [
  {
    id: 'create',
    title: 'Yeni Şirkət Yaradın',
    text: 'Öz şirkətinizi qeyd edin. Siz onun idarəçisi olacaqsınız.',
  },
  {
    id: 'join',
    title: 'Mövcud Şirkətə Qoşulun',
    text: 'İdarəçinin verdiyi dəvət kodu ilə komandaya əməkdaş kimi qoşulun.',
  },
]

// For a signed-in user without a company: create a new one, or join an existing one with its invite code.
export function CompanyOnboarding() {
  const [mode, setMode] = useState(null)

  if (!mode) {
    return (
      <div className={styles.choiceList}>
        {CHOICES.map((choice) => (
          <button key={choice.id} type="button" className={styles.choiceCard} onClick={() => setMode(choice.id)}>
            <p className={styles.choiceTitle}>{choice.title}</p>
            <p className={styles.choiceText}>{choice.text}</p>
          </button>
        ))}
      </div>
    )
  }

  const choice = CHOICES.find((item) => item.id === mode)

  return (
    <div className={styles.form}>
      <div className={styles.inviteRow}>
        <h2 className={styles.sectionTitle}>{choice.title}</h2>
        <button type="button" className={styles.authLink} onClick={() => setMode(null)}>
          ← Geri
        </button>
      </div>
      {mode === 'create' ? <CompanyForm /> : <JoinCompanyForm />}
    </div>
  )
}
