import { useEffect, useRef, useState } from 'react'
import { styles } from '@/lib/styles'

const EMOJIS = [
  '😊', '😀', '😁', '😂', '🙂', '😉', '😍', '🤔',
  '😅', '😢', '😡', '😮', '🙏', '👍', '👎', '👋',
  '👏', '🤝', '💪', '🙌', '✅', '❌', '⚠️', '❗',
  '❓', '🚀', '🔥', '⭐', '🎉', '💡', '📌', '📎',
  '📦', '🧾', '💰', '💳', '📊', '📈', '🛒', '🏪',
  '⏳', '⏰', '📅', '📞', '✉️', '🔒', '🔧', '❤️',
]

// 😊 button with a small dark glass grid; `onPick` receives the chosen emoji. Escape or a click outside closes it.
export function EmojiPicker({ onPick, disabled = false }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) {
      return undefined
    }

    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative shrink-0">
      <button
        type="button"
        className={styles.chatEmojiButton}
        onClick={() => setOpen((current) => !current)}
        disabled={disabled}
        aria-label="Emoji əlavə et"
        aria-expanded={open}
      >
        😊
      </button>
      {open ? (
        <div className={styles.chatEmojiPanel} role="dialog" aria-label="Emoji seçin">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={styles.chatEmojiItem}
              onClick={() => {
                onPick(emoji)
                setOpen(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
