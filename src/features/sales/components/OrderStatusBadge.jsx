import { Badge } from '@/components/ui/badge'
import { DOCUMENT_STATUS_LABELS } from '@/features/sales/api/sales-dekont'

const STATUS_VARIANTS = { approved: 'success', cancelled: 'muted' }

// Status tag for sale and purchase documents: draft (stock untouched), approved, or cancelled.
export function OrderStatusBadge({ status }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? 'warning'}>
      {DOCUMENT_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
