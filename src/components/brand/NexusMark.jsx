export function NexusMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#111827" />
      <path
        d="M10 9.5v13M10 22.5 22 9.5M22 9.5v13"
        stroke="#f8fafc"
        strokeWidth="2.15"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="10" cy="9.5" r="2.35" fill="#34d399" />
      <circle cx="22" cy="22.5" r="2.35" fill="#34d399" />
      <circle cx="10" cy="22.5" r="2.05" fill="#f8fafc" />
      <circle cx="22" cy="9.5" r="2.05" fill="#f8fafc" />
    </svg>
  )
}
