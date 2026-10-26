import { useEffect, useState } from 'react'
import { HubConnectionState } from '@microsoft/signalr'
import { AdminBadge, AdminChips, AdminError, AdminLoading, AdminPage } from '@/features/admin/components/AdminUi'
import {
  clearTeamTicket,
  fetchAdminTicket,
  fetchAdminTickets,
  markTeamRead,
  replyToTicket,
  resolveTicket,
} from '@/features/support/api/support-api'
import { newerTicket, usePageVisible, useSupportHub } from '@/features/support/api/use-support-hub'
import { ChatComposer } from '@/features/support/components/ChatComposer'
import { ChatMessages } from '@/features/support/components/ChatMessages'
import { ClearChatModal } from '@/features/support/components/ClearChatModal'
import {
  SENDER_SUPPORT,
  SENDER_USER,
  TICKET_OPEN,
  TICKET_RESOLVED,
  TICKET_STATUS_LABELS,
} from '@/features/support/lib/support-status'
import { visibleMessages } from '@/features/support/lib/support-view'
import { useApiQuery } from '@/hooks/use-api-query'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { cn } from '@/lib/cn'
import { fromApiDate } from '@/lib/date'
import { styles } from '@/lib/styles'
import { showToast } from '@/store/toast-store'

const FILTERS = [
  { id: 'active', label: 'Aktiv' },
  { id: 'resolved', label: 'Həll olunmuş' },
  { id: 'all', label: 'Hamısı' },
]

const STATUS_TONES = { open: 'warning', pending: 'muted', resolved: 'success' }

