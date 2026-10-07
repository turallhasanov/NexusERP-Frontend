import { toggleOrderStatus } from '@/store/orders-store'

export function setOrderStatus(orderId) {
  toggleOrderStatus(orderId)

  return { ok: true }
}
