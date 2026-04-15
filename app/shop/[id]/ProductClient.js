'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Count-up hook
function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const start = performance.now()
    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])

  return value
}

function AnimatedPrice({ price }) {
  const count = useCountUp(price, 700)
  return <>€{count.toFixed(2)}</>
}

export default function ProductClient({ variants }) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Add to subscription state
  const [subPanelOpen, setSubPanelOpen] = useState(false)
  const [subEmail, setSubEmail] = useState('')
  const [subLoading, setSubLoading] = useState(false)
  const [subStatus, setSubStatus] = useState(null) // null | 'success' | 'no-sub' | 'error'
  const [subError, setSubError] = useState('')

  const selected = variants.find((v) => v.id === selectedId)

  async function handleAddToSubscription(e) {
    e.preventDefault()
    if (!selectedId || !subEmail.trim()) return
    setSubLoading(true)
    setSubStatus(null)
    setSubError('')

    // Fetch current subscription
    const getRes = await fetch(`/api/account?email=${encodeURIComponent(subEmail.trim())}`)
    const getData = await getRes.json()

    if (!getRes.ok) {
      setSubLoading(false)
      setSubStatus('error')
      setSubError(getData.error || 'Failed to look up subscription.')
      return
    }

    if (!getData.subscription) {
      setSubLoading(false)
      setSubStatus('no-sub')
      return
    }

    // Merge selected variant into existing items
    const existingItems = getData.subscription.subscription_items.map((si) => ({
      variantId: si.variant_id,
      quantity: si.quantity,
    }))

    const alreadyIn = existingItems.find((i) => i.variantId === selectedId)
    const updatedItems = alreadyIn
      ? existingItems.map((i) =>
          i.variantId === selectedId ? { ...i, quantity: i.quantity + 1 } : i
        )
      : [...existingItems, { variantId: selectedId, quantity: 1 }]

    const putRes = await fetch('/api/account', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: subEmail.trim(), items: updatedItems }),
    })
    const putData = await putRes.json()
    setSubLoading(false)

    if (!putRes.ok) {
      setSubStatus('error')
      setSubError(putData.error || 'Failed to update subscription.')
      return
    }

    setSubStatus('success')
  }

  async function handleBuy() {
    if (!selectedId) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variantId: selectedId }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok || !data.url) {
      setError(data.error || 'Could not start checkout. Please try again.')
      return
    }

    window.location.href = data.url
  }

  if (variants.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          padding: '24px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '14px',
        }}
      >
        Currently out of stock. Check back soon.
      </motion.div>
    )
  }

  return (
    <div>
      {/* Variant selector */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        style={{ marginBottom: '28px' }}
      >
        <p
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '14px',
          }}
        >
          Select Option
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {variants.map((v, i) => (
            <motion.button
              key={v.id}
              onClick={() => setSelectedId(v.id)}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '11px 20px',
                borderRadius: '6px',
                border: selectedId === v.id
                  ? '1.5px solid var(--gold)'
                  : '1.5px solid var(--border-2)',
                background: selectedId === v.id
                  ? 'rgba(61,216,205,0.1)'
                  : 'var(--surface)',
                color: selectedId === v.id ? 'var(--gold)' : 'var(--text)',
                fontSize: '13px',
                fontWeight: selectedId === v.id ? '500' : '400',
                cursor: 'pointer',
                transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                letterSpacing: '0.01em',
              }}
            >
              {v.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Price */}
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{ marginBottom: '32px' }}
          >
            <span
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '32px',
                fontWeight: '400',
                color: 'var(--gold)',
                letterSpacing: '-0.02em',
              }}
            >
              <AnimatedPrice price={Number(selected.price)} />
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              color: 'var(--error)',
              fontSize: '13px',
              marginBottom: '16px',
              padding: '10px 14px',
              background: 'rgba(224,82,82,0.08)',
              borderRadius: '6px',
              border: '1px solid rgba(224,82,82,0.2)',
            }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Buy button */}
      <motion.button
        onClick={handleBuy}
        disabled={!selectedId || loading}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        whileHover={!loading && selectedId ? { scale: 1.02 } : {}}
        whileTap={!loading && selectedId ? { scale: 0.98 } : {}}
        style={{
          width: '100%',
          background: !selectedId || loading ? 'var(--border-2)' : 'var(--gold)',
          color: !selectedId || loading ? 'var(--text-muted)' : '#000',
          border: 'none',
          borderRadius: '8px',
          padding: '16px',
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '12px',
          fontWeight: '600',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          cursor: !selectedId || loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
          boxShadow: !selectedId || loading
            ? 'none'
            : '0 0 24px rgba(61,216,205,0.2)',
        }}
      >
        {loading ? 'Redirecting…' : 'Buy Now'}
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{
          textAlign: 'center',
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '10px',
          letterSpacing: '0.1em',
          color: 'var(--text-dim)',
          marginTop: '14px',
        }}
      >
        Secure checkout via Stripe
      </motion.p>

      {/* ── Add to subscription ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          marginTop: '24px',
          borderTop: '1px solid var(--border)',
          paddingTop: '20px',
        }}
      >
        {!subPanelOpen ? (
          <button
            onClick={() => { setSubPanelOpen(true); setSubStatus(null); setSubError('') }}
            disabled={!selectedId}
            style={{
              width: '100%',
              background: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-2)',
              borderRadius: '8px',
              padding: '13px 16px',
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '11px',
              fontWeight: '500',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              cursor: selectedId ? 'pointer' : 'not-allowed',
              opacity: selectedId ? 1 : 0.4,
            }}
          >
            + Add to My Subscription
          </button>
        ) : (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border-2)',
              borderRadius: '8px',
              padding: '18px',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-geist-mono)',
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
                marginBottom: '14px',
              }}
            >
              Add to subscription
            </p>

            {subStatus === 'success' && (
              <div>
                <p style={{ color: 'var(--success)', fontSize: '13px', marginBottom: '12px' }}>
                  Added to your bundle. Changes take effect at your next billing cycle.
                </p>
                <button
                  onClick={() => { setSubPanelOpen(false); setSubStatus(null); setSubEmail('') }}
                  style={{ fontSize: '12px', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Close
                </button>
              </div>
            )}

            {subStatus === 'no-sub' && (
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  No active subscription found for that email.
                </p>
                <a
                  href="/subscribe"
                  style={{
                    display: 'inline-block',
                    background: 'var(--gold)',
                    color: '#000',
                    borderRadius: '6px',
                    padding: '9px 18px',
                    fontSize: '11px',
                    fontWeight: '600',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    marginRight: '10px',
                  }}
                >
                  Start a subscription
                </a>
                <button
                  onClick={() => setSubStatus(null)}
                  style={{ fontSize: '12px', color: 'var(--text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Try again
                </button>
              </div>
            )}

            {subStatus !== 'success' && subStatus !== 'no-sub' && (
              <form onSubmit={handleAddToSubscription}>
                <input
                  type="email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="Your subscription email"
                  required
                  style={{
                    width: '100%',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-2)',
                    borderRadius: '6px',
                    padding: '10px 14px',
                    color: 'var(--text)',
                    fontSize: '14px',
                    outline: 'none',
                    marginBottom: '10px',
                    boxSizing: 'border-box',
                  }}
                />
                {subError && (
                  <p style={{ color: 'var(--error)', fontSize: '12px', marginBottom: '10px' }}>
                    {subError}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="submit"
                    disabled={subLoading}
                    style={{
                      flex: 1,
                      background: 'var(--gold)',
                      color: '#000',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px',
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: subLoading ? 'not-allowed' : 'pointer',
                      opacity: subLoading ? 0.6 : 1,
                    }}
                  >
                    {subLoading ? 'Adding…' : 'Add to bundle'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setSubPanelOpen(false); setSubStatus(null); setSubError(''); setSubEmail('') }}
                    style={{
                      background: 'transparent',
                      color: 'var(--text-dim)',
                      border: '1px solid var(--border-2)',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
