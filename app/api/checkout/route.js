import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  const body = await request.json()
  const { variantId } = body

  if (!variantId) {
    return Response.json({ error: 'variantId is required' }, { status: 400 })
  }

  // Fetch variant + product
  const { data: variant, error } = await supabase
    .from('variants')
    .select('*, products(name, image_url)')
    .eq('id', variantId)
    .eq('in_stock', true)
    .single()

  if (error || !variant) {
    return Response.json({ error: 'Variant not found or out of stock' }, { status: 404 })
  }

  if (!variant.stripe_price_id) {
    return Response.json({ error: 'Variant has no Stripe price configured' }, { status: 400 })
  }

  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: variant.stripe_price_id, quantity: 1 }],
    success_url: `${origin}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop`,
    metadata: {
      variant_id: variantId,
      product_name: variant.products?.name ?? '',
    },
  })

  return Response.json({ url: session.url })
}
