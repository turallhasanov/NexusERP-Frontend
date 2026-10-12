import { toDateInput } from '@/lib/date'

export const RANGE_TODAY = 'today'
export const RANGE_WEEK = 'week'
export const RANGE_MONTH = 'month'
export const RANGE_ALL = 'all'

export const RANGE_PRESETS = [
  { id: RANGE_TODAY, label: 'Bu gün' },
  { id: RANGE_WEEK, label: 'Bu həftə' },
  { id: RANGE_MONTH, label: 'Bu ay' },
  { id: RANGE_ALL, label: 'Bütün dövr' },
]

// Preset → { from, to } as date-input values ("YYYY-MM-DD", local calendar). Weeks start on Monday.
// "All" leaves both empty (no bounds).
export function presetRange(id, now = new Date()) {
  if (id === RANGE_ALL) {
    return { from: '', to: '' }
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let start = today

  if (id === RANGE_WEEK) {
    const daysSinceMonday = (today.getDay() + 6) % 7
    start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysSinceMonday)
  } else if (id === RANGE_MONTH) {
    start = new Date(today.getFullYear(), today.getMonth(), 1)
  }

  return { from: toDateInput(start), to: toDateInput(today) }
}

function localDay(value, dayOffset = 0) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day + dayOffset)
}

// Date inputs → API query params. The server stores times in UTC, so local day bounds are sent as UTC
// instants: `from` = local midnight, `to` = the last millisecond of that local day. Empty → no bound.
export function toApiRange({ from, to }) {
  const params = {}

  if (from) {
    params.from = localDay(from).toISOString()
  }

  if (to) {
    params.to = new Date(localDay(to, 1).getTime() - 1).toISOString()
  }

  return params
}
