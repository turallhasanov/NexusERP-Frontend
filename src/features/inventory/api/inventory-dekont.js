import { formatDate, toDateInput } from '@/lib/date'
import { formatAzn } from '@/lib/money'
import { openReportPdf } from '@/lib/pdf'
import { getProductType } from '@/store/product-types-store'
import { formatQuantity } from '@/store/product-units-store'

export function inventoryStockValue(products) {
  return products.reduce((sum, product) => sum + product.quantity * product.unitPrice, 0)
}

export function buildInventoryDekont(products, warehouses) {
  const criticalStock = products.filter((product) => product.quantity <= product.minQuantity).length

  return {
    title: 'Anbar hesabatı',
    meta: [
      { label: 'Tarix', value: formatDate(toDateInput()) },
      { label: 'Depo sayı', value: String(warehouses.length) },
      { label: 'Məhsul sayı', value: String(products.length) },
      { label: 'Kritik ehtiyat', value: String(criticalStock) },
    ],
    table: {
      columns: ['Məhsul', 'Tip', 'Qiymət', 'Miqdar', 'Dəyər', 'Status'],
      rows: products.map((product) => [
        product.name,
        getProductType(product.typeId)?.name ?? '—',
        formatAzn(product.unitPrice),
        formatQuantity(product.quantity, product.unitId),
        formatAzn(product.quantity * product.unitPrice),
        product.quantity <= product.minQuantity ? 'Kritik' : 'Kifayətdir',
      ]),
      empty: 'Hələ məhsul yoxdur.',
    },
    totals: [{ label: 'Cəm dəyər', value: formatAzn(inventoryStockValue(products)), strong: true }],
    footer: 'NexusERP anbar hesabatı',
  }
}

export function openInventoryDekontPdf(products, warehouses) {
  return openReportPdf('anbar-hesabati.pdf', buildInventoryDekont(products, warehouses))
}
