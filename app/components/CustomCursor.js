'use client'

import { useEffect, useRef } from 'react'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)
  const posRef = useRef({ x: -100, y: -100 })
  const ringPosRef = useRef({ x: -100, y: -100 })
  const rafRef = useRef(null)
  const hoveredRef = useRef(false)

  useEffect(() => {
    // Hide default cursor
    document.documentElement.style.cursor = 'none'

    function onMove(e) {
      posRef.current = { x: e.clientX, y: e.clientY }
    }

    function onOver(e) {
      const el = e.target.closest('a, button, [role="button"], input, textarea, select, label')
      hoveredRef.current = !!el
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseover', onOver, { passive: true })

    function loop() {
      const dot = dotRef.current
      const ring = ringRef.current
      if (!dot || !ring) {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      // Dot: instant follow
      dot.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`

      // Ring: lerp for lag
      const lerpFactor = 0.12
      ringPosRef.current.x += (posRef.current.x - ringPosRef.current.x) * lerpFactor
      ringPosRef.current.y += (posRef.current.y - ringPosRef.current.y) * lerpFactor
      ring.style.transform = `translate(${ringPosRef.current.x}px, ${ringPosRef.current.y}px) scale(${hoveredRef.current ? 1.8 : 1})`

      rafRef.current = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      document.documentElement.style.cursor = ''
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <>
      {/* Outer ring */}
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '36px',
          height: '36px',
          marginLeft: '-18px',
          marginTop: '-18px',
          borderRadius: '50%',
          border: '1px solid rgba(61,216,205,0.6)',
          pointerEvents: 'none',
          zIndex: 99999,
          transition: 'transform 0.15s ease, opacity 0.2s',
          willChange: 'transform',
          mixBlendMode: 'difference',
        }}
      />
      {/* Inner dot */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '6px',
          height: '6px',
          marginLeft: '-3px',
          marginTop: '-3px',
          borderRadius: '50%',
          background: 'var(--gold)',
          pointerEvents: 'none',
          zIndex: 100000,
          willChange: 'transform',
        }}
      />
    </>
  )
}
