'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const s = {
  shell: {
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontFamily: 'var(--font-geist-sans)',
  },
  nav: {
    borderBottom: '1px solid var(--border)',
    padding: '0 24px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'var(--surface)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  logo: {
    fontSize: '13px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    color: 'var(--gold)',
    fontWeight: '500',
    textDecoration: 'none',
  },
  navLink: {
    fontSize: '12px',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    letterSpacing: '0.05em',
  },
  main: {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '32px 16px 64px',
  },
  pageTitle: {
    fontSize: 'clamp(22px, 5vw, 36px)',
    fontWeight: '300',
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: 'var(--text-muted)',
    marginBottom: '36px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '32px',
  },
  sectionLabel: {
    fontSize: '11px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '16px',
    fontWeight: '500',
  },
  productCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    marginBottom: '12px',
    overflow: 'hidden',
  },
  productHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
  },
  productImg: {
    width: '48px',
    height: '48px',
    objectFit: 'cover',
    borderRadius: '6px',
    background: 'var(--surface-2)',
    flexShrink: 0,
  },
  productImgPlaceholder: {
    width: '48px',
    height: '48px',
    background: 'var(--surface-2)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text-dim)',
    fontSize: '18px',
    flexShrink: 0,
  },
  productName: {
    fontSize: '15px',
    fontWeight: '500',
  },
  productDesc: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  variantsWrap: {
    borderTop: '1px solid var(--border)',
    padding: '8px 16px 12px',
    background: 'var(--bg)',
  },
  variantRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0',
    borderBottom: '1px solid var(--border)',
    fontSize: '13px',
  },
  variantLabel: { flex: 1, color: 'var(--text)' },
  variantPrice: { color: 'var(--gold)', fontWeight: '500', minWidth: '52px', textAlign: 'right' },
  variantAvail: { fontSize: '11px', color: 'var(--text-dim)', minWidth: '60px', textAlign: 'right' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: '8px' },
  qtyBtn: {
    width: '26px',
    height: '26px',
    background: 'var(--surface-2)',
    border: '1px solid var(--border-2)',
    borderRadius: '4px',
    color: 'var(--text)',
    fontSize: '16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    padding: 0,
  },
  qtyNum: { minWidth: '20px', textAlign: 'center', fontSize: '14px' },
  summaryBox: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '20px',
  },
  summaryTitle: {
    fontSize: '11px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '16px',
    fontWeight: '500',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    marginBottom: '8px',
    color: 'var(--text)',
  },
  summaryEmpty: { fontSize: '13px', color: 'var(--text-dim)' },
  divider: { borderTop: '1px solid var(--border)', margin: '12px 0' },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '15px',
    fontWeight: '600',
  },
  formSection: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '20px',
  },
  field: { marginBottom: '16px' },
  label: {
    display: 'block',
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    background: 'var(--surface-2)',
    border: '1px solid var(--border-2)',
    borderRadius: '6px',
    padding: '10px 14px',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  hint: { fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' },
  btnGold: {
    width: '100%',
    background: 'var(--gold)',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    padding: '14px 24px',
    fontSize: '13px',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginTop: '8px',
  },
  errText: { color: 'var(--error)', fontSize: '13px', marginTop: '10px' },
}

export default function SubscribeClient({ products, loadError }) {
  const router = useRouter()
  const [selected, setSelected] = useState({}) // { variantId: quantity }
  const [email, setEmail] = useState('')
  const [billingDay, setBillingDay] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function setQty(variantId, qty) {
    setSelected((prev) => {
      if (qty <= 0) {
        const next = { ...prev }
        delete next[variantId]
        return next
      }
      return { ...prev, [variantId]: qty }
    })
  }

  // Build flat list of selected variants with their info for the summary
  const allVariants = products.flatMap((p) =>
    p.variants.map((v) => ({ ...v, productName: p.name }))
  )

  const selectedItems = Object.entries(selected)
    .map(([variantId, quantity]) => {
      const variant = allVariants.find((v) => v.id === variantId)
      return variant ? { ...variant, quantity } : null
    })
    .filter(Boolean)

  const total = selectedItems.reduce((sum, v) => sum + Number(v.price) * v.quantity, 0)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (selectedItems.length === 0) {
      return setError('Select at least one item to subscribe.')
    }
    if (!email.trim()) return setError('Email is required.')
    const day = parseInt(billingDay, 10)
    if (!day || day < 1 || day > 28) return setError('Choose a billing day between 1 and 28.')

    setLoading(true)

    const items = selectedItems.map((v) => ({ variantId: v.id, quantity: v.quantity }))

    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), billingDay: day, items }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) return setError(data.error || 'Something went wrong. Please try again.')

    router.push('/subscribe/success')
  }

  if (loadError) {
    return (
      <div style={s.shell}>
        <nav style={s.nav}>
          <Link href="/" style={s.logo}>Elevate Salon</Link>
          <Link href="/shop" style={s.navLink}>Shop</Link>
        </nav>
        <div style={{ ...s.main, textAlign: 'center', paddingTop: '80px' }}>
          <p style={{ color: 'var(--error)' }}>{loadError}</p>
        </div>
      </div>
    )
  }

  return (
    <div style={s.shell}>
      <nav style={s.nav}>
        <Link href="/" style={s.logo}>Elevate Salon</Link>
        <Link href="/shop" style={s.navLink}>Shop</Link>
      </nav>

      <main style={s.main}>
        <h1 style={s.pageTitle}>Monthly Bundle</h1>
        <p style={s.pageSubtitle}>
          Choose your products, pick a billing day, and we'll send your invoice each month.
        </p>

        <div style={s.layout}>
          {/* Product catalogue */}
          <div>
            <p style={s.sectionLabel}>Choose your products</p>
            {products.length === 0 && (
              <p style={{ color: 'var(--text-dim)', fontSize: '14px' }}>No products available yet.</p>
            )}
            {products.map((product) => (
              <div key={product.id} style={s.productCard}>
                <div style={s.productHeader}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} style={s.productImg} />
                  ) : (
                    <div style={s.productImgPlaceholder}>✦</div>
                  )}
                  <div>
                    <p style={s.productName}>{product.name}</p>
                    {product.description && (
                      <p style={s.productDesc}>{product.description}</p>
                    )}
                  </div>
                </div>

                <div style={s.variantsWrap}>
                  {product.variants.map((variant, idx) => {
                    const unavailable = variant.available_to_sell === 0
                    const qty = selected[variant.id] || 0
                    return (
                      <div
                        key={variant.id}
                        style={{
                          ...s.variantRow,
                          ...(idx === product.variants.length - 1 ? { borderBottom: 'none' } : {}),
                          opacity: unavailable ? 0.4 : 1,
                          pointerEvents: unavailable ? 'none' : 'auto',
                        }}
                      >
                        <span style={s.variantLabel}>{variant.label}</span>
                        <span style={s.variantPrice}>€{Number(variant.price).toFixed(2)}</span>
                        <span style={s.variantAvail}>
                          {unavailable ? 'Out of stock' : `${variant.available_to_sell} left`}
                        </span>
                        <div style={s.qtyControl}>
                          <button
                            type="button"
                            style={s.qtyBtn}
                            onClick={() => setQty(variant.id, qty - 1)}
                            disabled={qty === 0}
                          >
                            −
                          </button>
                          <span style={s.qtyNum}>{qty}</span>
                          <button
                            type="button"
                            style={s.qtyBtn}
                            onClick={() => setQty(variant.id, Math.min(qty + 1, variant.available_to_sell))}
                            disabled={qty >= variant.available_to_sell}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Summary + form */}
          <div>
            <p style={s.sectionLabel}>Your bundle</p>
            <div style={s.summaryBox}>
              {selectedItems.length === 0 ? (
                <p style={s.summaryEmpty}>No items selected yet.</p>
              ) : (
                selectedItems.map((v) => (
                  <div key={v.id} style={s.summaryItem}>
                    <span>{v.productName} — {v.label}{v.quantity > 1 ? ` ×${v.quantity}` : ''}</span>
                    <span>€{(Number(v.price) * v.quantity).toFixed(2)}</span>
                  </div>
                ))
              )}

              {selectedItems.length > 0 && (
                <>
                  <div style={s.divider} />
                  <div style={s.totalRow}>
                    <span>Monthly total</span>
                    <span style={{ color: 'var(--gold)' }}>€{total.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            <div style={{ marginTop: '20px' }}>
              <p style={s.sectionLabel}>Your details</p>
              <form onSubmit={handleSubmit} style={s.formSection}>
                <div style={s.field}>
                  <label style={s.label} htmlFor="sub-email">Email address</label>
                  <input
                    id="sub-email"
                    type="email"
                    style={s.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div style={s.field}>
                  <label style={s.label} htmlFor="sub-billing-day">Billing day (1–28)</label>
                  <input
                    id="sub-billing-day"
                    type="number"
                    min="1"
                    max="28"
                    style={s.input}
                    value={billingDay}
                    onChange={(e) => setBillingDay(e.target.value)}
                    placeholder="e.g. 1"
                    required
                  />
                  <p style={s.hint}>
                    Your invoice will be sent on this day each month. You'll have 7 days to pay.
                  </p>
                </div>

                {error && <p style={s.errText}>{error}</p>}

                <button type="submit" style={s.btnGold} disabled={loading}>
                  {loading ? 'Setting up…' : 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
