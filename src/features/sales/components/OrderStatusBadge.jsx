import { Badge } from '@/components/ui/badge'
import { DOCUMENT_STATUS_LABELS } from '@/features/sales/api/sales-dekont'

// Status tag for sale and purchase documents: draft (stock untouched) or approved.
export function OrderStatusBadge({ status }) {
  return (
    <Badge variant={status === 'approved' ? 'success' : 'warning'}>
      {DOCUMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
