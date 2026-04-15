'use client'

import { motion } from 'framer-motion'
import ProductClient from './ProductClient'

export default function ProductPageAnimations({ product, inStockVariants }) {
  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '64px 24px 96px' }}>
      <div className="product-layout">
        {/* Image */}
        <div style={{ position: 'relative' }}>
          {/* Reveal wipe */}
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
            <motion.div
              initial={{ x: 0 }}
              animate={{ x: '101%' }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.76, 0, 0.24, 1] }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--gold)',
                zIndex: 2,
                transformOrigin: 'left',
              }}
            />

            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                aspectRatio: '1',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="shimmer-placeholder"
                  style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, #141414 0%, #1f1a0e 35%, #141414 60%, #1a1408 80%, #141414 100%)',
                    }}
                  />
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      fontSize: '64px',
                      color: 'rgba(201,168,76,0.15)',
                      userSelect: 'none',
                    }}
                  >
                    ✦
                  </motion.span>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Info */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '16px',
            }}
          >
            Elevate Salon
          </motion.p>

          <div style={{ overflow: 'hidden', marginBottom: '20px' }}>
            <motion.h1
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontSize: 'clamp(26px, 3.5vw, 40px)',
                fontWeight: '300',
                letterSpacing: '-0.02em',
                color: 'var(--text)',
                lineHeight: 1.2,
              }}
            >
              {product.name}
            </motion.h1>
          </div>

          {product.description && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7, ease: 'easeOut' }}
              style={{
                fontSize: '15px',
                color: 'var(--text-muted)',
                lineHeight: '1.7',
                marginBottom: '36px',
              }}
            >
              {product.description}
            </motion.p>
          )}

          <motion.hr
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              border: 'none',
              borderTop: '1px solid var(--border)',
              marginBottom: '36px',
              transformOrigin: 'left',
            }}
          />

          <ProductClient variants={inStockVariants} />
        </div>
      </div>

      <style>{`
        .product-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
        }
        @media (max-width: 700px) {
          .product-layout {
            grid-template-columns: 1fr;
            gap: 36px;
          }
        }
      `}</style>
    </main>
  )
}
