import { getAdminClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'

// Returns Unix timestamp for the next occurrence of billingDay (1-28),
// always at least 24 hours in the future so Stripe accepts it.
function nextBillingAnchor(billingDay) {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  let d = new Date(Date.UTC(year, month, billingDay))
  const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  if (d <= cutoff) {
    d = new Date(Date.UTC(year, month + 1, billingDay))
  }
  return Math.floor(d.getTime() / 1000)
}

export async function POST(request) {
  try {
    const { email, billingDay, items } = await request.json()

    if (!email || !billingDay || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (billingDay < 1 || billingDay > 28) {
      return Response.json({ error: 'Billing day must be between 1 and 28' }, { status: 400 })
    }

    const db = getAdminClient()
    const variantIds = items.map((i) => i.variantId)

    // Fetch variants
    const { data: variants, error: vErr } = await db
      .from('variants')
      .select('id, label, price, stripe_price_id, stock_quantity')
      .in('id', variantIds)

    if (vErr || !variants?.length) {
      return Response.json({ error: 'Failed to fetch variants' }, { status: 500 })
    }

    // Fetch current reserved stock
    const { data: reserved } = await db
      .from('reserved_stock')
      .select('variant_id, quantity_reserved')
      .in('variant_id', variantIds)

    const reservedMap = {}
    reserved?.forEach((r) => { reservedMap[r.variant_id] = r.quantity_reserved })

    // Check availability
    for (const item of items) {
      const variant = variants.find((v) => v.id === item.variantId)
      if (!variant) {
        return Response.json({ error: 'Variant not found' }, { status: 400 })
      }
      if (!variant.stripe_price_id) {
        return Response.json(
          { error: `Variant "${variant.label}" is not configured for purchase` },
          { status: 400 }
        )
      }
      const available = variant.stock_quantity - (reservedMap[item.variantId] || 0)
      if (available < item.quantity) {
        return Response.json(
          { error: `Insufficient stock for "${variant.label}"` },
          { status: 400 }
        )
      }
    }

    // Create Stripe Customer
    const customer = await stripe.customers.create({ email })

    // Create Stripe Subscription (send_invoice = Stripe emails the invoice)
    const stripeItems = items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)
      return { price: variant.stripe_price_id, quantity: item.quantity }
    })

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: stripeItems,
      billing_cycle_anchor: nextBillingAnchor(billingDay),
      proration_behavior: 'none',
      collection_method: 'send_invoice',
      days_until_due: 7,
    })

    // Save subscription to DB
    const { data: sub, error: subErr } = await db
      .from('subscriptions')
      .insert({
        user_email: email,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customer.id,
        billing_day: billingDay,
        status: 'active',
      })
      .select()
      .single()

    if (subErr) {
      await stripe.subscriptions.cancel(subscription.id).catch(() => {})
      await stripe.customers.del(customer.id).catch(() => {})
      return Response.json({ error: 'Failed to save subscription' }, { status: 500 })
    }

    // Save subscription items (store Stripe item IDs for future updates)
    const stripeSubItems = subscription.items.data
    const itemsToInsert = items.map((item) => {
      const variant = variants.find((v) => v.id === item.variantId)
      const stripeItem = stripeSubItems.find((si) => si.price.id === variant.stripe_price_id)
      return {
        subscription_id: sub.id,
        variant_id: item.variantId,
        stripe_item_id: stripeItem?.id ?? null,
        quantity: item.quantity,
      }
    })

    await db.from('subscription_items').insert(itemsToInsert)

    // Update reserved_stock
    for (const item of items) {
      const current = reservedMap[item.variantId] || 0
      await db.from('reserved_stock').upsert({
        variant_id: item.variantId,
        quantity_reserved: current + item.quantity,
      })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Subscribe error:', err)
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
