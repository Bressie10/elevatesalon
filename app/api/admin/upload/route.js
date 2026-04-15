import { getAdminClient } from '@/lib/supabase'
import { isAdminAuthorized } from '@/lib/adminAuth'

export async function POST(request) {
  if (!isAdminAuthorized(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file) {
    return Response.json({ error: 'No file provided' }, { status: 400 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return Response.json({ error: 'Invalid file type' }, { status: 400 })
  }

  const MAX_SIZE = 5 * 1024 * 1024 // 5MB
  if (file.size > MAX_SIZE) {
    return Response.json({ error: 'File too large (max 5MB)' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()
  const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const bytes = await file.arrayBuffer()

  const db = getAdminClient()
  const { error } = await db.storage
    .from('product-images')
    .upload(fileName, bytes, { contentType: file.type })

  if (error) return Response.json({ error: error.message }, { status: 500 })

  const { data: urlData } = db.storage
    .from('product-images')
    .getPublicUrl(fileName)

  return Response.json({ url: urlData.publicUrl }, { status: 201 })
}
