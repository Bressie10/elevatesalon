'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import WaveCanvas from './WaveCanvas'
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from 'framer-motion'

// ─── Constants ────────────────────────────────────────────────────────────────
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ✦◆▲●◇'

// ─── Scramble hook ────────────────────────────────────────────────────────────
function useScramble(text, startDelay = 0) {
  const [display, setDisplay] = useState(text.replace(/[^ ]/g, '·'))
  const frameRef = useRef(null)

  useEffect(() => {
    let timeout
    timeout = setTimeout(() => {
      let iteration = 0
      const total = text.length * 32
      function step() {
        setDisplay(
          text.split('').map((char, i) => {
            if (char === ' ') return ' '
            if (i < iteration / 32) return char
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
          }).join('')
        )
        iteration++
        if (iteration <= total) frameRef.current = requestAnimationFrame(step)
      }
      frameRef.current = requestAnimationFrame(step)
    }, startDelay)
    return () => { clearTimeout(timeout); cancelAnimationFrame(frameRef.current) }
  }, [text, startDelay])

  return display
}

// ─── Floating particles (client-only) ────────────────────────────────────────
function Particles() {
  const [particles, setParticles] = useState([])
  useEffect(() => {
    setParticles(Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1.5,
      dur: Math.random() * 10 + 7,
      delay: Math.random() * 5,
      shape: Math.random() > 0.6 ? '✦' : null,
    })))
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 1 }}>
      {particles.map((p) =>
        p.shape ? (
          <motion.span
            key={p.id}
            style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, fontSize: p.size + 6, color: 'rgba(201,168,76,0.15)', userSelect: 'none' }}
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1], rotate: [0, 180, 360] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ) : (
          <motion.div
            key={p.id}
            style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, borderRadius: '50%', background: 'var(--gold)', opacity: 0.2 }}
            animate={{ y: [0, -25, 0, 10, 0], x: [0, 8, -6, 4, 0], opacity: [0.1, 0.3, 0.1, 0.25, 0.1] }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        )
      )}
    </div>
  )
}

// ─── Cinematic intro overlay ──────────────────────────────────────────────────
function IntroOverlay({ onComplete }) {
  const wordA = useScramble('ELEVATE', 100)
  const wordB = useScramble('SALON', 800)

  useEffect(() => {
    const t = setTimeout(onComplete, 3200)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: 'blur(12px)' }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      style={{ position: 'fixed', inset: 0, background: '#030303', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Horizontal lines sweeping out */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, delay: 0.05, ease: [0.76, 0, 0.24, 1] }}
        style={{ width: '320px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', transformOrigin: 'center', marginBottom: '40px' }}
      />

      {/* ELEVATE */}
      <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 'clamp(40px, 9vw, 84px)', fontWeight: '200', letterSpacing: '0.28em', color: 'var(--text)', lineHeight: 1, marginBottom: '2px' }}>
        {wordA}
      </div>

      {/* Vertical gold pin */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.6, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '1px', height: '28px', background: 'var(--gold)', margin: '14px 0', transformOrigin: 'top' }}
      />

      {/* SALON */}
      <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 'clamp(11px, 1.8vw, 15px)', fontWeight: '400', letterSpacing: '0.9em', color: 'var(--gold)', lineHeight: 1, marginBottom: '40px' }}>
        {wordB}
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.4, delay: 0.05, ease: [0.76, 0, 0.24, 1] }}
        style={{ width: '320px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--gold), transparent)', transformOrigin: 'center' }}
      />

      {/* Progress line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 3.0, delay: 0.2, ease: 'linear' }}
        style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', width: '100%', background: 'linear-gradient(90deg, var(--gold-dim), var(--gold), var(--gold-light))', transformOrigin: 'left', opacity: 0.7 }}
      />

      {/* EST. badge */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.6 }}
        style={{ position: 'absolute', bottom: '28px', right: '36px', fontFamily: 'var(--font-geist-mono)', fontSize: '9px', letterSpacing: '0.22em', color: 'var(--text-dim)', textTransform: 'uppercase' }}
      >
        Est. MMXXIV — Dublin
      </motion.p>
    </motion.div>
  )
}

