import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createEmployee } from '@/features/hr/api/employees-api'
import { DEPARTMENTS } from '@/features/hr/lib/hr-options'
import { toDateInput } from '@/lib/date'
import { styles } from '@/lib/styles'
import { useStoresStore } from '@/store/stores-store'
import { showToast } from '@/store/toast-store'

const EMPTY_FORM = {
  name: '',
  title: '',
  department: '',
  hiredAt: toDateInput(),
  salary: '',
  // Optional: the store whose profit the salary counts toward.
  storeId: '',
}

export function EmployeeForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const { stores } = useStoresStore()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

    const name = form.name.trim()
    const title = form.title.trim()
    const department = form.department
    const hiredAt = form.hiredAt
    const salary = Number(form.salary)

    if (!name || !title || !department || !hiredAt) {
      setError('Ad, vəzifə, şöbə və işə qəbul tarixi tələb olunur.')
      return
    }

    if (!Number.isFinite(salary) || salary <= 0) {
      setError('Maaş 0-dan böyük olmalıdır.')
      return
    }

    setError('')
    setSubmitting(true)

    try {
      const employee = await createEmployee({ name, title, department, hiredAt, salary, storeId: form.storeId })
      setForm({ ...EMPTY_FORM, hiredAt: toDateInput() })
      showToast(`İşçi əlavə edildi: ${employee.name}`)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <Field label="Ad">
            <Input
              value={form.name}
              onChange={updateField('name')}
              placeholder="Ad və soyad"
            />
          </Field>
          <Field label="Vəzifə">
            <Input
              value={form.title}
              onChange={updateField('title')}
              placeholder="Vəzifə"
            />
          </Field>
          <Field label="Şöbə">
            <select
              className={styles.input}
              value={form.department}
              onChange={updateField('department')}
            >
              <option value="">Şöbəni seçin</option>
              {DEPARTMENTS.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>
          </Field>
          <Field label="İşə qəbul">
            <Input type="date" value={form.hiredAt} onChange={updateField('hiredAt')} />
          </Field>
          <Field label="Mağaza (istəyə bağlı)">
            <select className={styles.input} value={form.storeId} onChange={updateField('storeId')}>
              <option value="">Ümumi (ofis, rəhbərlik)</option>
              {stores
                .filter((store) => store.isActive !== false)
                .map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Maaş (₼)">
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.salary}
              onChange={updateField('salary')}
              placeholder="0.00"
            />
          </Field>
        </div>
        {error ? <p className={styles.formError}>{error}</p> : null}
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Yadda saxlanılır…' : 'İşçini yadda saxla'}
        </Button>
      </form>
    </Card>
  )
}
