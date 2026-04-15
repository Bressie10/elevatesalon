export async function POST(request) {
  const body = await request.json()
  const { password } = body

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return Response.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = Response.json({ ok: true })
  response.headers.set(
    'Set-Cookie',
    `admin_session=${password}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${60 * 60 * 24 * 7}`
  )
  return response
}
