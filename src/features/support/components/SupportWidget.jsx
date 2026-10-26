import { useEffect, useState } from 'react'
import { HubConnectionState } from '@microsoft/signalr'
import { clearMyTicket, createTicket, fetchMyTickets, markMyTicketRead, sendTicketMessage } from '@/features/support/api/support-api'
import { newerTicket, usePageVisible, useSupportHub } from '@/features/support/api/use-support-hub'
import { ChatComposer } from '@/features/support/components/ChatComposer'
import { ChatMessages } from '@/features/support/components/ChatMessages'
import { ClearChatModal } from '@/features/support/components/ClearChatModal'
import { SENDER_BOT, SENDER_USER, TICKET_RESOLVED } from '@/features/support/lib/support-status'
import { visibleMessages, WELCOME_MESSAGE } from '@/features/support/lib/support-view'
import { useApiQuery } from '@/hooks/use-api-query'
import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

// How long the bot "types" before its greeting shows; the greeting is already in the server's response.
const BOT_DELAY_MS = 800

// Support chat in the bottom-right corner of the company app: the user's newest ticket, updated live over SignalR
// (the team's answers, read receipts), the bot's greeting on a new ticket, and a green "Sorğu həll olundu" once the team
// resolves it.
export function SupportWidget() {
  const [open, setOpen] = useState(false)
  // The newest copy of the ticket from a send or a push, over the one loaded at start.
  const [liveTicket, setLiveTicket] = useState(null)
  const [sendError, setSendError] = useState('')
  const [hiddenBotId, setHiddenBotId] = useState(null)
  const [clearing, setClearing] = useState(false)
  const query = useApiQuery(fetchMyTickets)
  const visible = usePageVisible()

  const hubState = useSupportHub({
    onTicketUpdated: (ticket) => setLiveTicket((current) => newerTicket(current, ticket)),
    // After a gap, or regularly while offline: the newest ticket as the server has it now (it wins ties, so read
    // receipts update too).
    onCatchUp: async () => {
      try {
        const [newest] = await fetchMyTickets()
        if (newest) {
          setLiveTicket((current) => newerTicket(current, newest))
        }
      } catch {
        // Offline too: the next catch-up tries again.
      }
    },
  })

  const serverTicket = query.data?.[0] ?? null
  // The live copy wins for the same ticket when at least as new; a different one (just opened) wins when it is newer.
  const ticket = !liveTicket
    ? serverTicket
    : serverTicket?.id === liveTicket.id
      ? newerTicket(serverTicket, liveTicket)
      : !serverTicket || Date.parse(liveTicket.lastMessageAt) >= Date.parse(serverTicket.lastMessageAt)
        ? liveTicket
        : serverTicket
  const loaded = query.data !== null || Boolean(query.error)
  const error = sendError || (query.data ? '' : query.error)

  // After "Söhbəti təmizlə" only newer messages show; with nothing to show, the bot's welcome stands ready.
  const shown = visibleMessages(ticket)
  const isResolved = ticket?.status === TICKET_RESOLVED
  const messages = shown.length > 0 ? shown.filter((message) => message.id !== hiddenBotId) : hiddenBotId ? [] : [WELCOME_MESSAGE]
  const unreadIncoming = shown.some((message) => message.senderType !== SENDER_USER && !message.isRead)
  const ticketId = ticket?.id

  // Seen when the chat is open and the tab is in front; the server pushes the ticket back with the new read state.
  useEffect(() => {
    if (open && visible && unreadIncoming && ticketId) {
      markMyTicketRead(ticketId).catch(() => {
        // Not critical: it is retried the next time the chat updates.
      })
    }
  }, [open, visible, unreadIncoming, ticketId])

  async function handleSend(message) {
    setSendError('')

    try {
      // A resolved (or no) ticket: the message opens a new one, and the bot greets it.
      if (!ticket || isResolved) {
        const created = await createTicket(message)
        const greeting = created.messages.find((item) => item.senderType === SENDER_BOT)

        if (greeting) {
          setHiddenBotId(greeting.id)
          setTimeout(() => setHiddenBotId(null), BOT_DELAY_MS)
        }

        setLiveTicket(created)
      } else {
        const updated = await sendTicketMessage(ticket.id, message)
        setLiveTicket((current) => newerTicket(current, updated))
      }

      return true
    } catch (sendFailure) {
      setSendError(sendFailure.message)
      return false
    }
  }

  return (
    <div className={styles.supportDock}>
      {open ? (
        <section className={styles.supportPanel} role="dialog" aria-label="Dəstək çatı">
          <header className={styles.supportHeader}>
            <div className="min-w-0">
              <p className={styles.supportTitle}>Dəstək</p>
              <p className={styles.supportSubtitle}>
                <span
                  className={cn(styles.liveDot, hubState === HubConnectionState.Connected ? styles.liveDotOn : styles.liveDotOff)}
                  aria-hidden="true"
                />
                {hubState === HubConnectionState.Connected
                  ? 'Canlı bağlantı · komanda buradan cavab verir'
                  : hubState === HubConnectionState.Reconnecting
                    ? 'Bağlantı bərpa olunur…'
                    : 'Canlı bağlantı qurulur — yeniliklər hər 10 saniyədən bir yoxlanılır'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {shown.length > 0 ? (
                <button
                  type="button"
                  className={styles.dekontClose}
                  onClick={() => setClearing(true)}
                  aria-label="Söhbəti təmizlə"
                  title="Söhbəti təmizlə"
                >
                  🗑
                </button>
              ) : null}
              <button type="button" className={styles.dekontClose} onClick={() => setOpen(false)} aria-label="Bağla">
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </header>

          {isResolved && shown.length > 0 ? <p className={styles.supportResolved}>✓ Sorğu həll olundu</p> : null}

          {!loaded ? (
            <p className={styles.chatEmpty}>Yüklənir…</p>
          ) : (
            <ChatMessages
              messages={messages}
              mine={SENDER_USER}
              typing={Boolean(hiddenBotId)}
              emptyText=""
            />
          )}

          {error ? <p className={styles.supportError}>{error}</p> : null}

          <ChatComposer
            placeholder={isResolved ? 'Yeni sual yazın — yeni müraciət açılacaq…' : 'Mesajınızı yazın…'}
            onSend={handleSend}
          />
        </section>
      ) : null}

      {clearing && ticket ? (
        <ClearChatModal
          onClose={() => setClearing(false)}
          onConfirm={async () => {
            const cleared = await clearMyTicket(ticket.id)
            setLiveTicket((current) => newerTicket(current?.id === cleared.id ? current : null, cleared))
            setClearing(false)
          }}
        />
      ) : null}

      <button
        type="button"
        className={cn(styles.supportFab, open && styles.supportFabOpen)}
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Dəstək çatını bağla' : 'Dəstək çatını aç'}
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
          <path d="M4 5h16v11H9l-5 4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8 10h8M8 13h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        {!open && unreadIncoming ? <span className={styles.supportBadge} aria-label="Yeni cavab" /> : null}
      </button>
    </div>
  )
}
