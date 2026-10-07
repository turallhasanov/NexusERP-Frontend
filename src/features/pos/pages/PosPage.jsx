import { useState } from 'react'
import { PageContainer } from '@/components/layout/PageContainer'
import { checkoutPos } from '@/features/pos/api/checkout-pos'
import { usePosCatalog } from '@/features/pos/api/use-pos-catalog'
import { PosCart } from '@/features/pos/components/PosCart'
import { PosProductGrid } from '@/features/pos/components/PosProductGrid'
import { PosStorePicker } from '@/features/pos/components/PosStorePicker'
import { useStores } from '@/features/stores/api/use-stores'
import { useDocumentTitle } from '@/hooks/use-document-title'
import { styles } from '@/lib/styles'

export function PosPage() {
  const { stores } = useStores()
  const [storeId, setStoreId] = useState('')
  const [cart, setCart] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const selectedStore = stores.find((store) => store.id === storeId)
  const catalog = usePosCatalog(selectedStore?.warehouseId)
  useDocumentTitle('POS')

  function selectStore(nextStoreId) {
    setStoreId(nextStoreId)
    setCart([])
    setError('')
    setNotice('')
  }

  function addProduct(product) {
    const inCart = cart.find((line) => line.productId === product.id)
    const nextQty = (inCart?.quantity ?? 0) + 1

    if (nextQty > product.stock) {
      setError(`Bu depoda yalnız ${product.stock} ədəd var.`)
      setNotice('')
      return
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
          unitPrice: product.unitPrice,
          quantity: 1,
        },
      ]
    })
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
    const result = checkoutPos({ storeId, lines: cart })

    if (!result.ok) {
      setError(result.error)
      setNotice('')
      return
    }

    setCart([])
    setError('')
    setNotice('Satış yazıldı.')
  }

  return (
    <PageContainer title="POS" description="Pərakəndə kassa. Qiymət və stok API gələndə buradan oxunacaq.">
      <PosStorePicker stores={stores} storeId={storeId} onSelect={selectStore} />
      <div className={styles.posLayout}>
        <PosProductGrid products={catalog} storeId={storeId} onAdd={addProduct} />
        <PosCart
          cart={cart}
          error={error}
          notice={notice}
          storeName={selectedStore?.name}
          onChangeQty={changeQty}
          onClear={() => {
            setCart([])
            setError('')
            setNotice('')
          }}
          onCheckout={checkout}
        />
      </div>
    </PageContainer>
  )
}
