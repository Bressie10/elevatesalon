import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import ProductCard from './ProductCard'
import ShopHero from './ShopHero'

export const metadata = {
  title: 'Shop — Elevate Salon',
  description: 'Premium barbershop products for the modern gentleman.',
}

async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, variants(*)')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export default async function ShopPage() {
  let products = []
  let fetchError = null

  try {
    products = await getProducts()
  } catch (err) {
    fetchError = err.message
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'rgba(9,9,9,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '0 32px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '11px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
            textDecoration: 'none',
          }}
        >
          Elevate Salon
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <span
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--text-dim)',
            }}
          >
            The Collection
          </span>
          <Link
            href="/subscribe"
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '10px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              textDecoration: 'none',
            }}
          >
            Subscribe
          </Link>
        </div>
      </nav>

      {/* Animated hero */}
      <ShopHero />

      {/* Products grid */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 96px' }}>
        {fetchError && (
          <div
            style={{
              background: 'rgba(224,82,82,0.08)',
              border: '1px solid rgba(224,82,82,0.3)',
              borderRadius: '8px',
              padding: '16px 20px',
              color: 'var(--error)',
              fontSize: '13px',
            }}
          >
            Failed to load products: {fetchError}
          </div>
        )}

        {!fetchError && products.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '80px 0' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No products yet.</p>
            <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
              Add products in the <Link href="/admin" style={{ color: 'var(--gold)', textDecoration: 'none' }}>admin panel</Link>.
            </p>
          </div>
        )}

        {!fetchError && products.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: '28px',
            }}
          >
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
