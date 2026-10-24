import { useEffect, useRef } from 'react'
import { styles } from '@/lib/styles'

// How far the ring closes the gap to the pointer each frame; lower trails more.
const RING_FOLLOW = 0.22
const RING_PRESSED_SCALE = 0.75
// Ring size per hover target: elements opt in with data-cursor="info" or data-cursor="action".
const RING_SCALE = { info: 1.7, action: 1.3 }

// Glowing ring + dot that replace the system cursor while the splash is open. The dot sits exactly on
// the pointer; the ring eases after it. Over a [data-cursor] element the ring grows and recolours, and over
// data-cursor="info" a hint label follows the pointer. Positions are written straight to the DOM in a rAF
// loop, so moving the mouse never re-renders React. Mouse only: on touch screens nothing is shown.
export function SplashCursor() {
  const ringRef = useRef(null)
  const dotRef = useRef(null)
  const labelRef = useRef(null)

  useEffect(() => {
    const ring = ringRef.current
    const dot = dotRef.current
    const label = labelRef.current
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let scale = 1
    let pressed = false
    let visible = false
    let variant = ''
    let frame = 0

    function setVisible(next) {
      visible = next
      ring.style.opacity = next ? '1' : '0'
      dot.style.opacity = next ? '1' : '0'
      label.style.opacity = next && variant === 'info' ? '1' : '0'
    }

    function setVariant(next) {
      if (next === variant) {
        return
      }
      variant = next
      ring.dataset.variant = next
      label.style.opacity = visible && next === 'info' ? '1' : '0'
    }

    function onPointerMove(event) {
      if (event.pointerType !== 'mouse') {
        return
      }
      target.x = event.clientX
      target.y = event.clientY
      setVariant(event.target.closest?.('[data-cursor]')?.dataset.cursor ?? '')
      if (!visible) {
        // First sighting (or back from outside the window): start the ring on the pointer, not off-screen.
        current.x = target.x
        current.y = target.y
        setVisible(true)
      }
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`
      label.style.transform = `translate3d(${target.x + 30}px, ${target.y + 22}px, 0)`
    }

    function onPointerDown(event) {
      if (event.pointerType === 'mouse') {
        pressed = true
      }
    }

    function onPointerUp() {
      pressed = false
    }

    function onPointerLeave() {
      setVisible(false)
    }

    function loop() {
      current.x += (target.x - current.x) * RING_FOLLOW
      current.y += (target.y - current.y) * RING_FOLLOW
      const goal = (RING_SCALE[variant] ?? 1) * (pressed ? RING_PRESSED_SCALE : 1)
      scale += (goal - scale) * 0.2
      ring.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%) scale(${scale})`
      frame = requestAnimationFrame(loop)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    frame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <>
      <div ref={ringRef} className={styles.splashCursorRing} aria-hidden="true" />
      <div ref={dotRef} className={styles.splashCursorDot} aria-hidden="true" />
      <div ref={labelRef} className={styles.splashCursorLabel} aria-hidden="true">
        Məlumat üçün klikləyin
      </div>
    </>
  )
}
