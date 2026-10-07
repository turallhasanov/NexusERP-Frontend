import { styles } from '@/lib/styles'

export function PosScanner({ value, onChange, onScan, inputRef, disabled }) {
  function handleSubmit(event) {
    event.preventDefault()
    onScan(value)
  }

  return (
    <form className={styles.posScanner} onSubmit={handleSubmit}>
      <span className="font-mono text-xs tracking-[0.3em] text-emerald-400">BARKOD</span>
      <input
        ref={inputRef}
        className={styles.posScannerInput}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={disabled ? 'Əvvəlcə mağaza seçin' : 'Oxudun və ya yazıb Enter basın'}
        disabled={disabled}
        autoComplete="off"
      />
    </form>
  )
}
