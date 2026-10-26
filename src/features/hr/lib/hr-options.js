import { formatDate } from '@/lib/date'

// Departments offered by the employee forms; an employee keeps a department outside this list.
export const DEPARTMENTS = ['İdarə', 'Anbar', 'Satış', 'Maliyyə']

// Leave types the API accepts (LeaveType, camelCase).
export const LEAVE_TYPES = [
  { id: 'annual', label: 'İllik məzuniyyət' },
  { id: 'unpaid', label: 'Ödənişsiz məzuniyyət' },
  { id: 'study', label: 'Təhsil məzuniyyəti' },
  { id: 'social', label: 'Sosial məzuniyyət (analıq, uşağa qulluq)' },
  { id: 'other', label: 'Digər' },
]

export function leaveTypeLabel(id) {
  return LEAVE_TYPES.find((type) => type.id === id)?.label ?? 'Məzuniyyət'
}

// Common reasons; the server stores the text, so "Digər" lets the user write their own.
export const TERMINATION_REASONS = [
  'Öz istəyi ilə',
  'Əmək müqaviləsinin müddətinin bitməsi',
  'Ştat ixtisarı',
  'Tərəflərin qarşılıqlı razılığı ilə',
  'Sınaq müddətinin nəticəsi qənaətbəxş olmadığına görə',
  'Əmək vəzifələrinin kobud şəkildə pozulmasına görə',
]

export const OTHER_REASON = 'other'

// "26.10.2026 – 08.11.2026"
export function formatDateRange(start, end) {
  return `${formatDate(start)} – ${formatDate(end)}`
}

// Calendar days in an inclusive "YYYY-MM-DD" range, or 0 when the range is incomplete or reversed.
export function daysInclusive(start, end) {
  if (!start || !end) {
    return 0
  }

  const days = Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000) + 1
  return days > 0 ? days : 0
}
