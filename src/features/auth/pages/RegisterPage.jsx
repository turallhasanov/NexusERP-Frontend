import { Navigate } from 'react-router-dom'
import { AuthPanel } from '@/components/layout/AuthPanel'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { routes } from '@/lib/routes'
import { useAuthStore } from '@/store/auth-store'

export function RegisterPage() {
  const { token, activeCompanyId } = useAuthStore()
  useDocumentTitle('Qeydiyyat')

  if (token) {
    return <Navigate to={activeCompanyId ? routes.dashboard : routes.selectCompany} replace />
  }

  return (
    <AuthPanel title="Qeydiyyat" description="Yeni hesab yaradın.">
      <RegisterForm />
    </AuthPanel>
  )
}
