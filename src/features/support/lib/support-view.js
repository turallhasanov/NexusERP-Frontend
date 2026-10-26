import { SENDER_BOT } from '@/features/support/lib/support-status'

// The messages this reader still sees: those sent after their own "Söhbəti təmizlə" (ticket.clearedAt).
export function visibleMessages(ticket) {
  const messages = ticket?.messages ?? []

  if (!ticket?.clearedAt) {
    return messages
  }

  const cutoff = Date.parse(ticket.clearedAt)
  return messages.filter((message) => Date.parse(message.sentAt) > cutoff)
}

// Shown by the widget when there is nothing to see yet (no ticket, or a cleared one); not stored on the server.
export const WELCOME_MESSAGE = {
  id: 'welcome',
  senderType: SENDER_BOT,
  senderName: 'NexusERP Bot',
  messageText: 'Salam! 👋 NexusERP Dəstək Xidmətinə xoş gəlmisiniz. Sualınızı və ya probleminizi yazın — mütəxəssislərimiz sizə buradan cavab verəcəkdir. 🚀',
  sentAt: null,
  isRead: true,
  readAt: null,
}
