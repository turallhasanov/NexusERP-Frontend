import { flushSync } from 'react-dom'

// Applies `update` (state changes such as opening the preview or switching the report), lets React render
// it synchronously, then opens the print dialog — so the print root already shows the new report.
export function printAfterRender(update) {
  flushSync(update)
  window.print()
}
