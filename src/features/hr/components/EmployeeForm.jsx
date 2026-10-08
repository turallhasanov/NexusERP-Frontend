import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createEmployee } from '@/features/hr/api/create-employee'
import { toDateInput } from '@/lib/date'
import { styles } from '@/lib/styles'

const DEPARTMENTS = ['İdarə', 'Anbar', 'Satış', 'Maliyyə']

const EMPTY_FORM = {
  name: '',
  title: '',
  department: '',
  hiredAt: toDateInput(),
  salary: '',
}

export function EmployeeForm() {
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

    createEmployee({ name, title, department, hiredAt, salary })
    setForm({ ...EMPTY_FORM, hiredAt: toDateInput() })
    setError('')
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
        {error ? <p className={styles.pageDescription}>{error}</p> : null}
        <Button type="submit">İşçini yadda saxla</Button>
      </form>
    </Card>
  )
}
