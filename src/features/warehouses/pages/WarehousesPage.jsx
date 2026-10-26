import { useEffect, useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useWarehouses } from '@/features/inventory/api/use-warehouses'
import { InventoryOverview } from '@/features/inventory/components/InventoryOverview'
import { deleteWarehouse } from '@/features/warehouses/api/warehouses-api'
import { WarehouseDetailsModal } from '@/features/warehouses/components/WarehouseDetailsModal'
import { WarehouseFormModal } from '@/features/warehouses/components/WarehouseFormModal'
import { WarehouseTable } from '@/features/warehouses/components/WarehouseTable'
import { formatQuantityValue } from '@/features/warehouses/lib/warehouse-format'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { cn } from '@/lib/cn'
import { styles } from '@/lib/styles'
import { useAuthStore } from '@/store/auth-store'
import { showToast } from '@/store/toast-store'
import { isCompanyManager } from '@/types/auth'

const TAB_WAREHOUSES = 'warehouses'
const TAB_STOCK = 'stock'

const TABS = [
  { id: TAB_WAREHOUSES, label: 'Anbarlar' },
  { id: TAB_STOCK, label: 'Məhsul qalıqları' },
]

// Anbar İdarəetməsi: the company's warehouses (create, edit, delete for admins and IT admins; the API
// enforces the same rule), each warehouse's stock and movements, and product balances across warehouses.
export function WarehousesPage() {
  const { warehouses, isLoading, error, reload } = useWarehouses()
  const { user } = useAuthStore()
  const canManage = isCompanyManager(user)
  const [tab, setTab] = useState(TAB_WAREHOUSES)
  // { type: 'form', warehouse: null | warehouse } for create/edit, { type: 'details', warehouse } for stock.
  const [dialog, setDialog] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  useDocumentTitle('Anbar İdarəetməsi')

  // Stock totals change with every approved purchase and sale, so refresh the cached list on each visit.
  useEffect(() => {
    void reload()
  }, [reload])

  const totalQuantity = warehouses.reduce((sum, warehouse) => sum + Number(warehouse.totalQuantity ?? 0), 0)
  const stockedCount = warehouses.filter((warehouse) => warehouse.productCount > 0).length

  function handleSaved(warehouse) {
    showToast(dialog.warehouse ? `Anbar yeniləndi: ${warehouse.name}` : 'Anbar uğurla yaradıldı!')
    setDialog(null)
  }

  async function handleDelete(warehouse) {
    if (warehouse.productCount > 0) {
      showToast('Anbarda məhsul var, silinə bilməz.', 'error')
      return
    }

    if (!window.confirm(`«${warehouse.name}» anbarı silinsin?`)) {
      return
    }

    setDeletingId(warehouse.id)

    try {
      await deleteWarehouse(warehouse.id)
      showToast(`Anbar silindi: ${warehouse.name}`)
    } catch (deleteError) {
      showToast(deleteError.message, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <PageContainer
      title="Anbar İdarəetməsi"
      description="Anbarlar, onların stok qalığı və hərəkətləri. Hər mağaza bir anbardan təchiz olunur."
      action={
        canManage ? (
          <Button onClick={() => setDialog({ type: 'form', warehouse: null })}>➕ Yeni Anbar Yarat</Button>
        ) : null
      }
    >
      <div className={styles.periodRow} role="tablist" aria-label="Anbar bölmələri">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={cn(styles.periodChip, tab === item.id ? styles.periodChipActive : styles.periodChipIdle)}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === TAB_WAREHOUSES ? (
        <>
          <div className={styles.summaryGrid}>
            <Card>
              <p className={styles.summaryLabel}>Anbar sayı</p>
              <p className={styles.summaryValue}>{isLoading ? '…' : warehouses.length}</p>
            </Card>
            <Card>
              <p className={styles.summaryLabel}>Məhsulu olan anbar</p>
              <p className={styles.summaryValue}>{isLoading ? '…' : stockedCount}</p>
            </Card>
            <Card>
              <p className={styles.summaryLabel}>Cəmi qalıq (bütün vahidlər)</p>
              <p className={styles.summaryValue}>{isLoading ? '…' : formatQuantityValue(totalQuantity)}</p>
            </Card>
          </div>
          <WarehouseTable
            warehouses={warehouses}
            isLoading={isLoading}
            error={error}
            onRetry={reload}
            canManage={canManage}
            deletingId={deletingId}
            onOpen={(warehouse) => setDialog({ type: 'details', warehouse })}
            onEdit={(warehouse) => setDialog({ type: 'form', warehouse })}
            onDelete={handleDelete}
          />
        </>
      ) : (
        <InventoryOverview />
      )}

      {dialog?.type === 'form' ? (
        <WarehouseFormModal warehouse={dialog.warehouse} onClose={() => setDialog(null)} onSaved={handleSaved} />
      ) : null}
      {dialog?.type === 'details' ? (
        <WarehouseDetailsModal warehouseId={dialog.warehouse.id} onClose={() => setDialog(null)} />
      ) : null}
    </PageContainer>
  )
}
