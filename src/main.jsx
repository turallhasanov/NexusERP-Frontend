import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { ErrorBoundary } from '@/components/error-boundary'
import { ConnectionNotice } from '@/components/ui/connection-notice'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
      <ConnectionNotice />
    </BrowserRouter>
  </StrictMode>,
)
