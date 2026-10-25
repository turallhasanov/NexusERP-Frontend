import { useEffect, useRef } from 'react'
import { styles } from '@/lib/styles'

// The splash screen's backdrop for the sign-in pages and the admin portal: glow, light orbs, a pixel grid
// and a soft light that follows the mouse. Place it first inside a `relative` container; content after it
// needs `relative z-10` (or any positioned stacking) to sit on top.
export function GlassBackdrop() {
  const spotlightRef = useRef(null)

  // Like the splash cursor, the spotlight writes CSS variables straight to the DOM once per frame, so moving
  // the mouse never re-renders React. Touch input shows no spotlight.
  useEffect(() => {
    const spotlight = spotlightRef.current
    let frame = 0
    let x = 0
    let y = 0

    function onPointerMove(event) {
      if (event.pointerType !== 'mouse') {
        return
      }
      x = event.clientX
      y = event.clientY
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0
          spotlight.style.setProperty('--spot-x', `${x}px`)
          spotlight.style.setProperty('--spot-y', `${y}px`)
          spotlight.dataset.on = 'true'
        })
      }
    }

    function onPointerLeave() {
      spotlight.dataset.on = 'false'
    }

    window.addEventListener('pointermove', onPointerMove)
    document.documentElement.addEventListener('pointerleave', onPointerLeave)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <>
      <div className={styles.surfaceGlow} aria-hidden="true" />
      <div className={styles.surfaceOrbEmerald} aria-hidden="true" />
      <div className={styles.surfaceOrbViolet} aria-hidden="true" />
      <div className={styles.surfacePixelGrid} aria-hidden="true" />
      <div className={styles.surfacePixelDots} aria-hidden="true" />
      <div ref={spotlightRef} className={styles.surfaceSpotlight} aria-hidden="true" />
    </>
  )
}
