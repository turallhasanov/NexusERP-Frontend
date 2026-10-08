import { styles } from '@/lib/styles'

export function DekontSheet({ dekont }) {
  return (
    <>
      <p className="text-xs tracking-[0.2em] text-neutral-500">NEXUSERP</p>
      <h2 className="mt-2 text-xl font-semibold">{dekont.title}</h2>
      <dl className={styles.definitionList}>
        {dekont.rows.map((row) => (
          <div key={row.label} className={styles.definitionRow}>
            <dt>{row.label}</dt>
            <dd className={styles.definitionValue}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </>
  )
}
