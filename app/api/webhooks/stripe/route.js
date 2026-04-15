import { stripe } from '@/lib/stripe'
import { getAdminClient } from '@/lib/supabase'
import { headers } from 'next/headers'

export async function POST(request) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Stripe webhook signature error:', err.message)
    return Response.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const db = getAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    // Fetch line items for full order detail
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ['data.price.product'],
    })

    const items = lineItems.data.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      amount_total: item.amount_total,
      price_id: item.price?.id,
    }))

    const { error } = await db.from('orders').insert({
      stripe_session_id: session.id,
      items,
      total: session.amount_total,
      email: session.customer_details?.email ?? null,
    })

    if (error) {
      console.error('Failed to log order:', error.message)
      return Response.json({ error: 'Failed to log order' }, { status: 500 })
    }
  }

  if (event.type === 'invoice.paid') {
    const invoice = event.data.object

    // Only handle subscription invoices (not one-off)
    if (!invoice.subscription) {
      return Response.json({ received: true })
    }

    // Find our subscription record
    const { data: sub } = await db
      .from('subscriptions')
      .select('id, subscription_items(variant_id, quantity, variants(label, price))')
      .eq('stripe_subscription_id', invoice.subscription)
      .maybeSingle()

    // Mark subscription active (may have been paused on a failed attempt)
    if (sub) {
      await db.from('subscriptions').update({ status: 'active' }).eq('id', sub.id)
    }

    // Build items from subscription_items for packing/shipping reference
    const items = sub?.subscription_items?.map((si) => ({
      description: `${si.variants?.label ?? 'Item'}`,
      quantity: si.quantity,
      amount_total: Math.round(Number(si.variants?.price ?? 0) * 100) * si.quantity,
      price_id: null,
    })) ?? invoice.lines.data.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      amount_total: line.amount,
      price_id: line.price?.id,
    }))

    // Insert order (use invoice ID as the session identifier)
    const { error: ordErr } = await db.from('orders').insert({
      stripe_session_id: invoice.id,
      items,
      total: invoice.amount_paid,
      email: invoice.customer_email,
      subscription_id: sub?.id ?? null,
    })

    if (ordErr && ordErr.code !== '23505') {
      // 23505 = unique_violation (duplicate invoice, safe to ignore)
      console.error('Failed to log subscription order:', ordErr.message)
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object
    if (!invoice.subscription) return Response.json({ received: true })

    await db
      .from('subscriptions')
      .update({ status: 'paused' })
      .eq('stripe_subscription_id', invoice.subscription)
  }

  if (event.type === 'customer.subscription.deleted') {
    const stripeSub = event.data.object

    // Find subscription in DB
    const { data: sub } = await db
      .from('subscriptions')
      .select('id, subscription_items(variant_id, quantity)')
      .eq('stripe_subscription_id', stripeSub.id)
      .maybeSingle()

    if (!sub) return Response.json({ received: true })

    // Mark cancelled
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
  }

  return Response.json({ received: true })
}
