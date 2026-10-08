const MONTHS_AZ = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'İyun',
  'İyul',
  'Avqust',
  'Sentyabr',
  'Oktyabr',
  'Noyabr',
  'Dekabr',
]

export function monthKey(createdAt) {
  const date = new Date(createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function formatMonth(key) {
  const [year, month] = key.split('-')
  return `${MONTHS_AZ[Number(month) - 1]} ${year}`
}

export function isSameDay(createdAt, now = new Date()) {
  const date = new Date(createdAt)
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function toDateInput(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDate(value) {
  if (!value) {
    return null
  }

  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number)

  if (!year || !month || !day) {
    return null
  }

  return new Date(year, month - 1, day)
}

export function formatDate(value) {
  const date = parseDate(value)

  if (!date) {
    return '—'
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}.${month}.${date.getFullYear()}`
}

export function currentMonthKey(now = new Date()) {
  return monthKey(now)
}

export function isEmployedInMonth(employee, key) {
  const hired = parseDate(employee.hiredAt)

  if (!hired) {
    return false
  }

  const [year, month] = key.split('-').map(Number)
  const monthEnd = new Date(year, month, 0)

  if (hired > monthEnd) {
    return false
  }

  const left = parseDate(employee.leftAt)

  if (!left) {
    return true
  }

  return left > monthEnd
}
