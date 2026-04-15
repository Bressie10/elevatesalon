import { getAdminClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import { isAdminAuthorized } from '@/lib/adminAuth'

export async function PUT(request, { params }) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { label, price, in_stock, stock_quantity } = body

  const db = getAdminClient()

  // Fetch current variant
  const { data: existing, error: fetchError } = await db
    .from('variants')
    .select('*, products(name)')
    .eq('id', id)
    .single()

  if (fetchError) return Response.json({ error: 'Variant not found' }, { status: 404 })

  const updates = {}

  // If price changed, create new Stripe price and archive old one
  if (price != null && price !== existing.price) {
    // Archive old price
    if (existing.stripe_price_id) {
      await stripe.prices.update(existing.stripe_price_id, { active: false }).catch(() => null)
    }

    // Create new price
    const newStripePrice = await stripe.prices.create({
      product: existing.stripe_product_id,
      unit_amount: Math.round(price * 100),
      currency: 'eur',
    })

    updates.price = price
    updates.stripe_price_id = newStripePrice.id
  }

  if (label != null) updates.label = label
  if (in_stock != null) updates.in_stock = in_stock
  if (stock_quantity != null) updates.stock_quantity = stock_quantity

  const { data, error } = await db
    .from('variants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function DELETE(request, { params }) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const db = getAdminClient()

  const { data: variant } = await db
    .from('variants')
    .select('stripe_price_id')
    .eq('id', id)
    .single()

  if (variant?.stripe_price_id) {
    await stripe.prices.update(variant.stripe_price_id, { active: false }).catch(() => null)
  }

  const { error } = await db.from('variants').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
