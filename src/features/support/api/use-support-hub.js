import { HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { API_BASE_URL } from '@/services/api-client'
import { useAuthStore } from '@/store/auth-store'

// The API serves the hub next to /api: http://host:port/hubs/support.
const HUB_URL = `${API_BASE_URL.replace(/\/api\/?$/, '')}/hubs/support`

// Backoff between connection attempts: quick at first, then every 10 seconds, for as long as the page is open.
// (SignalR's default reconnect gives up after four tries, about 42 seconds, and then stays disconnected.)
const RETRY_DELAYS_MS = [0, 1000, 3000, 5000]
const MAX_RETRY_DELAY_MS = 10000

function retryDelay(attempt) {
  return RETRY_DELAYS_MS[attempt] ?? MAX_RETRY_DELAY_MS
}

// While there is no live connection, the chat still fetches updates this often.
export const FALLBACK_REFRESH_MS = 10000

// Live support chat over SignalR. The server pushes "ticketUpdated" (a whole ticket with its messages) to the ticket's
// owner and to the platform team after every change; writes still go through the REST API.
//
// The connection never gives up: a failed first start, a dropped connection and a closed one are all retried with
// backoff. `onCatchUp` fetches the latest state: after every (re)connect that followed a gap (to pick up what was
// pushed meanwhile), and every FALLBACK_REFRESH_MS while there is no live connection, so messages keep arriving even
// when the hub cannot be reached. Returns the connection state.
export function useSupportHub({ onTicketUpdated, onCatchUp }) {
  const { token } = useAuthStore()
  const [state, setState] = useState(HubConnectionState.Disconnected)
  const handlers = useRef({ onTicketUpdated, onCatchUp })

  useEffect(() => {
    handlers.current = { onTicketUpdated, onCatchUp }
  })

  useEffect(() => {
    if (!token) {
      return undefined
    }

    const connection = new HubConnectionBuilder()
      // The token travels as ?access_token= (WebSockets cannot send headers); no cookies, so plain CORS suffices.
      .withUrl(HUB_URL, { accessTokenFactory: () => token, withCredentials: false })
      .withAutomaticReconnect({ nextRetryDelayInMilliseconds: ({ previousRetryCount }) => retryDelay(previousRetryCount) })
      .configureLogging(LogLevel.Warning)
      .build()

    let stopped = false
    let retryTimer = null
    // Set once a connection attempt failed or a connection dropped: the next connect must catch up.
    let missedUpdates = false

    // A block body on purpose: a handler that returns a value is treated by SignalR as an (unexpected) result.
    connection.on('ticketUpdated', (ticket) => {
      handlers.current.onTicketUpdated?.(ticket)
    })

    connection.onreconnecting(() => {
      missedUpdates = true
      setState(HubConnectionState.Reconnecting)
    })
    connection.onreconnected(() => {
      setState(HubConnectionState.Connected)
      handlers.current.onCatchUp?.()
    })
    // Automatic reconnect only covers a connection that was up; after it gives up, or if the server closed it,
    // start over from scratch.
    connection.onclose(() => {
      setState(HubConnectionState.Disconnected)
      if (!stopped) {
        missedUpdates = true
        scheduleStart(0)
      }
    })

    function scheduleStart(attempt) {
      clearTimeout(retryTimer)
      retryTimer = setTimeout(() => void start(attempt), retryDelay(attempt))
    }

    async function start(attempt) {
      if (stopped || connection.state !== HubConnectionState.Disconnected) {
        return
      }

      setState(HubConnectionState.Connecting)

      try {
        await connection.start()

        if (stopped) {
          return
        }

        setState(HubConnectionState.Connected)
        if (missedUpdates) {
          missedUpdates = false
          handlers.current.onCatchUp?.()
        }
      } catch {
        // Unreachable API, an old server without the hub, or stopped during negotiation (unmount).
        if (!stopped) {
          missedUpdates = true
          setState(HubConnectionState.Disconnected)
          scheduleStart(attempt + 1)
        }
      }
    }

    void start(0)

    return () => {
      stopped = true
      clearTimeout(retryTimer)
      void connection.stop()
    }
  }, [token])

  // Fallback while offline: keep the conversation current by fetching it in the background.
  const live = state === HubConnectionState.Connected

  useEffect(() => {
    if (live || !token) {
      return undefined
    }

    const timer = setInterval(() => handlers.current.onCatchUp?.(), FALLBACK_REFRESH_MS)
    return () => clearInterval(timer)
  }, [live, token])

  return state
}

function subscribeVisibility(listener) {
  document.addEventListener('visibilitychange', listener)
  return () => document.removeEventListener('visibilitychange', listener)
}

// Whether the browser tab is in front: messages count as read only when someone can actually see them.
export function usePageVisible() {
  return useSyncExternalStore(subscribeVisibility, () => document.visibilityState === 'visible', () => true)
}

// The newer of two copies of a ticket. A push without new messages (a read receipt) keeps lastMessageAt, so on a tie
// the later-arriving copy (`incoming`) wins. Pushes carry no clearedAt (it is each reader's own), so the one already
// known is kept.
export function newerTicket(current, incoming) {
  if (!current || !incoming || current.id !== incoming.id) {
    return incoming ?? current
  }

  const winner = Date.parse(incoming.lastMessageAt) >= Date.parse(current.lastMessageAt) ? incoming : current
  const clearedAt = laterDate(current.clearedAt, incoming.clearedAt)

  return winner.clearedAt === clearedAt ? winner : { ...winner, clearedAt }
}

function laterDate(a, b) {
  if (!a || !b) {
    return a ?? b ?? null
  }

  return Date.parse(b) >= Date.parse(a) ? b : a
}
