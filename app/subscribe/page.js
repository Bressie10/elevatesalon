import { getPublicClient } from '@/lib/supabase'
import SubscribeClient from './SubscribeClient'

async function getProductsWithStock() {
  const supabase = getPublicClient()

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id, name, description, image_url,
      variants (
        id, label, price, stripe_price_id, in_stock, stock_quantity,
        reserved_stock ( quantity_reserved )
      )
    `)
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) throw new Error('Failed to load products')

  // Compute available_to_sell for each variant
  return products.map((p) => ({
    ...p,
    variants: (p.variants || []).map((v) => {
      const reserved = v.reserved_stock?.[0]?.quantity_reserved ?? 0
      return {
        ...v,
        available_to_sell: Math.max(0, v.stock_quantity - reserved),
        reserved_stock: undefined,
      }
    }),
  }))
}

export const metadata = {
  title: 'Subscribe — Elevate Salon',
  description: 'Build your monthly bundle and subscribe.',
}

export default async function SubscribePage() {
  let products = []
  let loadError = null

  try {
    products = await getProductsWithStock()
  } catch {
    loadError = 'Unable to load products. Please try again later.'
  }

  return <SubscribeClient products={products} loadError={loadError} />
}
