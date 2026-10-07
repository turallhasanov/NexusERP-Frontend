import { useEffect, useMemo, useRef, useState } from 'react'
import { checkoutPos } from '@/features/pos/api/checkout-pos'
import { usePosCatalog } from '@/features/pos/api/use-pos-catalog'
import { PosCart } from '@/features/pos/components/PosCart'
import { PosProductGrid } from '@/features/pos/components/PosProductGrid'
import { PosScanner } from '@/features/pos/components/PosScanner'
import { PosStorePicker } from '@/features/pos/components/PosStorePicker'
import { useStores } from '@/features/stores/api/use-stores'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { PAYMENT_CASH } from '@/lib/payment'
import { styles } from '@/lib/styles'
import { getProductByBarcode } from '@/store/inventory-store'

export function PosPage() {
  const { stores } = useStores()
  const [storeId, setStoreId] = useState('')
  const [cart, setCart] = useState([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [payment, setPayment] = useState(PAYMENT_CASH)
  const scannerRef = useRef(null)
  const selectedStore = stores.find((store) => store.id === storeId)
  const catalog = usePosCatalog(selectedStore?.warehouseId)
  const visibleProducts = useMemo(() => {
    const term = query.trim().toLowerCase()

    if (!term) {
      return catalog
    }

    return catalog.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.barcode.includes(term) ||
        product.sku.toLowerCase().includes(term),
    )
  }, [catalog, query])
  useDocumentTitle('POS')

  useEffect(() => {
    if (storeId) {
      scannerRef.current?.focus()
    }
  }, [storeId, cart.length])

  function selectStore(nextStoreId) {
    setStoreId(nextStoreId)
    setCart([])
    setQuery('')
    setError('')
    setNotice('')
  }

  function addProduct(product) {
    const inCart = cart.find((line) => line.productId === product.id)
    const nextQty = (inCart?.quantity ?? 0) + 1

    if (nextQty > product.stock) {
      setError(`Bu depoda yalnız ${product.stock} ədəd var.`)
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
          quantity: 1,
        },
      ]
    })

    return true
  }

  function scanBarcode(raw) {
    const code = raw.trim()

    if (!storeId) {
      setError('Əvvəlcə mağaza seçin.')
      setNotice('')
      return
    }

    if (!code) {
      return
    }

    const match = getProductByBarcode(code)
    const product = catalog.find((item) => item.id === match?.id)

    if (!product) {
      setError('Barkod tapılmadı.')
      setNotice('')
      return
    }

    const added = addProduct(product)

    if (added) {
      setQuery('')
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

  function checkout() {
    const result = checkoutPos({ storeId, lines: cart, payment })

    if (!result.ok) {
      setError(result.error)
      setNotice('')
      return
    }

    setCart([])
    setQuery('')
    setError('')
    setNotice('Satış yazıldı.')
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
          <PosProductGrid products={visibleProducts} storeId={storeId} onAdd={addProduct} />
        </div>
        <PosCart
          cart={cart}
          error={error}
          notice={notice}
          storeName={selectedStore?.name}
          payment={payment}
          onPaymentChange={setPayment}
          onChangeQty={changeQty}
          onClear={() => {
            setCart([])
            setError('')
            setNotice('')
          }}
          onCheckout={checkout}
        />
      </div>
    </section>
  )
}
