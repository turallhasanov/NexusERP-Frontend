import { useCallback, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { fetchSystemInfo } from '@/features/splash/api/fetch-system-info'
import { SplashScreen } from '@/features/splash/components/SplashScreen'
import { markSplashSeen } from '@/features/splash/lib/splash-seen'
import { useApiQuery } from '@/hooks/use-api-query'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { homeRoute } from '@/lib/home-route'
import { routes } from '@/lib/routes'
import { useAuthStore } from '@/store/auth-store'

// Without a click the intro plays for 15 s, then continues to /login on its own.
const AUTO_ENTER_MS = 15000
// Keep in sync with the duration in styles.splashScreen.
const FADE_MS = 500

export function SplashPage() {
  const auth = useAuthStore()

  // Signed-in users never see the splash; they go where /login would send them.
  if (auth.token) {
    return <Navigate to={homeRoute(auth)} replace />
  }

  return <SplashIntro />
}

function SplashIntro() {
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)
  // A missing footer is fine; the splash must never block sign-in because the API is unreachable.
  const { data: info } = useApiQuery(fetchSystemInfo)
  useDocumentTitle('Xoş gəlmisiniz')

  const enter = useCallback(() => setLeaving(true), [])

  useEffect(() => {
    markSplashSeen()
  }, [])

  // The countdown pauses while the about dialog is open and starts over once it closes,
  // so nobody is sent to /login halfway through reading it.
  useEffect(() => {
    if (infoOpen) {
      return undefined
    }
    const timer = setTimeout(enter, AUTO_ENTER_MS)
    return () => clearTimeout(timer)
  }, [enter, infoOpen])

  useEffect(() => {
    if (!leaving) {
      return undefined
    }
    const timer = setTimeout(() => navigate(routes.login, { replace: true }), FADE_MS)
    return () => clearTimeout(timer)
  }, [leaving, navigate])

  return (
    <SplashScreen info={info} leaving={leaving} infoOpen={infoOpen} onEnter={enter} onInfoOpenChange={setInfoOpen} />
  )
}
