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

    const db = getAdminClient()
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

  return Response.json({ received: true })
}
