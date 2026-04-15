import { getAdminClient } from '@/lib/supabase'
import { isAdminAuthorized } from '@/lib/adminAuth'

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminClient()

  // All active/paused subscriptions with their items
  const { data: subscriptions, error: subErr } = await db
    .from('subscriptions')
    .select(`
      *,
      subscription_items (
        id, variant_id, stripe_item_id, quantity,
        variants (
          id, label, price, stock_quantity,
          products ( id, name )
        )
      )
    `)
    .neq('status', 'cancelled')
    .order('created_at', { ascending: false })

  if (subErr) return Response.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })

  // All variants with their reserved stock (for the stock dashboard)
  const { data: variants, error: vErr } = await db
    .from('variants')
    .select(`
      id, label, price, in_stock, stock_quantity,
      products ( id, name ),
      reserved_stock ( quantity_reserved )
    `)
    .order('created_at', { ascending: false })

  if (vErr) return Response.json({ error: 'Failed to fetch stock data' }, { status: 500 })

  // Monthly subscription orders (orders with a subscription_id, this calendar month)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { data: monthlyOrders, error: ordErr } = await db
    .from('orders')
    .select('*')
    .not('subscription_id', 'is', null)
    .gte('created_at', monthStart.toISOString())
    .order('created_at', { ascending: false })

  if (ordErr) return Response.json({ error: 'Failed to fetch monthly orders' }, { status: 500 })

  return Response.json({ subscriptions: subscriptions || [], variants: variants || [], monthlyOrders: monthlyOrders || [] })
}
