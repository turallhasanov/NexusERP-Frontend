import { useState } from 'react'
import { Input } from '@/components/ui/input'

// Password input with a show/hide (eye) toggle on the right. Props pass straight through to <Input>.
export function PasswordInput({ className = '', ...props }) {
  const [visible, setVisible] = useState(false)
  const label = visible ? 'Şifrəni gizlət' : 'Şifrəni göstər'

  return (
    <div className="relative">
      <Input {...props} type={visible ? 'text' : 'password'} className={`w-full pr-10 ${className}`} />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={label}
        aria-pressed={visible}
        title={label}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-neutral-400 transition-colors hover:text-neutral-700 glass:text-slate-400 glass:hover:text-white"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {visible ? (
            <>
              <path d="M17.94 17.94A10.5 10.5 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.06-5.94M9.9 4.24A9.8 9.8 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <path d="M1 1l22 22" />
            </>
          ) : (
            <>
              <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
    </div>
  )
}
