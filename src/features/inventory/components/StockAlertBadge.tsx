import { Badge } from '@/components/ui/badge.tsx'

type StockAlertBadgeProps = {
  quantity: number
  minQuantity: number
}

export function StockAlertBadge({ quantity, minQuantity }: StockAlertBadgeProps) {
  const isHealthy = quantity > minQuantity

  return (
    <Badge variant={isHealthy ? 'success' : 'warning'}>
      {isHealthy ? 'Kifayətdir' : 'Kritik'}
    </Badge>
  )
}