function formatWhen(value) {
  const date = new Date(fromApiDate(value))
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// Support desk: tickets from every company on the left (waiting ones first), the selected conversation on the right
// with a reply box and "Sorğunu həll et". Both update live over SignalR.
export function AdminSupportPage() {
  const [filter, setFilter] = useState('active')
  const [selectedId, setSelectedId] = useState(null)
  // The newest pushed copy of the selected ticket, over the one loaded when it was selected.
  const [liveTicket, setLiveTicket] = useState(null)
  const [busy, setBusy] = useState(false)
  const [clearing, setClearing] = useState(false)
  const list = useApiQuery(fetchAdminTickets, { status: filter })
  const detail = useApiQuery(fetchSelectedTicket, { id: selectedId })
  const visible = usePageVisible()
  useDocumentTitle('Dəstək çatı')

  const hubState = useSupportHub({
    onTicketUpdated: (ticket) => {
      // Any ticket can change the list (new ticket, new message, status); the open one updates in place.
      list.reload()
      if (ticket.id === selectedId) {
        setLiveTicket((current) => newerTicket(current, ticket))
      }
    },
    // After a gap, or regularly while offline: the list and the open conversation as the server has them now.
    onCatchUp: async () => {
      list.reload()

      if (!selectedId) {
        return
      }

      try {
        const fresh = await fetchAdminTicket({ id: selectedId })
        setLiveTicket((current) => (fresh.id === selectedId ? newerTicket(current, fresh) : current))
      } catch {
        // Offline too: the next catch-up tries again.
      }
    },
  })

  const tickets = list.data ?? []
  const loadedTicket = selectedId && detail.data?.id === selectedId ? detail.data : null
  const ticket = liveTicket?.id === selectedId ? newerTicket(loadedTicket, liveTicket) : loadedTicket
  const waiting = tickets.filter((item) => item.status === TICKET_OPEN).length
  const shown = visibleMessages(ticket)
  const unreadFromUser = shown.some((message) => message.senderType === SENDER_USER && !message.isRead)
  const ticketId = ticket?.id

  // The open conversation counts as read while the tab is in front; the user sees ✓✓ at once.
  useEffect(() => {
    if (visible && unreadFromUser && ticketId) {
      markTeamRead(ticketId).catch(() => {
        // Not critical: retried on the next update.
      })
    }
  }, [visible, unreadFromUser, ticketId])

  function select(id) {
    setSelectedId(id)
    setLiveTicket(null)
  }

  async function handleReply(message) {
    try {
      const updated = await replyToTicket(selectedId, message)
      setLiveTicket((current) => newerTicket(current, updated))
      return true
    } catch (replyError) {
      showToast(replyError.message, 'error')
      return false
    }
  }

  async function handleResolve() {
    setBusy(true)

    try {
      const updated = await resolveTicket(selectedId)
      setLiveTicket((current) => newerTicket(current, updated))
      showToast('Sorğu həll olundu kimi qeyd edildi.')
    } catch (resolveError) {
      showToast(resolveError.message, 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AdminPage
      title="Dəstək çatı"
      description={
        hubState === HubConnectionState.Connected
          ? 'Şirkət istifadəçilərinin müraciətləri · canlı bağlantı'
          : 'Şirkət istifadəçilərinin müraciətləri · canlı bağlantı yoxdur, yeniləmək üçün səhifəni təzələyin'
      }
      action={<AdminChips label="Status filtri" options={FILTERS} value={filter} onChange={setFilter} />}
    >
      <div className={styles.supportDesk}>
        <aside className={styles.supportDeskList} aria-label="Müraciətlər">
          <p className={styles.adminKpiLabel}>
            {list.data ? `${tickets.length} müraciət · ${waiting} cavab gözləyir` : 'Müraciətlər'}
          </p>
          {list.error && !list.data ? <AdminError message={list.error} onRetry={list.reload} /> : null}
          {!list.data && list.isLoading ? <AdminLoading /> : null}
          {list.data && tickets.length === 0 ? <p className={styles.adminTableState}>Müraciət yoxdur.</p> : null}
          {tickets.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => select(item.id)}
              className={cn(styles.supportDeskItem, item.id === selectedId && styles.supportDeskItemActive)}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-white">{item.companyName}</span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {item.unreadCount > 0 && item.id !== selectedId ? (
                    <span className={styles.supportUnreadCount}>{item.unreadCount}</span>
                  ) : null}
                  <AdminBadge tone={STATUS_TONES[item.status]}>{TICKET_STATUS_LABELS[item.status]}</AdminBadge>
                </span>
              </span>
              <span className="truncate text-xs text-slate-400">
                {item.userName} · {item.userEmail}
              </span>
              <span className="line-clamp-2 text-xs text-slate-300">{item.lastMessage}</span>
              <span className="text-[11px] text-slate-500">
                {formatWhen(item.lastMessageAt)} · {item.messageCount} mesaj
              </span>
            </button>
          ))}
        </aside>

        <section className={styles.supportDeskChat} aria-label="Çat">
          {!selectedId ? (
            <p className={styles.adminTableState}>Soldan müraciət seçin.</p>
          ) : !ticket ? (
            detail.error ? <AdminError message={detail.error} onRetry={detail.reload} /> : <AdminLoading />
          ) : (
            <>
              <header className={styles.supportDeskChatHeader}>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-100">{ticket.companyName}</p>
                  <p className="truncate text-xs text-slate-400">
                    {ticket.userName} · {ticket.userEmail} · açılıb {formatWhen(ticket.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {shown.length > 0 ? (
                    <button type="button" className={styles.adminButtonGhost} onClick={() => setClearing(true)}>
                      🗑 Söhbəti təmizlə
                    </button>
                  ) : null}
                  {ticket.status === TICKET_RESOLVED ? (
                    <span className={styles.supportResolvedPill}>✓ Həll olunub</span>
                  ) : (
                    <button type="button" className={styles.adminButtonPrimary} onClick={handleResolve} disabled={busy}>
                      {busy ? 'Yadda saxlanılır…' : 'Sorğunu həll et'}
                    </button>
                  )}
                </div>
              </header>
              <ChatMessages
                messages={shown}
                mine={SENDER_SUPPORT}
                emptyText={ticket.clearedAt ? 'Söhbət ekranınızdan təmizlənib. Yeni mesajlar burada görünəcək.' : 'Mesaj yoxdur.'}
              />
              <ChatComposer
                placeholder={
                  ticket.status === TICKET_RESOLVED ? 'Yazsanız, müraciət yenidən açılacaq…' : 'Cavabınızı yazın…'
                }
                onSend={handleReply}
              />
            </>
          )}
        </section>
      </div>
      {clearing && ticket ? (
        <ClearChatModal
          onClose={() => setClearing(false)}
          onConfirm={async () => {
            const cleared = await clearTeamTicket(ticket.id)
            setLiveTicket((current) => newerTicket(current, cleared))
            setClearing(false)
            showToast('Söhbət ekranınızdan təmizləndi.')
          }}
        />
      ) : null}
    </AdminPage>
  )
}

// useApiQuery runs on every params change; without a selection there is nothing to load.
function fetchSelectedTicket({ id }) {
  return id ? fetchAdminTicket({ id }) : Promise.resolve(null)
}
