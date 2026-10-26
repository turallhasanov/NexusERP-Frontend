// Azerbaijani phone numbers: +994 and 9 local digits, shown as +994 (50) 000-00-00.

export const PHONE_COUNTRY_CODE = '+994'
export const PHONE_LOCAL_LENGTH = 9

// Local digits only, at most 9 (extra digits are ignored). A full "+994 50 …" or "99450…" (pasted) loses its
// country code and a trunk "0" ("050 …") is dropped, so every way people write a number ends up as the same 9
// digits. Only a whole 12-digit number counts as international: a local number may itself start with 99.
export function toLocalDigits(value) {
  let digits = String(value ?? '').replace(/\D/g, '')

  if (digits.startsWith('994') && digits.length >= PHONE_LOCAL_LENGTH + 3) {
    digits = digits.slice(3)
  }

  if (digits.startsWith('0')) {
    digits = digits.slice(1)
  }

  return digits.slice(0, PHONE_LOCAL_LENGTH)
}

// The part after the fixed +994 prefix, built up as digits arrive: "50" → "(50)", "50000" → "(50) 000",
// "500000000" → "(50) 000-00-00".
export function formatLocalPhone(digits) {
  if (!digits) {
    return ''
  }

  const operator = digits.slice(0, 2)
  const first = digits.slice(2, 5)
  const second = digits.slice(5, 7)
  const third = digits.slice(7, 9)

  let text = digits.length < 2 ? `(${operator}` : `(${operator})`

  if (first) text += ` ${first}`
  if (second) text += `-${second}`
  if (third) text += `-${third}`

  return text
}

// Sent to the API: "+994500000000", or '' when nothing was entered (the phone is optional).
export function toApiPhone(digits) {
  return digits ? `${PHONE_COUNTRY_CODE}${digits}` : ''
}

export function isCompletePhone(digits) {
  return digits.length === PHONE_LOCAL_LENGTH
}

// For tables: "+994500000000" (or any spelling of an Azerbaijani number) → "+994 (50) 000-00-00". Anything
// else, such as a foreign number saved before this format, is shown as it was stored.
export function displayPhone(value) {
  if (!value) {
    return ''
  }

  const raw = String(value).replace(/\D/g, '')
  const isAzerbaijani = (raw.length === 12 && raw.startsWith('994')) || (raw.length === 10 && raw.startsWith('0')) || raw.length === 9

  return isAzerbaijani ? `${PHONE_COUNTRY_CODE} ${formatLocalPhone(toLocalDigits(raw))}` : String(value)
}
