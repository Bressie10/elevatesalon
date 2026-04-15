import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Admin — Elevate Salon',
}

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  const adminPassword = process.env.ADMIN_PASSWORD

  // Allow access to login page without auth
  // This layout wraps everything under /admin except /admin/login
  // Auth check is handled per-page for the login route
  const isAuthenticated = session?.value === adminPassword

  return (
    <div className="admin-shell">
      {children}
    </div>
  )
}
