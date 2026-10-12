import { Navigate, useLocation } from 'react-router-dom'
import { AuthPanel } from '@/components/layout/AuthPanel'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { routes } from '@/lib/routes'
import { useAuthStore } from '@/store/auth-store'

export function LoginPage() {
  const { token, activeCompanyId } = useAuthStore()
  const location = useLocation()
  useDocumentTitle('Giriş')

  if (token) {
    return <Navigate to={activeCompanyId ? routes.dashboard : routes.selectCompany} replace />
  }

  return (
    <AuthPanel title="Giriş" description="Hesabınızla davam edin.">
      <LoginForm initialEmail={location.state?.email} notice={location.state?.notice} />
    </AuthPanel>
  )
}
