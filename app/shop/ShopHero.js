'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import WaveCanvas from '../components/WaveCanvas'

export default function ShopHero() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '35%'])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        height: '380px',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)',
      }}
    >
      {/* Parallax canvas */}
      <motion.div style={{ y, position: 'absolute', inset: 0 }}>
        <WaveCanvas style={{ opacity: 0.7 }} />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{
          y,
          opacity,
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
        }}
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: '10px',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'var(--gold)',
          }}
        >
          Premium Grooming
        </motion.p>

        <div style={{ overflow: 'hidden' }}>
          <motion.h1
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(36px, 6vw, 64px)',
              fontWeight: '300',
              letterSpacing: '-0.03em',
              color: 'var(--text)',
              lineHeight: 1.1,
              textAlign: 'center',
            }}
          >
            The Collection
          </motion.h1>
        </div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: '40px',
            height: '1px',
            background: 'var(--gold)',
            transformOrigin: 'left',
          }}
        />
      </motion.div>
    </div>
  )
}
