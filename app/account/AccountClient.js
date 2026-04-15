'use client'

import { useState } from 'react'
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
  },
  main: { maxWidth: '680px', margin: '0 auto', padding: '32px 16px 64px' },
  pageTitle: {
    fontSize: 'clamp(22px, 5vw, 36px)',
    fontWeight: '300',
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  pageSub: { fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' },
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
  btnGold: {
    background: 'var(--gold)',
    color: '#000',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 20px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginTop: '12px',
    whiteSpace: 'nowrap',
  },
  btnOutline: {
    background: 'transparent',
    color: 'var(--text-muted)',
    border: '1px solid var(--border-2)',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  btnDanger: {
    background: 'transparent',
    color: 'var(--error)',
    border: '1px solid var(--error)',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '12px',
    cursor: 'pointer',
    opacity: 0.8,
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '16px',
  },
  sectionLabel: {
    fontSize: '11px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--text-muted)',
    marginBottom: '16px',
    fontWeight: '500',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 0',
    borderBottom: '1px solid var(--border)',
    fontSize: '13px',
  },
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
  divider: { borderTop: '1px solid var(--border)', margin: '14px 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '15px' },
  errText: { color: 'var(--error)', fontSize: '13px', marginTop: '10px' },
  successText: { color: 'var(--success)', fontSize: '13px', marginTop: '10px' },
  metaRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' },
  metaKey: { color: 'var(--text-muted)' },
}

// ─── Subscription bundle editor ────────────────────────────────────────────────

function BundleEditor({ subscription, onCancel }) {
  const [qtys, setQtys] = useState(() => {
    const map = {}
    subscription.subscription_items.forEach((i) => { map[i.variant_id] = i.quantity })
    return map
  })
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function setQty(variantId, qty, max) {
    setQtys((prev) => {
      if (qty <= 0) {
        const next = { ...prev }
        delete next[variantId]
        return next
      }
      return { ...prev, [variantId]: Math.min(qty, max) }
    })
  }

  // Flat variant list from subscription items
  const subItems = subscription.subscription_items.map((si) => {
    const v = si.variants
    const reserved = 0 // we show from sub's own data
    const available = Math.max(0, v.stock_quantity - reserved + (si.quantity || 0))
    return {
      subItemId: si.id,
      variantId: v.id,
      label: v.label,
      price: v.price,
      stock_quantity: v.stock_quantity,
      productName: v.products?.name || '',
      available,
    }
  })

  const activeItems = subItems.filter((v) => (qtys[v.variantId] || 0) > 0)
  const total = activeItems.reduce((sum, v) => sum + Number(v.price) * (qtys[v.variantId] || 0), 0)

  async function handleSave() {
    setError('')
    setSuccess('')
    if (activeItems.length === 0) {
      return setError('Your bundle cannot be empty.')
    }
    setSaving(true)
    const items = activeItems.map((v) => ({ variantId: v.variantId, quantity: qtys[v.variantId] }))
    const res = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: subscription.user_email, items }),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) return setError(data.error || 'Failed to save changes.')
    setSuccess('Bundle updated. Changes take effect at your next billing cycle.')
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel your subscription? This cannot be undone.')) return
    setCancelling(true)
    setError('')
    const res = await fetch(`/api/account?email=${encodeURIComponent(subscription.user_email)}`, {
      method: 'DELETE',
    })
    const data = await res.json()
    setCancelling(false)
    if (!res.ok) return setError(data.error || 'Failed to cancel subscription.')
    onCancel()
  }

  const statusColor = {
    active: 'var(--success)',
    paused: '#e09a2c',
    cancelled: 'var(--error)',
  }[subscription.status] || 'var(--text-muted)'

  return (
    <>
      {/* Subscription meta */}
      <div style={s.card}>
        <p style={s.sectionLabel}>Subscription details</p>
        <div style={s.metaRow}>
          <span style={s.metaKey}>Status</span>
          <span style={{ color: statusColor, fontWeight: '500', textTransform: 'capitalize' }}>
            {subscription.status}
          </span>
        </div>
        <div style={s.metaRow}>
          <span style={s.metaKey}>Billing day</span>
          <span>
            {subscription.billing_day}{['st','nd','rd'][((subscription.billing_day % 100 - 11) % 10 - 1)] || 'th'} of each month
          </span>
        </div>
        <div style={{ ...s.metaRow, marginBottom: 0 }}>
          <span style={s.metaKey}>Subscribed since</span>
          <span>{new Date(subscription.created_at).toLocaleDateString('en-IE', { dateStyle: 'medium' })}</span>
        </div>
      </div>

      {/* Bundle items */}
      <div style={s.card}>
        <p style={s.sectionLabel}>Your bundle</p>

        {subItems.map((v, idx) => {
          const qty = qtys[v.variantId] || 0
          const unavailable = v.stock_quantity === 0
          return (
            <div
              key={v.variantId}
              style={{
                ...s.itemRow,
                ...(idx === subItems.length - 1 ? { borderBottom: 'none' } : {}),
                opacity: unavailable ? 0.4 : 1,
                pointerEvents: unavailable ? 'none' : 'auto',
              }}
            >
              <span style={{ flex: 1 }}>
                {v.productName} — {v.label}
              </span>
              <span style={{ color: 'var(--gold)', minWidth: '52px', textAlign: 'right' }}>
                €{Number(v.price).toFixed(2)}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  style={s.qtyBtn}
                  type="button"
                  onClick={() => setQty(v.variantId, qty - 1, v.available)}
                  disabled={qty === 0}
                >
                  −
                </button>
                <span style={{ minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                <button
                  style={s.qtyBtn}
                  type="button"
                  onClick={() => setQty(v.variantId, qty + 1, v.available)}
                  disabled={qty >= v.available}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}

        {activeItems.length > 0 && (
          <>
            <div style={s.divider} />
            <div style={s.totalRow}>
              <span>Monthly total</span>
              <span style={{ color: 'var(--gold)' }}>€{total.toFixed(2)}</span>
            </div>
          </>
        )}

        {error && <p style={s.errText}>{error}</p>}
        {success && <p style={s.successText}>{success}</p>}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
          <button style={s.btnGold} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button style={s.btnDanger} onClick={handleCancel} disabled={cancelling}>
            {cancelling ? 'Cancelling…' : 'Cancel subscription'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Main account page ─────────────────────────────────────────────────────────

export default function AccountClient() {
  const [email, setEmail] = useState('')
  const [subscription, setSubscription] = useState(undefined) // undefined = not fetched
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [cancelled, setCancelled] = useState(false)

  async function handleLookup(e) {
    e.preventDefault()
    setFetchError('')
    setCancelled(false)
    setSubscription(undefined)
    setFetching(true)

    const res = await fetch(`/api/account?email=${encodeURIComponent(email.trim())}`)
    const data = await res.json()
    setFetching(false)

    if (!res.ok) return setFetchError(data.error || 'Failed to look up account.')
    setSubscription(data.subscription)
  }

  return (
    <div style={s.shell}>
      <nav style={s.nav}>
        <Link href="/" style={s.logo}>Elevate Salon</Link>
        <Link href="/shop" style={s.navLink}>Shop</Link>
      </nav>

      <main style={s.main}>
        <h1 style={s.pageTitle}>My Account</h1>
        <p style={s.pageSub}>Enter your email to view and manage your subscription.</p>

        {/* Email lookup form */}
        <div style={{ ...s.card, marginBottom: '24px' }}>
          <form onSubmit={handleLookup}>
            <label style={s.label} htmlFor="acct-email">Email address</label>
            <input
              id="acct-email"
              type="email"
              style={s.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
            {fetchError && <p style={s.errText}>{fetchError}</p>}
            <button type="submit" style={s.btnGold} disabled={fetching}>
              {fetching ? 'Looking up…' : 'View subscription'}
            </button>
          </form>
        </div>

        {/* Result */}
        {cancelled && (
          <div style={{ ...s.card, borderColor: 'var(--border-2)', textAlign: 'center' }}>
            <p style={{ color: 'var(--success)', marginBottom: '8px' }}>Subscription cancelled.</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              We're sorry to see you go. You're welcome back any time.
            </p>
          </div>
        )}

        {!cancelled && subscription === null && (
          <div style={{ ...s.card, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
              No active subscription found for this email.
            </p>
            <Link
              href="/subscribe"
              style={{
                color: 'var(--gold)',
                fontSize: '13px',
                textDecoration: 'none',
                fontWeight: '500',
              }}
            >
              Start a subscription →
            </Link>
          </div>
        )}

        {!cancelled && subscription && (
          <BundleEditor
            subscription={subscription}
            onCancel={() => setCancelled(true)}
          />
        )}
      </main>
    </div>
  )
}
