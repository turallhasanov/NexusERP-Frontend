import { styles } from '@/lib/styles'

export function DekontSheet({ dekont }) {
  const hasLines = Boolean(dekont.lines?.length)

  return (
    <div className={styles.dekontPaper}>
      <p className={styles.dekontKicker}>NEXUSERP</p>
      <h2 className="mt-3 text-center text-lg font-semibold tracking-tight">{dekont.title}</h2>
      {dekont.number ? (
        <p className="mt-1 text-center font-mono text-sm text-neutral-500">{dekont.number}</p>
      ) : null}
      <div className={`mt-6 border-t pt-4 ${styles.dekontDash}`}>
        {hasLines ? (
          <>
            <dl className="grid gap-1.5 text-sm text-neutral-500">
              {(dekont.meta ?? []).map((row) => (
                <div key={row.label} className={styles.definitionRow}>
                  <dt>{row.label}</dt>
                  <dd className={styles.definitionValue}>{row.value}</dd>
                </div>
              ))}
            </dl>
            <table className="mt-5 w-full text-sm">
              <thead>
                <tr className={`border-y text-left text-xs text-neutral-400 ${styles.dekontDash}`}>
                  <th className="py-2 font-medium">Məhsul</th>
                  <th className="py-2 text-right font-medium">Say</th>
                  <th className="py-2 text-right font-medium">Qiymət</th>
                  <th className="py-2 text-right font-medium">Cəm</th>
                </tr>
              </thead>
              <tbody>
                {dekont.lines.map((line) => (
                  <tr key={`${line.name}-${line.qty}-${line.total}`}>
                    <td className="py-2 pr-3">{line.name}</td>
                    <td className="py-2 text-right tabular-nums">{line.qty}</td>
                    <td className="py-2 text-right tabular-nums">{line.price}</td>
                    <td className="py-2 text-right tabular-nums">{line.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <dl className={`mt-4 grid gap-1.5 border-t pt-4 ${styles.dekontDash}`}>
              {(dekont.totals ?? []).map((row) => (
                <div
                  key={row.label}
                  className={
                    row.strong
                      ? 'flex justify-between text-base font-semibold'
                      : 'flex justify-between text-sm text-neutral-600'
                  }
                >
                  <dt>{row.label}</dt>
                  <dd className={row.strong ? undefined : styles.definitionValue}>{row.value}</dd>
                </div>
              ))}
            </dl>
          </>
        ) : (
          <dl className={styles.definitionList}>
            {(dekont.rows ?? []).map((row) => (
              <div key={row.label} className={styles.definitionRow}>
                <dt>{row.label}</dt>
                <dd className={styles.definitionValue}>{row.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
      {dekont.footer ? (
        <p className="mt-8 text-center text-xs tracking-wide text-neutral-400">{dekont.footer}</p>
      ) : null}
    </div>
  )
}
