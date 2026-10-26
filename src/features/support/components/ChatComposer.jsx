import { useRef, useState } from 'react'
import { EmojiPicker } from '@/features/support/components/EmojiPicker'
import { styles } from '@/lib/styles'

// Message box: Enter sends, Shift+Enter is a new line, 😊 inserts an emoji at the cursor. `onSend` returns true when
// the message went out.
export function ChatComposer({ placeholder, disabled = false, onSend }) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const inputRef = useRef(null)

  async function send() {
    const message = text.trim()

    if (!message || sending) {
      return
    }

    setSending(true)
    const sent = await onSend(message)
    setSending(false)

    if (sent) {
      setText('')
    }
  }

  function insertEmoji(emoji) {
    const input = inputRef.current
    const start = input?.selectionStart ?? text.length
    const end = input?.selectionEnd ?? text.length
    const next = text.slice(0, start) + emoji + text.slice(end)

    setText(next.slice(0, 2000))

    // Back to typing, with the cursor right after the emoji.
    requestAnimationFrame(() => {
      input?.focus()
      input?.setSelectionRange(start + emoji.length, start + emoji.length)
    })
  }

  return (
    <form
      className={styles.chatComposer}
      onSubmit={(event) => {
        event.preventDefault()
        void send()
      }}
    >
      <EmojiPicker onPick={insertEmoji} disabled={disabled || sending} />
      <textarea
        ref={inputRef}
        className={styles.chatInput}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            void send()
          }
        }}
        placeholder={placeholder}
        rows={2}
        maxLength={2000}
        disabled={disabled || sending}
        aria-label="Mesaj"
      />
      <button type="submit" className={styles.chatSend} disabled={disabled || sending || !text.trim()} aria-label="Göndər">
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path d="M4 12 20 4l-6 16-2.5-6.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  )
}
