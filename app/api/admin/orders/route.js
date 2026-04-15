import { getAdminClient } from '@/lib/supabase'
import { isAdminAuthorized } from '@/lib/adminAuth'

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.trim() || ''
  const type = searchParams.get('type') || 'all' // all | shop | subscription

  const db = getAdminClient()

  let query = db
    .from('orders')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(500)

  if (search) {
    query = query.ilike('email', `%${search}%`)
  }

  if (type === 'shop') {
    query = query.is('subscription_id', null)
  } else if (type === 'subscription') {
    query = query.not('subscription_id', 'is', null)
  }

  const { data: orders, error, count } = await query

  if (error) return Response.json({ error: 'Failed to fetch orders' }, { status: 500 })

  const allOrders = orders || []

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const shopCount    = allOrders.filter((o) => !o.subscription_id).length
  const subCount     = allOrders.filter((o) =>  o.subscription_id).length

  // ── Fulfillment aggregate: subscription orders this calendar month ──────────
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const thisMonthSubOrders = allOrders.filter(
    (o) => o.subscription_id && new Date(o.created_at) >= monthStart
  )

  // Aggregate items across all this-month subscription orders
  const fulfillMap = {}
  thisMonthSubOrders.forEach((order) => {
    if (!Array.isArray(order.items)) return
    order.items.forEach((item) => {
      const key = item.description || 'Unknown item'
      if (!fulfillMap[key]) fulfillMap[key] = { qty: 0, orders: 0 }
      fulfillMap[key].qty    += item.quantity || 1
      fulfillMap[key].orders += 1
    })
  })

  const fulfillment = Object.entries(fulfillMap)
    .map(([item, data]) => ({ item, qty: data.qty, orders: data.orders }))
    .sort((a, b) => b.qty - a.qty)

  return Response.json({
    orders: allOrders,
    count:  count || 0,
    stats: {
      totalOrders:  count  || 0,
      totalRevenue,
      shopCount,
      subCount,
      thisMonthSubOrders: thisMonthSubOrders.length,
    },
    fulfillment,
  })
}
