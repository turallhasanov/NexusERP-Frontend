import { useEffect, useMemo, useRef, useState } from 'react'
import { DekontPreview, DekontPrintRoot } from '@/components/dekont/DekontPreview'
import { checkoutPos } from '@/features/pos/api/checkout-pos'
import { lookupBarcode } from '@/features/pos/api/lookup-barcode'
import { buildPosDekont, openPosDekontPdf } from '@/features/pos/api/pos-dekont'
import { toPosItem, usePosCatalog } from '@/features/pos/api/use-pos-catalog'
import { PosCart } from '@/features/pos/components/PosCart'
import { PosProductGrid } from '@/features/pos/components/PosProductGrid'
import { PosScanner } from '@/features/pos/components/PosScanner'
import { PosStorePicker } from '@/features/pos/components/PosStorePicker'
import { PosTypeFilter } from '@/features/pos/components/PosTypeFilter'
import { useProductTypes } from '@/features/products/api/use-product-types'
import { useStores } from '@/features/stores/api/use-stores'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { formatAzn } from '@/lib/money'
import { cashChange, PAYMENT_CASH } from '@/lib/payment'
import { styles } from '@/lib/styles'
import { useCashRegistersStore } from '@/store/cash-registers-store'
import { showToast } from '@/store/toast-store'

