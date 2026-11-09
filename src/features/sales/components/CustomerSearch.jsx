import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { styles } from '@/lib/styles'

// "Müştəri axtarışı": narrows a list of sales to one customer's invoices by name, phone, code or invoice number.
export function CustomerSearch({ value, onChange, count, total }) {
  const isFiltering = value.trim() !== ''

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarSearch}>
        <Field label="Müştəri axtarışı">
          <Input
            type="search"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Müştəri adı, telefon, kod və ya qaimə nömrəsi"
          />
        </Field>
      </div>
      {isFiltering ? (
        <p className={styles.summaryHint} role="status">
          {count} / {total} qaimə
        </p>
      ) : null}
    </div>
  )
}
