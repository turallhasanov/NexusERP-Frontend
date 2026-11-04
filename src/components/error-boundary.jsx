import { Component } from 'react'
import { useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'

// Catches errors thrown while rendering, so one broken screen shows a fallback instead of a blank page. Errors in
// event handlers and API calls never get here: those reach the user through the toasts (see services/api-client.js).
class ErrorBoundaryInner extends Component {
  state = { error: null, resetKey: this.props.resetKey }

  static getDerivedStateFromError(error) {
    return { error }
  }

  // Another page was opened (e.g. with the browser's back button): drop the error and try rendering again.
  static getDerivedStateFromProps(props, state) {
    return props.resetKey === state.resetKey ? null : { error: null, resetKey: props.resetKey }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] UI render failed:', error, info.componentStack)
  }

  render() {
    if (!this.state.error) {
      return this.props.children
    }

    return <ErrorFallback error={this.state.error} />
  }
}

function ErrorFallback({ error }) {
  return (
    <main role="alert" className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 8v5m0 3h.01M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-slate-900">Sistemdə xəta baş verdi</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Bu səhifə gözlənilmədən dayandı. Yadda saxlanmış məlumatlarınız təhlükəsizdir: səhifəni yeniləyin və ya ana
          səhifəyə qayıdın.
        </p>
        {import.meta.env.DEV ? (
          <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-slate-100 p-3 text-left text-xs text-slate-700">
            {error?.message ?? String(error)}
          </pre>
        ) : null}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={() => window.location.reload()}>Səhifəni yenilə</Button>
          <Button variant="outline" onClick={() => window.location.assign('/')}>Ana səhifəyə qayıt</Button>
        </div>
      </div>
    </main>
  )
}

export function ErrorBoundary({ children }) {
  const { pathname } = useLocation()

  return <ErrorBoundaryInner resetKey={pathname}>{children}</ErrorBoundaryInner>
}