export function PosPage() {
  const { stores } = useStores()
  const { types } = useProductTypes()
  const { cashRegisters, isLoading: cashRegistersLoading } = useCashRegistersStore()
  const [storeId, setStoreId] = useState('')
  const [chosenCashRegisterId, setChosenCashRegisterId] = useState('')
  const [typeId, setTypeId] = useState('')
  const [cart, setCart] = useState([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [payment, setPayment] = useState(PAYMENT_CASH)
  const [tendered, setTendered] = useState('')
  const [lastReceipt, setLastReceipt] = useState(null)
  const [preview, setPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [scanning, setScanning] = useState(false)
  const lastDekont = buildPosDekont(lastReceipt)
  const scannerRef = useRef(null)
  const selectedStore = stores.find((store) => store.id === storeId)
  const warehouseId = selectedStore?.warehouseId
  const { catalog } = usePosCatalog(warehouseId)
  const activeCashRegisters = cashRegisters.filter((cashRegister) => cashRegister.isActive)
  // Defaults to the first active register until the cashier picks one.
  const cashRegisterId = chosenCashRegisterId || activeCashRegisters[0]?.id || ''
  const cartTotal = cart.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
  const change = payment === PAYMENT_CASH ? cashChange(cartTotal, Number(tendered)) : null
  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase()

    return catalog.filter((product) => {
      if (typeId && product.typeId !== typeId) {
        return false
      }

      if (!term) {
        return true
      }

      return (
        product.name.toLowerCase().includes(term) ||
        product.barcode.includes(term) ||
        product.sku.toLowerCase().includes(term) ||
        product.typeName.toLowerCase().includes(term)
      )
    })
  }, [catalog, query, typeId])
  useDocumentTitle('POS')

  useEffect(() => {
    if (storeId) {
      scannerRef.current?.focus()
    }
  }, [storeId, cart.length])

  function selectStore(nextStoreId) {
    setStoreId(nextStoreId)
    setTypeId('')
    setCart([])
    setQuery('')
    setError('')
    setNotice('')
    setTendered('')
    setLastReceipt(null)
    setPreview(false)
  }

  function addProduct(product) {
    const inCart = cart.find((line) => line.productId === product.id)
    const nextQty = (inCart?.quantity ?? 0) + 1

    if (nextQty > product.stock) {
      setError(`Bu depoda yalnız ${product.stock} ${product.unitName} var.`)
      setNotice('')
      return false
    }

    setError('')
    setNotice('')
    setCart((current) => {
      const existing = current.find((line) => line.productId === product.id)

      if (existing) {
        return current.map((line) =>
          line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line,
        )
      }

      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          barcode: product.barcode,
          unitPrice: product.unitPrice,
          unitName: product.unitName,
          quantity: 1,
        },
      ]
    })

    return true
  }

  async function scanBarcode(raw) {
    const code = raw.trim()

    if (!storeId) {
      setError('Əvvəlcə mağaza seçin.')
      setNotice('')
      return
    }

    if (!code || scanning) {
      return
    }

    setScanning(true)

    try {
      const match = await lookupBarcode(code)

      if (!match || match.isActive === false) {
        setError('Barkod tapılmadı.')
        setNotice('')
        return
      }

      if (addProduct(toPosItem(match, warehouseId))) {
        setQuery('')
      }
    } catch (lookupError) {
      setError(lookupError.message)
      setNotice('')
    } finally {
      setScanning(false)
    }
  }

  function changeQty(productId, delta) {
    const product = catalog.find((item) => item.id === productId)

    setCart((current) =>
      current.flatMap((line) => {
        if (line.productId !== productId) {
          return [line]
        }

        const nextQty = line.quantity + delta

        if (nextQty < 1) {
          return []
        }

        if (product && nextQty > product.stock) {
          return [line]
        }

        return [{ ...line, quantity: nextQty }]
      }),
    )
  }

  function removeLine(productId) {
    setCart((current) => current.filter((line) => line.productId !== productId))
  }

  function changePayment(nextPayment) {
    setPayment(nextPayment)
    setTendered('')
    setError('')
  }

  async function checkout() {
    if (submitting) {
      return
    }

    const cashRegister = cashRegisters.find((item) => item.id === cashRegisterId)
    const tenderedAmount = Number(tendered)

    setError('')
    setNotice('')
    setSubmitting(true)

    const result = await checkoutPos({ storeId, cashRegisterId, lines: cart, payment, tendered: tenderedAmount })

    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    const leftover = result.change
    setCart([])
    setQuery('')
    setTendered('')
    setLastReceipt({ sale: result.sale, payment, tendered: tenderedAmount, change: leftover, cashRegister })
    setPreview(true)
    setNotice(
      leftover == null
        ? `Satış yazıldı: ${result.sale.documentNumber}.`
        : `Satış yazıldı: ${result.sale.documentNumber}. Qalıq ${formatAzn(leftover)}.`,
    )
    showToast(`Satış tamamlandı: ${result.sale.documentNumber} · ${formatAzn(result.sale.totalAmount)}`)
  }

  function viewPdf() {
    if (!lastReceipt) {
      return
    }

    void openPosDekontPdf(lastReceipt)
    setPreview(true)
  }

  return (
    <section className={styles.posScreen}>
      <div className={styles.posFrame}>
        <div className={styles.posStage}>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs tracking-[0.28em] text-emerald-400">POS KASSA</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Pərakəndə satış</h1>
            </div>
            <p className="text-sm text-white/40">Barkod oxuducu Enter göndərir</p>
          </div>
          <PosStorePicker stores={stores} storeId={storeId} onSelect={selectStore} />
          <PosScanner
            value={query}
            onChange={setQuery}
            onScan={scanBarcode}
            inputRef={scannerRef}
            disabled={!storeId}
          />
          {storeId ? <PosTypeFilter types={types} value={typeId} onChange={setTypeId} /> : null}
          <PosProductGrid products={visibleProducts} storeId={storeId} onAdd={addProduct} />
        </div>
        <PosCart
          cart={cart}
          error={error}
          notice={notice}
          storeName={selectedStore?.name}
          cashRegisters={activeCashRegisters}
          cashRegistersLoading={cashRegistersLoading}
          cashRegisterId={cashRegisterId}
          onCashRegisterChange={setChosenCashRegisterId}
          payment={payment}
          tendered={tendered}
          change={change}
          submitting={submitting}
          onPaymentChange={changePayment}
          onTenderedChange={setTendered}
          onChangeQty={changeQty}
          onRemoveLine={removeLine}
          onClear={() => {
            setCart([])
            setError('')
            setNotice('')
            setTendered('')
          }}
          onCheckout={checkout}
          hasReceipt={Boolean(lastDekont)}
          onViewReceipt={() => setPreview(true)}
          onPrintReceipt={() => window.print()}
          onPdfReceipt={viewPdf}
        />
      </div>
      {preview ? (
        <DekontPreview
          title="POS qəbzi"
          dekont={lastDekont}
          onClose={() => setPreview(false)}
          onPrint={() => window.print()}
          onPdf={viewPdf}
        />
      ) : null}
      <DekontPrintRoot dekont={lastDekont} />
    </section>
  )
}