// ─── Magnetic CTA button ──────────────────────────────────────────────────────
function MagneticCTA({ href, children }) {
  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 180, damping: 18 })
  const sy = useSpring(my, { stiffness: 180, damping: 18 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    function onMove(e) {
      const r = el.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 160) {
        mx.set(dx * 0.28)
        my.set(dy * 0.28)
      } else {
        mx.set(0)
        my.set(0)
      }
    }
    function onLeave() { mx.set(0); my.set(0) }
    window.addEventListener('mousemove', onMove, { passive: true })
    el.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [mx, my])

  return (
    <motion.div ref={ref} style={{ x: sx, y: sy, display: 'inline-block' }}>
      <Link href={href} className="hero-cta">{children}</Link>
    </motion.div>
  )
}

// ─── Infinite marquee ─────────────────────────────────────────────────────────
const MARQUEE_TEXT = ['PREMIUM GROOMING', 'ELEVATE YOUR STYLE', 'BARBERSHOP QUALITY', 'CRAFTED WITH PURPOSE', 'DUBLIN IRELAND', 'HANDCRAFTED FORMULAS']

function Marquee({ reverse }) {
  const items = [...MARQUEE_TEXT, ...MARQUEE_TEXT]
  return (
    <div style={{ overflow: 'hidden', padding: '16px 0' }}>
      <motion.div
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        style={{ display: 'flex', width: 'max-content', gap: 0 }}
      >
        {items.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: reverse ? 'var(--text-dim)' : 'var(--text-muted)', padding: '0 28px' }}>
              {item}
            </span>
            <span style={{ color: 'var(--gold)', fontSize: '7px', opacity: 0.7 }}>✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ─── Feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ num, title, body, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, delay: i * 0.14, ease: [0.16, 1, 0.3, 1] }}
      style={{ paddingTop: '36px', position: 'relative' }}
    >
      {/* Animated top border */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: i * 0.14, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px', background: 'var(--border)', transformOrigin: 'left' }}
      />
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: i * 0.14 + 0.15, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', top: 0, left: 0, width: '56px', height: '1px', background: 'var(--gold)', transformOrigin: 'left' }}
      />

      <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', letterSpacing: '0.2em', color: 'var(--gold)', display: 'block', marginBottom: '20px' }}>{num}</span>

      <h3 style={{ fontSize: 'clamp(16px, 2vw, 20px)', fontWeight: '300', letterSpacing: '-0.01em', color: 'var(--text)', marginBottom: '12px', lineHeight: 1.3 }}>{title}</h3>

      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.75' }}>{body}</p>
    </motion.div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function HomeHero() {
  const [animReady, setAnimReady] = useState(false)
  const [showIntro, setShowIntro] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const heroRef = useRef(null)
  const { scrollY } = useScroll()
  const heroContentY = useTransform(scrollY, [0, 600], ['0px', '120px'])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  // Brand scramble — starts after intro or immediately
  const brandDelay = showIntro ? 3400 : 300
  const tagDelay = showIntro ? 4000 : 1000
  const brand = useScramble('ELEVATE SALON', brandDelay)
  const tag = useScramble('EST. 2024 — DUBLIN', tagDelay)

  // Determine if intro should play
  useEffect(() => {
    const played = sessionStorage.getItem('elevate_intro')
    if (played) {
      setAnimReady(true)
    } else {
      setShowIntro(true)
    }
  }, [])

  // 3D hero tilt on cursor move
  useEffect(() => {
    function onMove(e) {
      const x = ((e.clientY / window.innerHeight) - 0.5) * -6
      const y = ((e.clientX / window.innerWidth) - 0.5) * 6
      setTilt({ x, y })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  function handleIntroComplete() {
    setShowIntro(false)
    setAnimReady(true)
    sessionStorage.setItem('elevate_intro', '1')
  }

  // Stagger helper
  const d = (base) => ({ delay: base })

  return (
    <>
      <AnimatePresence>
        {showIntro && <IntroOverlay onComplete={handleIntroComplete} />}
      </AnimatePresence>

      <div style={{ background: 'var(--bg)' }}>

        {/* ═══════════════ HERO ═══════════════════════════════════════════════ */}
        <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <WaveCanvas />

          {/* Grain */}
          <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E")`, backgroundRepeat: 'repeat', backgroundSize: '200px', pointerEvents: 'none', zIndex: 1, opacity: 0.55 }} />

          <Particles />

          {/* Nav */}
          <motion.nav
            initial={{ opacity: 0, y: -16 }}
            animate={animReady ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{ position: 'relative', zIndex: 10, padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '11px', letterSpacing: '0.25em', color: 'var(--gold)' }}>{brand}</span>
            <Link href="/shop" className="nav-shop-link" style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.2em' }}>Shop</Link>
          </motion.nav>

          {/* 3D-tilting hero content */}
          <motion.div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              zIndex: 2,
              padding: '32px 40px 100px',
              y: heroContentY,
              opacity: heroOpacity,
              rotateX: tilt.x,
              rotateY: tilt.y,
              transformPerspective: 1100,
            }}
          >
            {/* Left — index + vertical line */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={animReady ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'absolute', left: '40px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
            >
              <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', letterSpacing: '0.12em', color: 'var(--text-dim)', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>01 / 01</span>
              <motion.div
                animate={{ height: ['0px', '60px'] }}
                transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '1px', background: 'linear-gradient(to bottom, var(--gold), transparent)', height: '60px' }}
              />
            </motion.div>

            {/* Center */}
            <div style={{ textAlign: 'center' }}>
              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, letterSpacing: '0.55em' }}
                animate={animReady ? { opacity: 1, letterSpacing: '0.35em' } : {}}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '32px' }}
              >
                {tag}
              </motion.p>

              {/* Main heading — word clip reveal */}
              <div style={{ fontSize: 'clamp(54px, 10.5vw, 112px)', fontWeight: '300', letterSpacing: '-0.05em', lineHeight: 0.93, marginBottom: '32px' }}>
                <div style={{ marginBottom: '4px' }}>
                  {['The', 'Art', 'of'].map((w, i) => (
                    <span key={w} style={{ display: 'inline-block', overflow: 'hidden', marginRight: '0.2em' }}>
                      <motion.span
                        initial={{ y: '110%' }}
                        animate={animReady ? { y: 0 } : {}}
                        transition={{ duration: 1.05, delay: 0.05 + i * 0.11, ease: [0.16, 1, 0.3, 1] }}
                        style={{ display: 'inline-block' }}
                      >
                        {w}
                      </motion.span>
                    </span>
                  ))}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <motion.span
                    initial={{ y: '110%' }}
                    animate={animReady ? { y: 0 } : {}}
                    transition={{ duration: 1.1, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      display: 'inline-block',
                      background: 'linear-gradient(120deg, var(--gold-dim) 0%, var(--gold) 30%, var(--gold-light) 55%, var(--gold) 75%, var(--gold-dim) 100%)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      animation: 'gold-shift 4s linear infinite',
                    }}
                  >
                    Grooming
                  </motion.span>
                </div>
              </div>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={animReady ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.85, delay: 0.55, ease: 'easeOut' }}
                style={{ fontSize: '15px', color: 'var(--text-muted)', maxWidth: '360px', lineHeight: '1.7', margin: '0 auto 52px' }}
              >
                Premium barbershop products curated for the modern gentleman.
              </motion.p>

              {/* Magnetic CTA */}
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={animReady ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <MagneticCTA href="/shop">Shop the Collection</MagneticCTA>
              </motion.div>
            </div>

            {/* Right — vertical label */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={animReady ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
            >
              <motion.div
                animate={{ height: ['0px', '60px'] }}
                transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '1px', background: 'linear-gradient(to bottom, transparent, var(--gold))', height: '60px' }}
              />
              <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '9px', letterSpacing: '0.12em', color: 'var(--text-dim)', writingMode: 'vertical-rl' }}>ELEVATE</span>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={animReady ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 1.1 }}
            style={{ position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', zIndex: 2 }}
          >
            <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '8px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Scroll</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, var(--gold), transparent)' }}
            />
          </motion.div>
        </section>

        {/* ═══════════════ MARQUEE ════════════════════════════════════════════ */}
        <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
          <Marquee />
          <div style={{ borderTop: '1px solid var(--border)' }}>
            <Marquee reverse />
          </div>
        </div>

        {/* ═══════════════ FEATURES ═══════════════════════════════════════════ */}
        <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '128px 40px' }}>
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: 'easeOut' }}
            style={{ marginBottom: '80px', maxWidth: '520px' }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.3em', color: 'var(--gold)', marginBottom: '16px' }}
            >
              THE ELEVATE DIFFERENCE
            </motion.p>
            <div style={{ overflow: 'hidden' }}>
              <motion.h2
                initial={{ y: '100%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '300', letterSpacing: '-0.03em', color: 'var(--text)', lineHeight: 1.15 }}
              >
                Crafted for those<br />who care.
              </motion.h2>
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0 56px' }}>
            <FeatureCard num="01" title="Premium Ingredients" body="Every formula starts with ingredients that meet the highest standard. No fillers, no shortcuts — just product that performs." i={0} />
            <FeatureCard num="02" title="Barbershop Approved" body="Developed alongside professional barbers with decades of experience. Products that do exactly what they promise." i={1} />
            <FeatureCard num="03" title="Refined Craft" body="From the weight of the jar to the finish on your hair — every detail is considered, tested, and intentional." i={2} />
          </div>
        </section>

        {/* ═══════════════ STATEMENT ══════════════════════════════════════════ */}
        <section style={{ position: 'relative', overflow: 'hidden', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)', padding: '140px 40px', textAlign: 'center' }}>
          <WaveCanvas style={{ opacity: 0.35 }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
              style={{ width: '1px', height: '72px', background: 'linear-gradient(to bottom, transparent, var(--gold))', margin: '0 auto 56px', transformOrigin: 'top' }}
            />

            {/* Quote */}
            <div style={{ overflow: 'hidden', marginBottom: '16px' }}>
              <motion.p
                initial={{ y: '100%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontSize: 'clamp(22px, 4.5vw, 46px)', fontWeight: '300', letterSpacing: '-0.03em', color: 'var(--text)', fontStyle: 'italic', lineHeight: 1.25, maxWidth: '680px', margin: '0 auto' }}
              >
                "Grooming is not vanity.
              </motion.p>
            </div>
            <div style={{ overflow: 'hidden', marginBottom: '52px' }}>
              <motion.p
                initial={{ y: '100%' }}
                whileInView={{ y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ fontSize: 'clamp(22px, 4.5vw, 46px)', fontWeight: '300', letterSpacing: '-0.03em', color: 'var(--gold)', fontStyle: 'italic', lineHeight: 1.25, maxWidth: '680px', margin: '0 auto' }}
              >
                It's craftsmanship."
              </motion.p>
            </div>

            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
              style={{ width: '1px', height: '72px', background: 'linear-gradient(to bottom, var(--gold), transparent)', margin: '0 auto', transformOrigin: 'top' }}
            />
          </div>
        </section>

        {/* ═══════════════ FINAL CTA ══════════════════════════════════════════ */}
        <section style={{ padding: '140px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '24px' }}
          >
            Ready to Elevate
          </motion.p>

          <div style={{ overflow: 'hidden', marginBottom: '52px' }}>
            <motion.h2
              initial={{ y: '100%' }}
              whileInView={{ y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: 'clamp(36px, 7vw, 80px)', fontWeight: '300', letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1 }}
            >
              Shop the Collection
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.25 }}
          >
            <MagneticCTA href="/shop">View All Products</MagneticCTA>
          </motion.div>
        </section>

        {/* ═══════════════ FOOTER ═════════════════════════════════════════════ */}
        <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.08em' }}>
            © {new Date().getFullYear()} Elevate Salon
          </span>
          <Link href="/admin" style={{ fontFamily: 'var(--font-geist-mono)', fontSize: '10px', color: 'var(--text-dim)', textDecoration: 'none', letterSpacing: '0.08em' }}>
            Admin
          </Link>
        </footer>
      </div>

      <style>{`
        @keyframes gold-shift {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @media (max-width: 640px) {
          nav { padding: 20px 24px !important; }
        }
      `}</style>
    </>
  )
}
