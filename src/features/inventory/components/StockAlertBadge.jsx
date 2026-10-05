import { Badge } from '@/components/ui/badge'

export function StockAlertBadge({ quantity, minQuantity }) {
  const isHealthy = quantity > minQuantity

  return (
    <Badge variant={isHealthy ? 'success' : 'warning'}>
      {isHealthy ? 'Kifayətdir' : 'Kritik'}
    </Badge>
  )
}
