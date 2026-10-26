import { createPortal } from 'react-dom'
import { AdminError, AdminLoading, AdminModal } from '@/features/admin/components/AdminUi'
import { fetchTerminationDocument } from '@/features/hr/api/employees-api'
import { useApiQuery } from '@/hooks/use-api-query'
import { formatDate } from '@/lib/date'
import { styles } from '@/lib/styles'

// Company "logo": there is no uploaded logo yet, so the first letter of the name in a seal-like badge.
function CompanyMark({ name }) {
  return (
    <span className={styles.orderLogo} aria-hidden="true">
      {(name.trim()[0] ?? 'N').toLocaleUpperCase('az')}
    </span>
  )
}

// The termination order (işdən çıxma əmri) on white paper: shown in the dialog and printed alone.
export function TerminationOrderSheet({ document }) {
  const terminatedAt = formatDate(document.terminatedAt)

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
        <h3 className={styles.orderTitle}>Əmək müqaviləsinə xitam verilməsi haqqında</h3>
        <p className={styles.orderMuted}>
          Bakı şəhəri · {terminatedAt}
        </p>
      </div>

      <p className={styles.orderText}>
        Azərbaycan Respublikasının Əmək Məcəlləsinə uyğun olaraq və aşağıda göstərilən əsasla
      </p>
      <p className={styles.orderCommand}>ƏMR EDİRƏM:</p>

      <ol className={styles.orderList}>
        <li>
          <strong>{document.department}</strong> şöbəsinin <strong>{document.title}</strong> vəzifəsində çalışan{' '}
          <strong>{document.employeeName}</strong> ilə bağlanmış əmək müqaviləsinə <strong>{terminatedAt}</strong>{' '}
          tarixindən xitam verilsin.
        </li>
        <li>Mühasibatlığa tapşırılsın ki, işçi ilə qanunvericiliyə uyğun olaraq tam haqq-hesab çəkilsin.</li>
        <li>Kadrlar şöbəsinə tapşırılsın ki, əmək kitabçasında (elektron sistemdə) müvafiq qeyd aparılsın.</li>
      </ol>

      <dl className={styles.orderFacts}>
        <div className={styles.orderFact}>
          <dt>Adı, soyadı</dt>
          <dd>{document.employeeName}</dd>
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
          <dt>İşə qəbul tarixi</dt>
          <dd>{formatDate(document.hiredAt)}</dd>
        </div>
        <div className={styles.orderFact}>
          <dt>İşdən çıxma tarixi</dt>
          <dd>{terminatedAt}</dd>
        </div>
        <div className={styles.orderFact}>
          <dt>İşdən çıxma səbəbi</dt>
          <dd>{document.reason}</dd>
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

// Opens the order of a terminated employee; "Yazdır / PDF" prints only the sheet (the browser's print dialog can
// save it as PDF). The caller must not render other print roots meanwhile.
export function TerminationDocumentModal({ employee, onClose }) {
  const query = useApiQuery(fetchTerminationDocument, { id: employee.id })
  const order = query.data

  return (
    <AdminModal title="İşdən çıxma əmri" labelId="termination-document-title" onClose={onClose}>
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
        {order ? <TerminationOrderSheet document={order} /> : null}
      </div>

      {order
        ? createPortal(
            <div className={styles.orderPrintRoot}>
              <TerminationOrderSheet document={order} />
            </div>,
            document.body,
          )
        : null}
    </AdminModal>
  )
}
