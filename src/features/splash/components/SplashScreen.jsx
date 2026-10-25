import { useCallback, useEffect, useRef, useState } from 'react'
import { SplashCursor } from '@/features/splash/components/SplashCursor'
import { SplashInfoModal } from '@/features/splash/components/SplashInfoModal'
import { createParticleLogo } from '@/features/splash/lib/particle-logo'
import { styles } from '@/lib/styles'

// Room around the drawn mark that still counts as the sign-in button.
const MARK_PAD = 16
// Room around the drawn wordmark that still counts as the "about" button, and space for its info icon.
const WORDMARK_PAD = 12
const INFO_ICON_SPACE = 36

// Full-screen particle intro: pixels scattered over the whole viewport assemble into the logo, then a glow,
// the hints and the system info fade in. Two click targets:
// - the pixel mark (its own button, with an action cursor) or anywhere else on the screen → onEnter (sign-in);
// - the "NexusERP" wordmark or its info icon → onInfoOpenChange(true), the about dialog. No navigation.
// While the dialog is open the particles slow down and ignore the pointer. `leaving` fades the whole screen out.
export function SplashScreen({ info, leaving, infoOpen, onEnter, onInfoOpenChange }) {
  const canvasRef = useRef(null)
  const [formed, setFormed] = useState(false)
  const [layout, setLayout] = useState(null)
  // Read by the particle loop every frame; a ref so toggling the dialog does not restart the animation.
  const calmRef = useRef(infoOpen)
  // Stable, so the dialog's focus/Escape effect does not re-run on every render.
  const closeInfo = useCallback(() => onInfoOpenChange(false), [onInfoOpenChange])

  useEffect(
    () =>
      createParticleLogo(canvasRef.current, {
        onFormed: () => setFormed(true),
        onLayout: setLayout,
        isCalm: () => calmRef.current,
      }),
    [],
  )

  useEffect(() => {
    calmRef.current = infoOpen
  }, [infoOpen])

  // Enter/Space with nothing focused signs in too; on a focused button the button does its own job.
  useEffect(() => {
    if (infoOpen) {
      return undefined
    }
    function onKeyDown(event) {
      if ((event.key === 'Enter' || event.key === ' ') && document.activeElement === document.body) {
        event.preventDefault()
        onEnter()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [infoOpen, onEnter])

  function enter(event) {
    event.stopPropagation()
    onEnter()
  }

  function openInfo(event) {
    event.stopPropagation()
    onInfoOpenChange(true)
  }

  const mark = layout?.mark
  const wordmark = layout?.wordmark

  return (
    // Mouse convenience: a click anywhere signs in. Keyboard and screen-reader users get the real buttons below.
    <div className={styles.splashScreen} data-leaving={leaving} onClick={onEnter}>
      <div className={styles.splashGlow} data-on={formed} aria-hidden="true" />
      <canvas ref={canvasRef} className={styles.splashCanvas} />

      {mark && wordmark ? (
        <>
          <button
            type="button"
            data-cursor="action"
            aria-label="Daxil ol"
            className={styles.splashMarkButton}
            data-on={formed}
            style={{
              left: mark.x - MARK_PAD,
              top: mark.y - MARK_PAD,
              width: mark.width + MARK_PAD * 2,
              height: mark.height + MARK_PAD * 2,
            }}
            onClick={enter}
          />

          <button
            type="button"
            data-cursor="info"
            aria-label="NexusERP haqqında məlumat"
            className={styles.splashWordmarkButton}
            data-on={formed}
            style={{
              left: wordmark.x - WORDMARK_PAD,
              top: wordmark.y - WORDMARK_PAD,
              width: wordmark.width + WORDMARK_PAD * 2 + INFO_ICON_SPACE,
              height: wordmark.height + WORDMARK_PAD * 2,
            }}
            onClick={openInfo}
          >
            <span className={styles.splashInfoIcon} aria-hidden="true">
              i
            </span>
          </button>

          <div
            className={styles.splashLogoHints}
            data-on={formed}
            style={{ top: wordmark.y + wordmark.height + WORDMARK_PAD + 28 }}
          >
            <button
              type="button"
              data-cursor="action"
              className={styles.splashHint}
              data-on={formed}
              onClick={enter}
            >
              <span className={styles.splashHintDot} aria-hidden="true" />
              Daxil olmaq üçün loqoya klikləyin
            </button>
            <p className={styles.splashHintSecondary}>«NexusERP» yazısı — sistem haqqında məlumat</p>
          </div>
        </>
      ) : null}

      <div className={styles.splashReveal} data-on={formed}>
        <footer className={styles.splashBottom}>
          {info ? (
            <div className={styles.splashFooter}>
              <p className={styles.splashFooterMain}>
                {info.appName} · {info.version}
                {info.environment ? ` · ${info.environment}` : null}
              </p>
              <p>{info.architectureNote}</p>
              <p>{info.copyright}</p>
            </div>
          ) : null}
        </footer>
      </div>

      <SplashInfoModal info={info} open={infoOpen} onClose={closeInfo} onEnter={onEnter} />

      <SplashCursor />
    </div>
  )
}
