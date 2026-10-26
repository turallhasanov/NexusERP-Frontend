import { useEffect, useRef } from 'react'
import { SENDER_BOT, SENDER_SUPPORT, SENDER_USER } from '@/features/support/lib/support-status'
import { cn } from '@/lib/cn'
import { fromApiDate } from '@/lib/date'
import { styles } from '@/lib/styles'

function formatTime(value) {
  const date = new Date(fromApiDate(value))
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString('az-AZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const BUBBLE = {
  [SENDER_USER]: styles.chatBubbleUser,
  [SENDER_SUPPORT]: styles.chatBubbleSupport,
}

// ✓ sent, ✓✓ (blue) read by the other side.
function ReadTicks({ message }) {
  return message.isRead ? (
    <span className={styles.chatTicksRead} title={`Oxundu · ${formatTime(message.readAt)}`}>
      ✓✓ Oxundu
    </span>
  ) : (
    <span className={styles.chatTicks} title="Göndərildi">
      ✓
    </span>
  )
}

// One conversation, oldest first. `mine` is the sender type drawn on the right (the reader's own messages, with read
// ticks); bot messages get the 🤖 avatar and a glass card. `typing` shows the bot's three-dot indicator.
export function ChatMessages({ messages, mine, typing = false, emptyText }) {
  const endRef = useRef(null)

  // Keep the newest message in view as messages arrive.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages.length, typing])

  return (
    <div className={styles.chatMessages}>
      {messages.length === 0 && !typing ? <p className={styles.chatEmpty}>{emptyText}</p> : null}
      {messages.map((message) => {
        if (message.senderType === SENDER_BOT) {
          return (
            <div key={message.id} className={styles.chatBotRow}>
              <span className={styles.chatBotAvatar} aria-hidden="true">
                🤖
              </span>
              <div className="min-w-0">
                <span className={styles.chatMeta}>
                  {message.sentAt ? `${message.senderName} · ${formatTime(message.sentAt)}` : message.senderName}
                </span>
                <p className={styles.chatBotCard}>{message.messageText}</p>
              </div>
            </div>
          )
        }

        const isMine = message.senderType === mine

        return (
          <div key={message.id} className={cn(styles.chatRow, isMine ? 'items-end' : 'items-start')}>
            <span className={styles.chatMeta}>
              {message.senderName} · {formatTime(message.sentAt)}
            </span>
            <p className={cn(styles.chatBubble, BUBBLE[message.senderType])}>{message.messageText}</p>
            {isMine ? <ReadTicks message={message} /> : null}
          </div>
        )
      })}
      {typing ? (
        <div className={styles.chatBotRow}>
          <span className={styles.chatBotAvatar} aria-hidden="true">
            🤖
          </span>
          <p className={styles.chatBotCard} aria-label="Yazır…">
            <span className={styles.chatTyping}>
              <span />
              <span />
              <span />
            </span>
          </p>
        </div>
      ) : null}
      <div ref={endRef} />
    </div>
  )
}
