import { styles } from '@/lib/styles'

const RIGHT_COLUMNS = new Set(['Mədaxil', 'Məxaric', 'Qalıq', 'Məbləğ', 'Qiymət', 'Cəm', 'Say', 'Maaş', 'Dəyər', 'Miqdar'])

function tableCellClass(column) {
  return RIGHT_COLUMNS.has(column) ? 'py-2 pr-3 text-right tabular-nums' : 'py-2 pr-3'
}

function TotalsBlock({ totals }) {
  if (!totals?.length) {
    return null
  }

  return (
    <dl className={`mt-4 grid gap-1.5 border-t pt-4 ${styles.dekontDash}`}>
      {totals.map((row) => (
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
  )
}

export function DekontSheet({ dekont }) {
  const hasTable = Boolean(dekont.table)
  const hasLines = Boolean(dekont.lines?.length)
  const columns = dekont.table?.columns ?? []

  return (
    <div className={styles.dekontPaper}>
      <p className={styles.dekontKicker}>NEXUSERP</p>
      <h2 className="mt-3 text-center text-lg font-semibold tracking-tight">{dekont.title}</h2>
      {dekont.number ? (
        <p className="mt-1 text-center font-mono text-sm text-neutral-500">{dekont.number}</p>
      ) : null}
      <div className={`mt-6 border-t pt-4 ${styles.dekontDash}`}>
        {hasTable ? (
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
                  {columns.map((column) => (
                    <th key={column} className={`${tableCellClass(column)} font-medium`}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dekont.table.rows.length === 0 ? (
                  <tr>
                    <td className="py-4 text-neutral-500" colSpan={columns.length}>
                      {dekont.table.empty ?? 'Hələ məlumat yoxdur.'}
                    </td>
                  </tr>
                ) : (
                  dekont.table.rows.map((cells) => (
                    <tr key={cells.join('-')}>
                      {cells.map((cell, index) => (
                        <td key={`${cells[0]}-${index}`} className={tableCellClass(columns[index])}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <TotalsBlock totals={dekont.totals} />
          </>
        ) : hasLines ? (
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
            <TotalsBlock totals={dekont.totals} />
          </>
        ) : (
          <>
            {(dekont.meta ?? []).length ? (
              <dl className="mb-4 grid gap-1.5 text-sm text-neutral-500">
                {dekont.meta.map((row) => (
                  <div key={row.label} className={styles.definitionRow}>
                    <dt>{row.label}</dt>
                    <dd className={styles.definitionValue}>{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            <dl className={styles.definitionList}>
              {(dekont.rows ?? []).map((row) => (
                <div
                  key={row.label}
                  className={row.strong ? 'flex justify-between text-base font-semibold' : styles.definitionRow}
                >
                  <dt>{row.label}</dt>
                  <dd className={row.strong ? undefined : styles.definitionValue}>{row.value}</dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </div>
      {dekont.footer ? (
        <p className="mt-8 text-center text-xs tracking-wide text-neutral-400">{dekont.footer}</p>
      ) : null}
    </div>
  )
}
