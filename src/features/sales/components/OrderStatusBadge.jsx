import { Badge } from '@/components/ui/badge'

const STATUS_LABELS = {
  open: 'Açıq',
  closed: 'Bağlı',
}

export function OrderStatusBadge({ status }) {
  const isOpen = status === 'open'

  return (
    <Badge variant={isOpen ? 'warning' : 'muted'}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
