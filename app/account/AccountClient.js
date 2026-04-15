'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IE', { dateStyle: 'medium' })
}

function daysUntil(dateStr) {
  const now = new Date()
  const target = new Date(dateStr)
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  shell: { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-geist-sans)' },
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
  logo: { fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: '500', textDecoration: 'none' },
  navLink: { fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none' },
  main: { maxWidth: '680px', margin: '0 auto', padding: '32px 16px 64px' },
  pageTitle: { fontSize: 'clamp(22px, 5vw, 36px)', fontWeight: '300', letterSpacing: '0.05em', marginBottom: '8px' },
  pageSub: { fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' },
  label: { display: 'block', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' },
  input: { width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '10px 14px', color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  card: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '20px', marginBottom: '16px' },
  sectionLabel: { fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: '500' },
  metaRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', alignItems: 'center' },
  metaKey: { color: 'var(--text-muted)' },
  itemRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '13px' },
  qtyBtn: { width: '28px', height: '28px', background: 'var(--surface-2)', border: '1px solid var(--border-2)', borderRadius: '4px', color: 'var(--text)', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, padding: 0 },
  divider: { borderTop: '1px solid var(--border)', margin: '14px 0' },
  totalRow: { display: 'flex', justifyContent: 'space-between', fontWeight: '600', fontSize: '15px' },
  btnGold: { background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '6px', padding: '10px 20px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' },
  btnOutline: { background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-2)', borderRadius: '6px', padding: '10px 20px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' },
  btnDanger: { background: 'transparent', color: 'var(--error)', border: '1px solid rgba(224,82,82,0.4)', borderRadius: '6px', padding: '10px 20px', fontSize: '12px', cursor: 'pointer' },
  errText: { color: 'var(--error)', fontSize: '13px', marginTop: '10px' },
  successText: { color: 'var(--success)', fontSize: '13px', marginTop: '10px' },
}

// ─── Subscription overview card ────────────────────────────────────────────────

function OverviewCard({ subscription, nextBillingDate, locked }) {
  const days = daysUntil(nextBillingDate)
  const total = subscription.subscription_items.reduce(
    (sum, si) => sum + Number(si.variants?.price ?? 0) * si.quantity, 0
  )
  const statusColor = { active: 'var(--success)', paused: '#e09a2c' }[subscription.status] || 'var(--text-muted)'

  return (
    <div style={s.card}>
      <p style={s.sectionLabel}>Subscription overview</p>

      <div style={s.metaRow}>
        <span style={s.metaKey}>Status</span>
        <span style={{ color: statusColor, fontWeight: '500', textTransform: 'capitalize' }}>
          {subscription.status}
        </span>
      </div>

      <div style={s.metaRow}>
        <span style={s.metaKey}>Monthly total</span>
        <span style={{ color: 'var(--gold)', fontWeight: '600', fontSize: '15px' }}>
          €{total.toFixed(2)}
        </span>
      </div>

      <div style={s.metaRow}>
        <span style={s.metaKey}>Next billing date</span>
        <span>{formatDate(nextBillingDate)} ({days} day{days !== 1 ? 's' : ''} away)</span>
      </div>

      <div style={s.metaRow}>
        <span style={s.metaKey}>Billing day</span>
        <span>{ordinal(subscription.billing_day)} of each month</span>
      </div>

      <div style={{ ...s.metaRow, marginBottom: 0 }}>
        <span style={s.metaKey}>Member since</span>
        <span>{formatDate(subscription.created_at)}</span>
      </div>

      {locked && (
        <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(224,154,44,0.08)', border: '1px solid rgba(224,154,44,0.25)', borderRadius: '6px' }}>
          <p style={{ fontSize: '13px', color: '#e09a2c', fontWeight: '500', marginBottom: '2px' }}>
            Bundle locked
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Changes are closed within 14 days of your billing date. Your bundle for {formatDate(nextBillingDate)} is confirmed. Editing reopens after that invoice is sent.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Bundle editor ─────────────────────────────────────────────────────────────

function BundleEditor({ subscription, locked, onCancel }) {
  const [qtys, setQtys] = useState(() => {
    const map = {}
    subscription.subscription_items.forEach((i) => { map[i.variant_id] = i.quantity })
    return map
  })
  const [saving, setSaving] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const subItems = subscription.subscription_items.map((si) => {
    const v = si.variants
    return {
      variantId: v.id,
      label: v.label,
      price: v.price,
      productName: v.products?.name || '',
      available: Math.max(0, v.stock_quantity + (si.quantity || 0)),
    }
  })

  const activeItems = subItems.filter((v) => (qtys[v.variantId] || 0) > 0)
  const total = activeItems.reduce((sum, v) => sum + Number(v.price) * (qtys[v.variantId] || 0), 0)

  function setQty(variantId, qty, max) {
    setQtys((prev) => {
      if (qty <= 0) { const next = { ...prev }; delete next[variantId]; return next }
      return { ...prev, [variantId]: Math.min(qty, max) }
    })
  }

  async function handleSave() {
    setError('')
    setSuccess('')
    if (activeItems.length === 0) return setError('Your bundle cannot be empty.')
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
    if (!confirm('Cancel your subscription? This cannot be undone.')) return
    setCancelling(true)
    setError('')
    const res = await fetch(`/api/account?email=${encodeURIComponent(subscription.user_email)}`, { method: 'DELETE' })
    const data = await res.json()
    setCancelling(false)
    if (!res.ok) return setError(data.error || 'Failed to cancel.')
    onCancel()
  }

  return (
    <div style={s.card}>
      <p style={s.sectionLabel}>Your bundle</p>

      {subItems.map((v, idx) => {
        const qty = qtys[v.variantId] || 0
        return (
          <div
            key={v.variantId}
            style={{ ...s.itemRow, ...(idx === subItems.length - 1 ? { borderBottom: 'none' } : {}) }}
          >
            <span style={{ flex: 1 }}>{v.productName} — {v.label}</span>
            <span style={{ color: 'var(--gold)', minWidth: '56px', textAlign: 'right' }}>
              €{Number(v.price).toFixed(2)}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                style={{ ...s.qtyBtn, opacity: locked || qty === 0 ? 0.4 : 1, cursor: locked || qty === 0 ? 'not-allowed' : 'pointer' }}
                type="button"
                onClick={() => !locked && setQty(v.variantId, qty - 1, v.available)}
                disabled={locked || qty === 0}
              >−</button>
              <span style={{ minWidth: '20px', textAlign: 'center' }}>{qty}</span>
              <button
                style={{ ...s.qtyBtn, opacity: locked || qty >= v.available ? 0.4 : 1, cursor: locked || qty >= v.available ? 'not-allowed' : 'pointer' }}
                type="button"
                onClick={() => !locked && setQty(v.variantId, qty + 1, v.available)}
                disabled={locked || qty >= v.available}
              >+</button>
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
        {!locked && (
          <button style={s.btnGold} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        )}
        <button style={s.btnDanger} onClick={handleCancel} disabled={cancelling}>
          {cancelling ? 'Cancelling…' : 'Cancel subscription'}
        </button>
      </div>
    </div>
  )
}

// ─── Order history ─────────────────────────────────────────────────────────────

function OrderHistory({ orders }) {
  if (orders.length === 0) {
    return (
      <div style={s.card}>
        <p style={s.sectionLabel}>Order history</p>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>No orders yet. Your first invoice will be sent on your billing date.</p>
      </div>
    )
  }

  return (
    <div style={s.card}>
      <p style={s.sectionLabel}>Order history</p>
      {orders.map((order, idx) => (
        <div
          key={order.id}
          style={{
            paddingBottom: '14px',
            marginBottom: '14px',
            borderBottom: idx < orders.length - 1 ? '1px solid var(--border)' : 'none',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '500' }}>{formatDate(order.created_at)}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(76,175,128,0.12)', color: 'var(--success)' }}>
                Paid
              </span>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gold)' }}>
                €{((order.total ?? 0) / 100).toFixed(2)}
              </span>
            </div>
          </div>
          {Array.isArray(order.items) && order.items.length > 0 && (
            <div>
              {order.items.map((item, i) => (
                <p key={i} style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {item.description} ×{item.quantity}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function AccountClient() {
  const [email, setEmail] = useState('')
  const [data, setData] = useState(null) // { subscription, orders, locked, nextBillingDate }
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [cancelled, setCancelled] = useState(false)

  async function handleLookup(e) {
    e.preventDefault()
    setFetchError('')
    setCancelled(false)
    setData(null)
    setFetching(true)

    const res = await fetch(`/api/account?email=${encodeURIComponent(email.trim())}`)
    const json = await res.json()
    setFetching(false)

    if (!res.ok) return setFetchError(json.error || 'Failed to look up account.')
    setData(json)
  }

  return (
    <div style={s.shell}>
      <nav style={s.nav}>
        <Link href="/" style={s.logo}>Elevate Salon</Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/shop" style={s.navLink}>Shop</Link>
          <Link href="/subscribe" style={s.navLink}>Subscribe</Link>
        </div>
      </nav>

      <main style={s.main}>
        <h1 style={s.pageTitle}>My Account</h1>
        <p style={s.pageSub}>Enter your subscription email to view and manage your bundle.</p>

        {/* Email lookup */}
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
            <div style={{ marginTop: '12px' }}>
              <button type="submit" style={s.btnGold} disabled={fetching}>
                {fetching ? 'Looking up…' : 'View my subscription'}
              </button>
            </div>
          </form>
        </div>

        {/* Cancelled confirmation */}
        {cancelled && (
          <div style={{ ...s.card, textAlign: 'center' }}>
            <p style={{ color: 'var(--success)', fontWeight: '500', marginBottom: '6px' }}>Subscription cancelled.</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>You're welcome back any time.</p>
          </div>
        )}

        {/* No subscription found */}
        {!cancelled && data && !data.subscription && (
          <div style={{ ...s.card, textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '14px' }}>No active subscription found for this email.</p>
            <Link
              href="/subscribe"
              style={{ color: 'var(--gold)', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}
            >
              Start a subscription →
            </Link>
          </div>
        )}

        {/* Subscription found */}
        {!cancelled && data?.subscription && (
          <>
            <OverviewCard
              subscription={data.subscription}
              nextBillingDate={data.nextBillingDate}
              locked={data.locked}
            />
            <BundleEditor
              subscription={data.subscription}
              locked={data.locked}
              onCancel={() => setCancelled(true)}
            />
            <OrderHistory orders={data.orders || []} />
          </>
        )}
      </main>
    </div>
  )
}
