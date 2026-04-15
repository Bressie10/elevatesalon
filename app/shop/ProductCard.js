'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function ProductCard({ product, index = 0 }) {
  const cardRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [shine, setShine] = useState({ x: 50, y: 50, opacity: 0 })

  const inStockVariants = product.variants?.filter((v) => v.in_stock) ?? []
  const lowestPrice =
    inStockVariants.length > 0
      ? Math.min(...inStockVariants.map((v) => Number(v.price)))
      : null

  function handleMouseMove(e) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    const rotX = ((y - cy) / cy) * -10
    const rotY = ((x - cx) / cx) * 10
    setTilt({ x: rotX, y: rotY })
    setShine({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 0.18 })
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 })
    setShine((s) => ({ ...s, opacity: 0 }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: '800px' }}
    >
      <Link href={`/shop/${product.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: tilt.x === 0 ? 'transform 0.6s ease, box-shadow 0.4s ease, border-color 0.3s ease' : 'none',
            boxShadow: tilt.x !== 0 || tilt.y !== 0
              ? `0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(61,216,205,0.08)`
              : '0 0 0 rgba(0,0,0,0)',
            willChange: 'transform',
          }}
        >
          {/* Holographic shine overlay */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(61,216,205,${shine.opacity}), transparent 65%)`,
              pointerEvents: 'none',
              zIndex: 3,
              transition: shine.opacity === 0 ? 'opacity 0.4s ease' : 'none',
            }}
          />

          {/* Image / placeholder */}
          <div
            style={{
              aspectRatio: '4/3',
              background: 'var(--surface-2)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: `translate(${tilt.y * 0.5}px, ${tilt.x * -0.5}px) scale(1.04)`,
                  transition: tilt.x === 0 ? 'transform 0.6s ease' : 'none',
                }}
              />
            ) : (
              <div className="shimmer-placeholder" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #141414 0%, #1f1a0e 35%, #141414 60%, #1a1408 80%, #141414 100%)',
                  }}
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    fontSize: '32px',
                    color: 'rgba(61,216,205,0.2)',
                    userSelect: 'none',
                  }}
                >
                  ✦
                </motion.div>
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ padding: '20px', position: 'relative', zIndex: 2 }}>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '500',
                color: 'var(--text)',
                marginBottom: '6px',
                letterSpacing: '-0.01em',
              }}
            >
              {product.name}
            </h2>

            {product.description && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  lineHeight: '1.5',
                  marginBottom: '16px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {product.description}
              </p>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: product.description ? 0 : '16px',
              }}
            >
              {lowestPrice != null ? (
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '500',
                    color: 'var(--gold)',
                    fontFamily: 'var(--font-geist-mono)',
                  }}
                >
                  from €{lowestPrice.toFixed(2)}
                </span>
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Out of stock</span>
              )}

              <span
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--text-dim)',
                  fontFamily: 'var(--font-geist-mono)',
                }}
              >
                {inStockVariants.length} option{inStockVariants.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Bottom gold border that appears on hover */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: `linear-gradient(90deg, transparent, rgba(61,216,205,${Math.min(shine.opacity * 4, 0.6)}), transparent)`,
              transition: shine.opacity === 0 ? 'opacity 0.4s' : 'none',
            }}
          />
        </div>
      </Link>
    </motion.div>
  )
}
