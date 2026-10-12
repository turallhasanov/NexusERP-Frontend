import { useEffect, useState } from 'react'

// Seconds left until a deadline, updated every second. start(seconds) sets a new deadline.
export function useCountdown(initialSeconds = 0) {
  const [deadline, setDeadline] = useState(() => Date.now() + initialSeconds * 1000)
  const [now, setNow] = useState(() => Date.now())
  const secondsLeft = Math.max(0, Math.ceil((deadline - now) / 1000))

  useEffect(() => {
    if (secondsLeft <= 0) {
      return undefined
    }

    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  function start(seconds) {
    const current = Date.now()
    setNow(current)
    setDeadline(current + seconds * 1000)
  }

  return { secondsLeft, start }
}
