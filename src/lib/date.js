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

export const PERIOD_DAY = 'day'
export const PERIOD_MONTH = 'month'
export const PERIOD_YEAR = 'year'

export const PERIODS = [
  { id: PERIOD_DAY, label: 'Günlük' },
  { id: PERIOD_MONTH, label: 'Aylıq' },
  { id: PERIOD_YEAR, label: 'İllik' },
]

export function currentMonthKey(now = new Date()) {
  return monthKey(now)
}

export function periodLabel(period) {
  return PERIODS.find((item) => item.id === period)?.label ?? 'Aylıq'
}

export function periodColumn(period) {
  if (period === PERIOD_DAY) {
    return 'Tarix'
  }

  if (period === PERIOD_YEAR) {
    return 'İl'
  }

  return 'Ay'
}

export function periodKey(createdAt, period = PERIOD_MONTH) {
  const date = new Date(createdAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  if (period === PERIOD_DAY) {
    return `${year}-${month}-${day}`
  }

  if (period === PERIOD_YEAR) {
    return String(year)
  }

  return `${year}-${month}`
}

export function formatPeriod(key, period = PERIOD_MONTH) {
  if (period === PERIOD_YEAR) {
    return key
  }

  if (period === PERIOD_DAY) {
    return formatDate(key)
  }

  return formatMonth(key)
}

export function currentPeriodKey(period = PERIOD_MONTH, now = new Date()) {
  return periodKey(now, period)
}

export function isInPeriod(createdAt, period = PERIOD_MONTH, now = new Date()) {
  return periodKey(createdAt, period) === periodKey(now, period)
}

export function periodCardLabels(period) {
  if (period === PERIOD_DAY) {
    return {
      income: 'Bu günkü mədaxil',
      expense: 'Bu günkü məxaric',
      balance: 'Bu günkü qalıq',
      payroll: 'Bu ayın maaş',
    }
  }

  if (period === PERIOD_YEAR) {
    return {
      income: 'Bu ilin mədaxil',
      expense: 'Bu ilin məxaric',
      balance: 'Bu ilin qalıq',
      payroll: 'Bu ilin maaş',
    }
  }

  return {
    income: 'Bu ayın mədaxil',
    expense: 'Bu ayın məxaric',
    balance: 'Bu ayın qalıq',
    payroll: 'Bu ayın maaş',
  }
}

export function periodFileTag(period) {
  if (period === PERIOD_DAY) {
    return 'gunluk'
  }

  if (period === PERIOD_YEAR) {
    return 'illik'
  }

  return 'ayliq'
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

export function monthsEmployedInYear(employee, year) {
  let count = 0

  for (let month = 1; month <= 12; month += 1) {
    if (isEmployedInMonth(employee, `${year}-${String(month).padStart(2, '0')}`)) {
      count += 1
    }
  }

  return count
}
