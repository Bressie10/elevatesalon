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

  const selected = variants.find((v) => v.id === selectedId)

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
                  ? 'rgba(201,168,76,0.1)'
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
            : '0 0 24px rgba(201,168,76,0.2)',
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
    </div>
  )
}
