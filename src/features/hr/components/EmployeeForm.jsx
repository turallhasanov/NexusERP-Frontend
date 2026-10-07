import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { createEmployee } from '@/features/hr/api/create-employee'
import { styles } from '@/lib/styles'

const DEPARTMENTS = ['İdarə', 'Anbar', 'Satış', 'Maliyyə']

const EMPTY_FORM = {
  name: '',
  title: '',
  department: '',
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

    if (!name || !title || !department) {
      setError('Ad, vəzifə və şöbə tələb olunur.')
      return
    }

    createEmployee({ name, title, department })
    setForm(EMPTY_FORM)
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
        </div>
        {error ? <p className={styles.pageDescription}>{error}</p> : null}
        <Button type="submit">İşçini yadda saxla</Button>
      </form>
    </Card>
  )
}
