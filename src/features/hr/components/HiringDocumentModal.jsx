import { createPortal } from 'react-dom'
import { AdminError, AdminLoading, AdminModal } from '@/features/admin/components/AdminUi'
import { fetchHiringDocument } from '@/features/hr/api/employees-api'
import { CompanyMark } from '@/features/hr/components/TerminationDocumentModal'
import { useApiQuery } from '@/hooks/use-api-query'
import { formatDate } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

function probationText(months) {
  return months ? `${months} ay` : 'Müəyyən edilmir'
}

// The hiring order (işə qəbul haqqında əmr) on white paper: shown in the dialog and printed alone. A missing FİN
// leaves a blank line to fill in by hand.
export function HiringOrderSheet({ document }) {
  const hiredAt = formatDate(document.hiredAt)
  const fin = document.fin ?? '____________'

  return (
    <article className={styles.orderPaper}>
      <header className={styles.orderHeader}>
        <CompanyMark name={document.companyName} />
        <div>
          <p className={styles.orderCompany}>{document.companyName}</p>
          {document.companyVoen ? <p className={styles.orderMuted}>VÖEN: {document.companyVoen}</p> : null}
        </div>
      </header>

      <div className={styles.orderTitleBlock}>
        <p className={styles.orderKicker}>ƏMR № {document.orderNumber}</p>
        <h3 className={styles.orderTitle}>İşə qəbul haqqında</h3>
        <p className={styles.orderMuted}>Bakı şəhəri · {formatDate(document.orderDate)}</p>
      </div>

      <p className={styles.orderText}>
        Azərbaycan Respublikasının Əmək Məcəlləsinə uyğun olaraq, işçinin ərizəsi və bağlanmış əmək müqaviləsi əsasında
      </p>
      <p className={styles.orderCommand}>ƏMR EDİRƏM:</p>

      <ol className={styles.orderList}>
        <li>
          <strong>{document.employeeName}</strong> (FİN: {fin}) <strong>{hiredAt}</strong> tarixindən{' '}
          <strong>{document.department}</strong> şöbəsinə <strong>{document.title}</strong> vəzifəsinə işə qəbul edilsin.
        </li>
        <li>
          İşçiyə aylıq vəzifə maaşı <strong>{formatAzn(document.salary)}</strong> məbləğində müəyyən edilsin.
        </li>
        <li>
          {document.probationMonths ? (
            <>
              İşçi üçün <strong>{document.probationMonths} ay</strong> sınaq müddəti müəyyən edilsin.
            </>
          ) : (
            'İşçi sınaq müddəti müəyyən edilmədən işə qəbul edilsin.'
          )}
        </li>
        <li>Mühasibatlığa tapşırılsın ki, əmək haqqı qanunvericiliyə uyğun olaraq hesablansın.</li>
        <li>Kadrlar şöbəsinə tapşırılsın ki, əmək müqaviləsi elektron sistemdə qeydiyyata alınsın.</li>
      </ol>

      <dl className={styles.orderFacts}>
        <div className={styles.orderFact}>
          <dt>Adı, soyadı, ata adı</dt>
          <dd>{document.employeeName}</dd>
        </div>
        <div className={styles.orderFact}>
          <dt>FİN</dt>
          <dd>{fin}</dd>
        </div>
        <div className={styles.orderFact}>
          <dt>Vəzifəsi</dt>
          <dd>{document.title}</dd>
        </div>
        <div className={styles.orderFact}>
          <dt>Şöbəsi</dt>
          <dd>{document.department}</dd>
        </div>
        <div className={styles.orderFact}>
          <dt>İşə başlama tarixi</dt>
          <dd>{hiredAt}</dd>
        </div>
        <div className={styles.orderFact}>
          <dt>Sınaq müddəti</dt>
          <dd>{probationText(document.probationMonths)}</dd>
        </div>
        <div className={styles.orderFact}>
          <dt>Aylıq əmək haqqı</dt>
          <dd>{formatAzn(document.salary)}</dd>
        </div>
      </dl>

      <footer className={styles.orderSignatures}>
        <div>
          <p className={styles.orderSignLine}>Rəhbər</p>
          <p className={styles.orderMuted}>(imza, möhür)</p>
        </div>
        <div>
          <p className={styles.orderSignLine}>Əmrlə tanış oldum: {document.employeeName}</p>
          <p className={styles.orderMuted}>(imza, tarix)</p>
        </div>
      </footer>
    </article>
  )
}

// Opens an employee's hiring order; "Yazdır / PDF" prints only the sheet (the browser's print dialog can save it as
// PDF). The caller must not render other print roots meanwhile.
export function HiringDocumentModal({ employee, onClose }) {
  const query = useApiQuery(fetchHiringDocument, { id: employee.id })
  const order = query.data

  return (
    <AdminModal title="İşə qəbul əmri" labelId="hiring-document-title" onClose={onClose}>
      <div className="space-y-4">
        <div className={styles.orderToolbar}>
          <p className={styles.adminPageDescription}>{employee.name}</p>
          <button
            type="button"
            className={styles.adminButtonPrimary}
            onClick={() => window.print()}
            disabled={!order}
          >
            🖨 Yazdır / PDF
          </button>
        </div>

        {!order && query.isLoading ? <AdminLoading /> : null}
        {!order && query.error ? <AdminError message={query.error} onRetry={query.reload} /> : null}
        {order ? <HiringOrderSheet document={order} /> : null}
      </div>

      {order
        ? createPortal(
            <div className={styles.orderPrintRoot}>
              <HiringOrderSheet document={order} />
            </div>,
            document.body,
          )
        : null}
    </AdminModal>
  )
}
