import { Spinner } from '@/components/ui/spinner'
import { styles } from '@/lib/styles'

// Single table row for the loading, error and empty states. Returns null when there are rows to show.
export function TableState({ colSpan, isLoading, error, onRetry, isEmpty, emptyText }) {
  if (isLoading) {
    return (
      <tr>
        <td colSpan={colSpan}>
          <div className={styles.loadingRow}>
            <Spinner />
            Yüklənir…
          </div>
        </td>
      </tr>
    )
  }

  if (error) {
    return (
      <tr>
        <td colSpan={colSpan}>
          <div className={styles.errorRow}>
            <span>{error}</span>
            {onRetry ? (
              <button type="button" className={styles.textAction} onClick={() => onRetry()}>
                Yenidən cəhd et
              </button>
            ) : null}
          </div>
        </td>
      </tr>
    )
  }

  if (isEmpty) {
    return (
      <tr>
        <td className={styles.tableEmpty} colSpan={colSpan}>
          {emptyText}
        </td>
      </tr>
    )
  }

  return null
}
