import { useRef } from 'react'
import { styles } from '@/lib/styles'

const OTP_LENGTH = 6

// Six one-digit boxes for an e-mailed code. Typing moves to the next box, Backspace to the previous one,
// and pasting a whole code (or an SMS/e-mail autofill) fills every box at once.
export function OtpInput({ value, onChange, onComplete, disabled = false, autoFocus = false }) {
  const inputs = useRef([])
  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '')

  function focusBox(index) {
    inputs.current[Math.max(0, Math.min(OTP_LENGTH - 1, index))]?.focus()
  }

  function commit(next) {
    const code = next.slice(0, OTP_LENGTH)
    onChange(code)

    if (code.length === OTP_LENGTH) {
      onComplete?.(code)
    }
  }

  function handleChange(index, raw) {
    const typed = raw.replace(/\D/g, '')

    if (!typed) {
      return
    }

    // Several digits at once (paste or autofill into one box) fill from this box onwards.
    const next = (value.slice(0, index) + typed).slice(0, OTP_LENGTH)
    commit(next)
    focusBox(next.length)
  }

  function handleKeyDown(index, event) {
    if (event.key === 'Backspace') {
      event.preventDefault()

      if (digits[index]) {
        onChange(value.slice(0, index))
        return
      }

      onChange(value.slice(0, Math.max(0, index - 1)))
      focusBox(index - 1)
    } else if (event.key === 'ArrowLeft') {
      focusBox(index - 1)
    } else if (event.key === 'ArrowRight') {
      focusBox(index + 1)
    }
  }

  function handlePaste(event) {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '')

    if (pasted) {
      event.preventDefault()
      commit(pasted)
      focusBox(pasted.length)
    }
  }

  return (
    <div className={styles.otpRow} role="group" aria-label="Təsdiq kodu">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element
          }}
          className={styles.otpBox}
          value={digit}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          onFocus={(event) => event.target.select()}
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={OTP_LENGTH}
          aria-label={`Kodun ${index + 1}-ci rəqəmi`}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
        />
      ))}
    </div>
  )
}
