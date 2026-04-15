import { getAdminClient } from '@/lib/supabase'
import { isAdminAuthorized } from '@/lib/adminAuth'

export async function GET(request) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminClient()
  const { data, error } = await db
    .from('products')
    .select('*, variants(*)')
    .order('created_at', { ascending: false })

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data)
}

export async function POST(request) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, image_url, active = true } = body

  if (!name) {
    return Response.json({ error: 'name is required' }, { status: 400 })
  }

  const db = getAdminClient()
  const { data, error } = await db
    .from('products')
    .insert({ name, description, image_url, active })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json(data, { status: 201 })
}
