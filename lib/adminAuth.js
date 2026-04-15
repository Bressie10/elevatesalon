/**
 * Verify the admin password from request headers or cookies.
 * Returns true if the request is authorized.
 */
export function isAdminAuthorized(request) {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) return false

  // Check Authorization header: "Bearer <password>"
  const authHeader = request.headers.get('authorization') ?? ''
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    return token === adminPassword
  }

  // Check cookie: admin_session=<password>
  const cookieHeader = request.headers.get('cookie') ?? ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=')
      return [k, v.join('=')]
    })
  )
  return cookies['admin_session'] === adminPassword
}
