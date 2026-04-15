import { getAdminClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'

// Returns true if today is within 14 days of the next billing date
function isEditLocked(billingDay) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  let next = new Date(year, month, billingDay)
  if (next.getTime() <= now.getTime()) next = new Date(year, month + 1, billingDay)
  const daysUntil = (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return daysUntil <= 14
}

function nextBillingDate(billingDay) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  let next = new Date(year, month, billingDay)
  if (next.getTime() <= now.getTime()) next = new Date(year, month + 1, billingDay)
  return next.toISOString().split('T')[0] // YYYY-MM-DD
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')?.trim()

  if (!email) return Response.json({ error: 'Email required' }, { status: 400 })

  const db = getAdminClient()
  const { data: subscription, error } = await db
    .from('subscriptions')
    .select(`
      *,
      subscription_items (
        id, variant_id, stripe_item_id, quantity,
        variants (
          id, label, price, stripe_price_id, stock_quantity,
          products ( id, name, image_url )
        )
      )
    `)
    .eq('user_email', email)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return Response.json({ error: 'Failed to fetch subscription' }, { status: 500 })
  if (!subscription) return Response.json({ subscription: null })

  // Fetch reserved stock and order history in parallel
  const variantIds = subscription.subscription_items.map((i) => i.variant_id)
  const [reservedResult, ordersResult] = await Promise.all([
    variantIds.length
      ? db.from('reserved_stock').select('variant_id, quantity_reserved').in('variant_id', variantIds)
      : Promise.resolve({ data: [] }),
    db.from('orders')
      .select('id, created_at, total, items, stripe_session_id')
      .eq('subscription_id', subscription.id)
      .order('created_at', { ascending: false })
      .limit(12),
  ])

  return Response.json({
    subscription,
    reserved: reservedResult.data || [],
    orders: ordersResult.data || [],
    locked: isEditLocked(subscription.billing_day),
    nextBillingDate: nextBillingDate(subscription.billing_day),
  })
}

