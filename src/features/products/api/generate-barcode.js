import { apiClient } from '@/services/api-client'

// A free in-store EAN-13 ("20…") to prefill the form. Not reserved: saving still fails if another product
// takes it first.
export async function generateBarcode() {
  try {
    const { barcode } = await apiClient.get('/products/generate-barcode')
    return { ok: true, barcode }
  } catch (error) {
    return { ok: false, error: error.message }
  }
}
