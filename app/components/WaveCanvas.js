'use client'

import { useEffect, useRef } from 'react'

const WAVES = [
  { freq: 0.007, amp: 45, speed: 0.004, phase: 0,            alpha: 0.13, yFrac: 0.55 },
  { freq: 0.011, amp: 28, speed: 0.007, phase: Math.PI / 3,  alpha: 0.09, yFrac: 0.62 },
  { freq: 0.005, amp: 60, speed: 0.003, phase: Math.PI / 1.5,alpha: 0.07, yFrac: 0.48 },
  { freq: 0.014, amp: 18, speed: 0.012, phase: Math.PI,       alpha: 0.11, yFrac: 0.70 },
  { freq: 0.009, amp: 35, speed: 0.005, phase: Math.PI / 2,   alpha: 0.06, yFrac: 0.40 },
  { freq: 0.016, amp: 12, speed: 0.015, phase: Math.PI * 1.3, alpha: 0.08, yFrac: 0.78 },
]

export default function WaveCanvas({ style }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    function draw() {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      tRef.current += 1

      for (const wave of WAVES) {
        const baseY = h * wave.yFrac
        ctx.beginPath()
        ctx.moveTo(0, h)

        for (let x = 0; x <= w; x += 2) {
          const y = baseY + Math.sin(x * wave.freq + tRef.current * wave.speed + wave.phase) * wave.amp
          ctx.lineTo(x, y)
        }
        ctx.lineTo(w, h)
        ctx.closePath()

        const grad = ctx.createLinearGradient(0, baseY - wave.amp, 0, h)
        grad.addColorStop(0, `rgba(201,168,76,${wave.alpha})`)
        grad.addColorStop(0.5, `rgba(180,140,50,${wave.alpha * 0.6})`)
        grad.addColorStop(1, `rgba(10,10,10,0)`)
        ctx.fillStyle = grad
        ctx.fill()

        // Wave line itself
        ctx.beginPath()
        for (let x = 0; x <= w; x += 2) {
          const y = baseY + Math.sin(x * wave.freq + tRef.current * wave.speed + wave.phase) * wave.amp
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(201,168,76,${wave.alpha * 1.8})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...style,
      }}
    />
  )
}
