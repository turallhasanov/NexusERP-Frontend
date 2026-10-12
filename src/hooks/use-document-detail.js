import { useEffect, useState } from 'react'

// Loads one full document (with lines) for the receipt panel. `version` changes when the list row changes
// (e.g. its status after approval), which reloads it.
export function useDocumentDetail(fetchDocument, documentId, version) {
  const [detail, setDetail] = useState({ id: null, document: null, error: '' })

  useEffect(() => {
    if (!documentId) {
      return undefined
    }

    let cancelled = false

    fetchDocument(documentId)
      .then((document) => {
        if (!cancelled) {
          setDetail({ id: documentId, document, error: '' })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setDetail({ id: documentId, document: null, error: error.message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [fetchDocument, documentId, version])

  // A stale document from the previous selection is never shown while the next one loads.
  const isCurrent = detail.id === documentId

  return {
    document: isCurrent ? detail.document : null,
    error: isCurrent ? detail.error : '',
    isLoading: Boolean(documentId) && !isCurrent,
  }
}
