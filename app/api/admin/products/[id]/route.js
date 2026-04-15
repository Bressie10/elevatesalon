import { getAdminClient } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import { isAdminAuthorized } from '@/lib/adminAuth'

export async function GET(request, { params }) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const db = getAdminClient()
  const { data, error } = await db
    .from('products')
    .select('*, variants(*)')
    .eq('id', id)
    .single()

  if (error) return Response.json({ error: error.message }, { status: 404 })
  return Response.json(data)
}

export async function PUT(request, { params }) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { name, description, image_url, active } = body

  const db = getAdminClient()
  const { data, error } = await db
    .from('products')
    .update({ name, description, image_url, active })
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

  // Archive associated Stripe prices before deleting
  const { data: variants } = await db
    .from('variants')
    .select('stripe_price_id')
    .eq('product_id', id)

  if (variants?.length) {
    await Promise.allSettled(
      variants
        .filter((v) => v.stripe_price_id)
        .map((v) =>
          stripe.prices.update(v.stripe_price_id, { active: false }).catch(() => null)
        )
    )
  }

  const { error } = await db.from('products').delete().eq('id', id)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
