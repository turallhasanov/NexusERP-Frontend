import { Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { SIZE_OPTIONS, formatProductName } from '@/lib/product-name'
import { styles } from '@/lib/styles'

// Optional color and size of a product, and the name they make: "Name (Color / Size)". Used by the create form (light) and
// the edit dialog (admin modal).
export function ProductVariantFields({ name, color, size, onColorChange, onSizeChange, theme = 'light' }) {
  // A size that is not in the list (e.g. "42" read from an existing name) stays selectable.
  const sizes = size && !SIZE_OPTIONS.includes(size) ? [...SIZE_OPTIONS, size] : SIZE_OPTIONS
  const fullName = formatProductName(name, color, size)
  const showPreview = Boolean(name?.trim()) && fullName !== name.trim()

  const sizeOptions = [
    <option key="" value="">
      Seçilməyib
    </option>,
    ...sizes.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    )),
  ]

  if (theme === 'admin') {
    return (
      <>
        <div className="grid grid-cols-2 gap-3">
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Rəng (istəyə bağlı)</span>
            <input
              className={styles.adminInput}
              value={color}
              onChange={(event) => onColorChange(event.target.value)}
              placeholder="Məs.: Yaşıl"
              maxLength={40}
              autoComplete="off"
            />
          </label>
          <label className={styles.adminField}>
            <span className={styles.adminFieldLabel}>Ölçü (istəyə bağlı)</span>
            <select
              className={`${styles.adminInput} [&>option]:text-neutral-900`}
              value={size}
              onChange={(event) => onSizeChange(event.target.value)}
            >
              {sizeOptions}
            </select>
          </label>
        </div>
        {showPreview ? <p className={styles.adminFormHint}>Məhsulun adı: {fullName}</p> : null}
      </>
    )
  }

  return (
    <>
      <Field label="Rəng (istəyə bağlı)">
        <Input value={color} onChange={(event) => onColorChange(event.target.value)} placeholder="Məs.: Yaşıl" maxLength={40} />
      </Field>
      <Field label="Ölçü (istəyə bağlı)">
        <select className={styles.input} value={size} onChange={(event) => onSizeChange(event.target.value)}>
          {sizeOptions}
        </select>
        {showPreview ? <span className={styles.fieldHint}>Məhsulun adı: {fullName}</span> : null}
      </Field>
    </>
  )
}
