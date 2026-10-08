import { NexusMark } from '@/components/brand/NexusMark'
import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'

export function BrandLockup({ companyName, align = 'start' }) {
  const stacked = align === 'center'

  return (
    <div className={cn(styles.brandLockup, stacked && styles.brandLockupCenter)}>
      <NexusMark className={stacked ? styles.brandMarkLg : styles.brandMark} />
      <div className={styles.brandCopy}>
        <p className={styles.brandName}>
          <span>Nexus</span>
          <span className={styles.brandNameAccent}>ERP</span>
        </p>
        {companyName ? <p className={styles.brandCompany}>{companyName}</p> : null}
      </div>
    </div>
  )
}