export async function PUT(request) {
  try {
    const { email, items } = await request.json()
    // items: [{ variantId, quantity }]

    if (!email || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = getAdminClient()

    // Get current subscription with its items
    const { data: sub, error: subErr } = await db
      .from('subscriptions')
      .select('id, stripe_subscription_id, subscription_items(id, variant_id, stripe_item_id, quantity)')
      .eq('user_email', email)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (subErr || !sub) {
      return Response.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // 14-day lock before billing date
    if (isEditLocked(sub.billing_day)) {
      return Response.json(
        { error: `Your bundle is locked within 14 days of your billing date (${nextBillingDate(sub.billing_day)}). Changes will re-open after that invoice is sent.` },
        { status: 403 }
      )
    }

    const newVariantIds = items.map((i) => i.variantId)
    const oldVariantIds = sub.subscription_items.map((i) => i.variant_id)
    const allVariantIds = [...new Set([...newVariantIds, ...oldVariantIds])]

    const { data: variants } = await db
      .from('variants')
      .select('id, label, stripe_price_id, stock_quantity')
      .in('id', allVariantIds)

    // Check stock: available = stock_quantity - reserved + current_sub_qty
    const { data: reserved } = await db
      .from('reserved_stock')
      .select('variant_id, quantity_reserved')
      .in('variant_id', allVariantIds)

    const reservedMap = {}
    reserved?.forEach((r) => { reservedMap[r.variant_id] = r.quantity_reserved })

    for (const item of items) {
      const variant = variants?.find((v) => v.id === item.variantId)
      if (!variant) return Response.json({ error: 'Variant not found' }, { status: 400 })
      const currentSubItem = sub.subscription_items.find((i) => i.variant_id === item.variantId)
      const currentSubQty = currentSubItem?.quantity || 0
      const totalReserved = reservedMap[item.variantId] || 0
      // Release this subscription's current reservation before checking new qty
      const available = variant.stock_quantity - totalReserved + currentSubQty
      if (available < item.quantity) {
        return Response.json({ error: `Insufficient stock for "${variant.label}"` }, { status: 400 })
      }
    }

    // Build Stripe update payload
    const stripeUpdateItems = []

    for (const current of sub.subscription_items) {
      const newItem = items.find((i) => i.variantId === current.variant_id)
      if (!newItem) {
        stripeUpdateItems.push({ id: current.stripe_item_id, deleted: true })
      } else if (newItem.quantity !== current.quantity) {
        stripeUpdateItems.push({ id: current.stripe_item_id, quantity: newItem.quantity })
      }
    }

    for (const item of items) {
      const exists = sub.subscription_items.find((i) => i.variant_id === item.variantId)
      if (!exists) {
        const variant = variants?.find((v) => v.id === item.variantId)
        stripeUpdateItems.push({ price: variant.stripe_price_id, quantity: item.quantity })
      }
    }

    let updatedStripeSub = null
    if (stripeUpdateItems.length > 0) {
      updatedStripeSub = await stripe.subscriptions.update(sub.stripe_subscription_id, {
        items: stripeUpdateItems,
        proration_behavior: 'none',
      })
    }

    // Replace subscription_items in DB
    await db.from('subscription_items').delete().eq('subscription_id', sub.id)

    const newStripeItems = updatedStripeSub?.items?.data || []
    const itemsToInsert = items.map((item) => {
      const variant = variants?.find((v) => v.id === item.variantId)
      const stripeItem = newStripeItems.find((si) => si.price.id === variant?.stripe_price_id)
      const oldItem = sub.subscription_items.find((i) => i.variant_id === item.variantId)
      return {
        subscription_id: sub.id,
        variant_id: item.variantId,
        stripe_item_id: stripeItem?.id ?? oldItem?.stripe_item_id ?? null,
        quantity: item.quantity,
      }
    })

    await db.from('subscription_items').insert(itemsToInsert)

    // Recalculate reserved_stock for all affected variants
    // Build a delta map: variantId -> net change in reservation
    const delta = {}
    for (const old of sub.subscription_items) {
      delta[old.variant_id] = (delta[old.variant_id] || 0) - old.quantity
    }
    for (const item of items) {
      delta[item.variantId] = (delta[item.variantId] || 0) + item.quantity
    }

    for (const [variantId, change] of Object.entries(delta)) {
      if (change === 0) continue
      const current = reservedMap[variantId] || 0
      await db.from('reserved_stock').upsert({
        variant_id: variantId,
        quantity_reserved: Math.max(0, current + change),
      })
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Account update error:', err)
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')?.trim()

    if (!email) return Response.json({ error: 'Email required' }, { status: 400 })

    const db = getAdminClient()

    const { data: sub, error: subErr } = await db
      .from('subscriptions')
      .select('id, stripe_subscription_id, subscription_items(variant_id, quantity)')
      .eq('user_email', email)
      .neq('status', 'cancelled')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (subErr || !sub) {
      return Response.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Cancel in Stripe
    await stripe.subscriptions.cancel(sub.stripe_subscription_id)

    // Mark cancelled in DB
    await db.from('subscriptions').update({ status: 'cancelled' }).eq('id', sub.id)

    // Release reserved stock
    const variantIds = sub.subscription_items.map((i) => i.variant_id)
    if (variantIds.length > 0) {
      const { data: reserved } = await db
        .from('reserved_stock')
        .select('variant_id, quantity_reserved')
        .in('variant_id', variantIds)

      const reservedMap = {}
      reserved?.forEach((r) => { reservedMap[r.variant_id] = r.quantity_reserved })

      for (const item of sub.subscription_items) {
        const current = reservedMap[item.variant_id] || 0
        await db.from('reserved_stock').upsert({
          variant_id: item.variant_id,
          quantity_reserved: Math.max(0, current - item.quantity),
        })
      }
    }

    return Response.json({ success: true })
  } catch (err) {
    console.error('Cancel subscription error:', err)
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}
