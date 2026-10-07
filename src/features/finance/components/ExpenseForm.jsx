import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createExpense } from '@/features/finance/api/create-expense'
import { styles } from '@/lib/styles'

const CATEGORIES = ['Kirayə', 'Kommunal', 'Maaş', 'Təchizat', 'Digər']

const EMPTY_FORM = {
  category: '',
  amount: '',
}

export function ExpenseForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

  function updateField(field) {
    return (event) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const category = form.category
    const amount = Number(form.amount)

    if (!category) {
      setError('Kateqoriya tələb olunur.')
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Məbləğ 0-dan böyük olmalıdır.')
      return
    }

    createExpense({ category, amount })
    setForm(EMPTY_FORM)
    setError('')
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Field label="Kateqoriya">
            <select
              className={styles.input}
              value={form.category}
              onChange={updateField('category')}
            >
              <option value="">Kateqoriyanı seçin</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Məbləğ (₼)">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.amount}
              onChange={updateField('amount')}
              placeholder="0.00"
            />
          </Field>
        </div>
        {error ? <p className={styles.pageDescription}>{error}</p> : null}
        <Button type="submit">Məxarici yadda saxla</Button>
      </form>
    </Card>
  )
}
