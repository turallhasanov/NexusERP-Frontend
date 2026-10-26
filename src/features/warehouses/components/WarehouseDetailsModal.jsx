import { AdminError, AdminLoading, AdminModal } from '@/features/admin/components/AdminUi'
import { fetchWarehouseDetails } from '@/features/warehouses/api/warehouses-api'
import { formatQuantityValue, occupancyLabel } from '@/features/warehouses/lib/warehouse-format'
import { useApiQuery } from '@/hooks/use-api-query'
import { formatDate } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { styles } from '@/lib/styles'

const STOCK_COLUMNS = ['Kod', 'Məhsul', 'Barkod', 'Qalıq']
const MOVEMENT_COLUMNS = ['Tarix', 'Sənəd', 'Növ', 'Kontragent', 'Miqdar', 'Məbləğ']

const MOVEMENT_TYPES = {
  in: { label: 'Mədaxil (alış)', sign: '+' },
  out: { label: 'Məxaric (satış)', sign: '−' },
}

// One warehouse: its details, current stock and the newest approved purchases and sales that moved it.
export function WarehouseDetailsModal({ warehouseId, onClose }) {
  const details = useApiQuery(fetchWarehouseDetails, { id: warehouseId })
  const warehouse = details.data?.warehouse
  const stocks = details.data?.stocks ?? []
  const movements = details.data?.movements ?? []

  return (
    <AdminModal
      title={warehouse ? `${warehouse.name} (${warehouse.code})` : 'Anbar'}
      labelId="warehouse-details-title"
      onClose={onClose}
      header={
        warehouse ? (
          <p className={styles.adminPageDescription}>
            {[warehouse.address, warehouse.responsiblePerson && `Məsul şəxs: ${warehouse.responsiblePerson}`]
              .filter(Boolean)
              .join(' · ') || 'Ünvan və məsul şəxs qeyd olunmayıb.'}
          </p>
        ) : null
      }
    >
      {!details.data && details.isLoading ? <AdminLoading /> : null}
      {!details.data && details.error ? <AdminError message={details.error} onRetry={details.reload} /> : null}

      {warehouse ? (
        <div className="space-y-6">
          <div className={styles.adminKpiGrid}>
            <div className={styles.adminCard}>
              <p className={styles.adminKpiLabel}>Məhsul çeşidi</p>
              <p className={styles.adminKpiValue}>{warehouse.productCount}</p>
            </div>
            <div className={styles.adminCard}>
              <p className={styles.adminKpiLabel}>Cəmi qalıq</p>
              <p className={styles.adminKpiValue}>{formatQuantityValue(warehouse.totalQuantity)}</p>
            </div>
            <div className={styles.adminCard}>
              <p className={styles.adminKpiLabel}>Tutum</p>
              <p className={styles.adminKpiValue}>
                {warehouse.capacity ? formatQuantityValue(warehouse.capacity) : '—'}
              </p>
            </div>
            <div className={styles.adminCard}>
              <p className={styles.adminKpiLabel}>Doluluq</p>
              <p className={styles.adminKpiValue}>{occupancyLabel(warehouse)}</p>
            </div>
          </div>

          <section className="space-y-3">
            <h3 className={styles.adminSectionTitle}>Stok qalığı</h3>
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTableCompact}>
                <thead className={styles.adminTableHead}>
                  <tr>
                    {STOCK_COLUMNS.map((column) => (
                      <th key={column} className={styles.adminTh}>
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stocks.length === 0 ? (
                    <tr>
                      <td colSpan={STOCK_COLUMNS.length} className={styles.adminTableState}>
                        Bu anbarda hələ məhsul yoxdur.
                      </td>
                    </tr>
                  ) : (
                    stocks.map((stock) => (
                      <tr key={stock.productId} className={styles.adminTr}>
                        <td className={styles.adminTdMuted}>{stock.product.code}</td>
                        <td className={styles.adminTd}>{stock.product.name}</td>
                        <td className={styles.adminTdMuted}>{stock.product.barcode || '—'}</td>
                        <td className={styles.adminTdNumber}>
                          {formatQuantityValue(stock.quantity)} {stock.product.unitShortName}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className={styles.adminSectionTitle}>Son stok hərəkətləri</h3>
            <div className={styles.adminTableWrap}>
              <table className={styles.adminTableCompact}>
                <thead className={styles.adminTableHead}>
                  <tr>
                    {MOVEMENT_COLUMNS.map((column) => (
                      <th key={column} className={styles.adminTh}>
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={MOVEMENT_COLUMNS.length} className={styles.adminTableState}>
                        Təsdiqlənmiş alış və ya satış hələ yoxdur.
                      </td>
                    </tr>
                  ) : (
                    movements.map((movement) => {
                      const type = MOVEMENT_TYPES[movement.type] ?? MOVEMENT_TYPES.in

                      return (
                        <tr key={movement.documentId} className={styles.adminTr}>
                          <td className={styles.adminTdMuted}>{formatDate(movement.documentDate)}</td>
                          <td className={styles.adminTd}>{movement.documentNumber}</td>
                          <td className={styles.adminTdMuted}>{type.label}</td>
                          <td className={styles.adminTdMuted}>{movement.counterparty || 'Pərakəndə alıcı'}</td>
                          <td className={styles.adminTdNumber}>
                            {type.sign}
                            {formatQuantityValue(movement.quantity)}
                          </td>
                          <td className={styles.adminTdNumber}>{formatAzn(movement.amount)}</td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}
    </AdminModal>
  )
}
