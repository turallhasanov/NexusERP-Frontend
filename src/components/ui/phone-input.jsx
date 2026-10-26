import { formatLocalPhone, PHONE_COUNTRY_CODE, toLocalDigits } from '@/lib/phone'
import { styles } from '@/lib/styles'

const isDigit = (char) => char >= '0' && char <= '9'

// Azerbaijani phone field. "+994" is fixed text outside the input, so it cannot be deleted; the input takes
// digits only and shows them as (50) 000-00-00. `value` and `onChange` work with the 9 local digits.
export function PhoneInput({ value, onChange, id, disabled = false }) {
  const shown = formatLocalPhone(value)

  function handleKeyDown(event) {
    // Letters, symbols and minus signs never reach the field; shortcuts (Ctrl+V, Ctrl+A …) still work.
    if (event.key.length === 1 && !isDigit(event.key) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault()
      return
    }

    // Backspace right after a ")", " " or "-" deletes the digit before it instead of the formatting, which
    // the next render would only put back.
    const { selectionStart, selectionEnd } = event.currentTarget

    if (event.key === 'Backspace' && selectionStart === selectionEnd && selectionStart > 0 && !isDigit(shown[selectionStart - 1])) {
      event.preventDefault()
      const digitsBefore = shown.slice(0, selectionStart).replace(/\D/g, '').length

      if (digitsBefore > 0) {
        onChange(value.slice(0, digitsBefore - 1) + value.slice(digitsBefore))
      }
    }
  }

  return (
    <div className={styles.phoneField}>
      <span className={styles.phonePrefix} aria-hidden="true">
        {PHONE_COUNTRY_CODE}
      </span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        className={styles.phoneInput}
        value={shown}
        onChange={(event) => onChange(toLocalDigits(event.target.value))}
        onKeyDown={handleKeyDown}
        placeholder="(50) 000-00-00"
        aria-label={`Telefon nömrəsi, ${PHONE_COUNTRY_CODE} ilə`}
        disabled={disabled}
      />
    </div>
  )
}
