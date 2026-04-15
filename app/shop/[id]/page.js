import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductClient from './ProductClient'
import ProductPageAnimations from './ProductPageAnimations'

export async function generateMetadata({ params }) {
  const { id } = await params
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (!product) return { title: 'Product Not Found' }
  return {
    title: `${product.name} — Elevate Salon`,
    description: product.description ?? undefined,
  }
}

async function getProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*, variants(*)')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (error || !data) return null
  return data
}

export default async function ProductPage({ params }) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  const inStockVariants = product.variants?.filter((v) => v.in_stock) ?? []

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
        <Link
          href="/shop"
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '10px',
            letterSpacing: '0.12em',
            color: 'var(--text-muted)',
            textDecoration: 'none',
          }}
        >
          ← Shop
        </Link>
      </nav>

      <ProductPageAnimations product={product} inStockVariants={inStockVariants} />
    </div>
  )
}
