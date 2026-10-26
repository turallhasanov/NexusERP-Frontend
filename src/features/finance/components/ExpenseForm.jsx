import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createExpense } from '@/features/finance/api/create-expense'
import { CashRegisterModal } from '@/features/finance/components/CashRegisterModal'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'
import { useCashRegistersStore } from '@/store/cash-registers-store'
import { useExpenseCategoriesStore } from '@/store/expense-categories-store'
import { useStoresStore } from '@/store/stores-store'
import { showToast } from '@/store/toast-store'

// The server's default register, which the form preselects.
const DEFAULT_REGISTER_CODE = 'KSA-001'

// Offered even before the company has its own categories; the first expense of one creates it on the server.
const DEFAULT_CATEGORIES = ['Kirayə', 'Kommunal', 'Təchizat', 'Digər']

const EMPTY_FORM = {
  category: '',
  amount: '',
  cashRegisterId: '',
  storeId: '',
}

export function ExpenseForm() {
  const { categories } = useExpenseCategoriesStore()
  const { cashRegisters, isLoading: registersLoading } = useCashRegistersStore()
  const { stores } = useStoresStore()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [creatingRegister, setCreatingRegister] = useState(false)

  const categoryNames = [
    ...categories.map((category) => category.name),
    ...DEFAULT_CATEGORIES.filter(
      (name) => !categories.some((category) => category.name.toLocaleLowerCase('az') === name.toLocaleLowerCase('az')),
    ),
  ]
  const activeRegisters = cashRegisters.filter((register) => register.isActive)
  // Nothing chosen yet → "Əsas kassa" (or the first active register), so the form is never stuck on an empty choice.
  const defaultRegister =
    activeRegisters.find((register) => register.code === DEFAULT_REGISTER_CODE) ?? activeRegisters[0] ?? null
  const cashRegisterId = form.cashRegisterId || defaultRegister?.id || ''
  const selectedRegister = activeRegisters.find((register) => register.id === cashRegisterId) ?? null
  const enteredAmount = Number(form.amount)
  const isShort = Boolean(selectedRegister) && enteredAmount > 0 && enteredAmount > selectedRegister.balance
  const activeStores = stores.filter((store) => store.isActive !== false)

  function updateField(field) {
    return (event) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const amount = Number(form.amount)

    if (!form.category) {
      setError('Kateqoriya tələb olunur.')
      return
    }

    if (!cashRegisterId) {
      setError('Xərcin ödəniləcəyi kassanı seçin.')
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Məbləğ 0-dan böyük olmalıdır.')
      return
    }

    setError('')
    setSubmitting(true)

    const result = await createExpense({ ...form, cashRegisterId, amount })

    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setForm(EMPTY_FORM)
    showToast(`Məxaric yazıldı: ${result.expense.category} · ${formatAzn(result.expense.amount)}`)
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Field label="Kateqoriya">
            <select className={styles.input} value={form.category} onChange={updateField('category')}>
              <option value="">Kateqoriyanı seçin</option>
              {categoryNames.map((name) => (
                <option key={name} value={name}>
                  {name}
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
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Kassa</span>
            <div className={styles.inlineField}>
              <select
                className={`${styles.input} min-w-0 flex-1`}
                value={cashRegisterId}
                onChange={updateField('cashRegisterId')}
              >
                {activeRegisters.length === 0 ? (
                  <option value="">{registersLoading ? 'Yüklənir…' : 'Kassa yoxdur'}</option>
                ) : null}
                {activeRegisters.map((register) => (
                  <option key={register.id} value={register.id}>
                    {register.name} · {formatAzn(register.balance)}
                  </option>
                ))}
              </select>
              <button type="button" className={styles.buttonSecondary} onClick={() => setCreatingRegister(true)}>
                + Yeni kassa
              </button>
            </div>
            {isShort ? (
              <span className={styles.fieldWarning}>
                Bu kassada yalnız {formatAzn(selectedRegister.balance)} var: xərc qəbul olunmayacaq. Başqa kassa seçin
                və ya başlanğıc qalığı olan yeni kassa yaradın.
              </span>
            ) : null}
          </label>
          <Field label="Mağaza (istəyə bağlı)">
            <select className={styles.input} value={form.storeId} onChange={updateField('storeId')}>
              <option value="">Ümumi (mağazaya aid deyil)</option>
              {activeStores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <p className={styles.fieldHint}>
          Mağaza seçilsə, xərc həmin mağazanın mənfəət/zərər hesabına düşür. Məbləğ seçilmiş kassadan çıxılır.
        </p>
        {error ? <p className={styles.formError}>{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Yadda saxlanılır…' : 'Məxarici yadda saxla'}
        </Button>
      </form>
      {creatingRegister ? (
        <CashRegisterModal
          onClose={() => setCreatingRegister(false)}
          onCreated={(register) => {
            setCreatingRegister(false)
            setForm((current) => ({ ...current, cashRegisterId: register.id }))
            showToast(`Kassa yaradıldı: ${register.name} (${register.code})`)
          }}
        />
      ) : null}
    </Card>
  )
}
