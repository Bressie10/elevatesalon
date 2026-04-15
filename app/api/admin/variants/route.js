import { getAdminClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import { isAdminAuthorized } from '@/lib/adminAuth'

export async function POST(request) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { product_id, label, price, in_stock = true } = body

  if (!product_id || !label || price == null) {
    return Response.json(
      { error: 'product_id, label, and price are required' },
      { status: 400 }
    )
  }

  const db = getAdminClient()

  // Fetch the product for Stripe
  const { data: product, error: productError } = await db
    .from('products')
    .select('name')
    .eq('id', product_id)
    .single()

  if (productError) {
    return Response.json({ error: 'Product not found' }, { status: 404 })
  }

  // Create Stripe product + price
  const stripeProduct = await stripe.products.create({
    name: `${product.name} — ${label}`,
  })

  const stripePrice = await stripe.prices.create({
    product: stripeProduct.id,
    unit_amount: Math.round(price * 100),
    currency: 'eur',
  })

  const { data, error } = await db
    .from('variants')
    .insert({
      product_id,
      label,
      price,
      in_stock,
      stripe_price_id: stripePrice.id,
      stripe_product_id: stripeProduct.id,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
