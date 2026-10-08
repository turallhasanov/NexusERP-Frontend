import { Badge } from '@/components/ui/badge'

const STATUS_LABELS = {
  active: 'Aktiv',
  leave: 'Məzuniyyətdə',
  left: 'İşdən çıxıb',
}

export function EmployeeStatusBadge({ status }) {
  const isActive = status === 'active'

  return (
    <Badge variant={isActive ? 'success' : 'muted'}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
