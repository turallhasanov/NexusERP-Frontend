import { Navigate, useLocation } from 'react-router-dom'
import { AuthPanel } from '@/components/layout/AuthPanel'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { homeRoute } from '@/lib/home-route'
import { useAuthStore } from '@/store/auth-store'

export function LoginPage() {
  const auth = useAuthStore()
  const location = useLocation()
  useDocumentTitle('Giriş')

  if (auth.token) {
    return <Navigate to={homeRoute(auth)} replace />
  }

  return (
    <AuthPanel title="Giriş" description="Hesabınızla davam edin.">
      <LoginForm initialEmail={location.state?.email} notice={location.state?.notice} />
    </AuthPanel>
  )
}
