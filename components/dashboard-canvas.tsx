"use client"

import { useEffect, useRef, useCallback } from "react"

// ============================================
// Canvas CG Effects for Dashboard
// Cyan/Blue color scheme
// ============================================

// ===== 1. Background Particle Field =====
export function BackgroundParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let animId: number
    let w = 0, h = 0
    const mouse = { x: -999, y: -999 }
    const COUNT = 50
    const CONNECT = 130

    class Particle {
      x = 0; y = 0; vx = 0; vy = 0; r = 0; hue = 0
      constructor() { this.reset() }
      reset() {
        this.x = Math.random() * w
        this.y = Math.random() * h
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = (Math.random() - 0.5) * 0.3
        this.r = Math.random() * 2 + 0.5
        this.hue = 185 + Math.random() * 25 // cyan range
      }
    }

    let particles: Particle[] = []

    function resize() {
      w = canvas!.width = window.innerWidth
      h = canvas!.height = window.innerHeight
      if (particles.length === 0) {
        for (let i = 0; i < COUNT; i++) particles.push(new Particle())
      }
    }

    function onMouse(e: MouseEvent) { mouse.x = e.clientX; mouse.y = e.clientY }

    resize()
    window.addEventListener("resize", resize)
    document.addEventListener("mousemove", onMouse)

    function draw() {
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const dx = p.x - mouse.x, dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          const force = ((150 - dist) / 150) * 0.015
          p.vx += dx * force
          p.vy += dy * force
        }
        p.x += p.vx; p.y += p.vy
        p.vx *= 0.99; p.vy *= 0.99
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 60%, 65%, 0.25)`
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const ddx = p.x - p2.x, ddy = p.y - p2.y
          const d = Math.sqrt(ddx * ddx + ddy * ddy)
          if (d < CONNECT) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `hsla(${(p.hue + p2.hue) / 2}, 50%, 60%, ${(1 - d / CONNECT) * 0.08})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
      document.removeEventListener("mousemove", onMouse)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-50" />
}

// ===== 2. Hero Aurora Canvas =====
export function HeroAurora({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let animId: number
    let w = 0, h = 0, time = 0

    const blobs = [
      { x: 0.2, y: 0.4, r: 0.4, hue: 185, speed: 0.0007 },
      { x: 0.6, y: 0.3, r: 0.35, hue: 200, speed: 0.001 },
      { x: 0.8, y: 0.6, r: 0.3, hue: 170, speed: 0.0008 },
      { x: 0.4, y: 0.7, r: 0.25, hue: 210, speed: 0.0012 },
    ]

    function resize() {
      const rect = canvas!.parentElement?.getBoundingClientRect()
      if (rect) {
        w = canvas!.width = rect.width
        h = canvas!.height = rect.height
      }
    }
    resize()
    window.addEventListener("resize", resize)

    function draw() {
      time++
      ctx.clearRect(0, 0, w, h)
      for (const b of blobs) {
        const cx = (b.x + Math.sin(time * b.speed) * 0.12) * w
        const cy = (b.y + Math.cos(time * b.speed * 1.3) * 0.1) * h
        const radius = b.r * Math.min(w, h)
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
        grad.addColorStop(0, `hsla(${b.hue + Math.sin(time * 0.004) * 15}, 75%, 75%, 0.15)`)
        grad.addColorStop(0.5, `hsla(${b.hue}, 65%, 70%, 0.05)`)
        grad.addColorStop(1, "transparent")
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={canvasRef} className={className || "absolute inset-0 z-0"} />
}

// ===== 3. Sparkline Canvas =====
export function SparklineCanvas({ color = "6,182,212", className }: { color?: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animatedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")!
    const w = (canvas.width = canvas.offsetWidth || 200)
    const h = (canvas.height = 40)

    const points: number[] = []
    let val = 0.5
    for (let i = 0; i < 30; i++) {
      val += (Math.random() - 0.48) * 0.15
      val = Math.max(0.1, Math.min(0.9, val))
      points.push(val)
    }

    let progress = 0
    let animId: number

    function draw() {
      progress = Math.min(1, progress + 0.02)
      ctx.clearRect(0, 0, w, h)
      const drawCount = Math.floor(points.length * progress)

      ctx.beginPath()
      for (let i = 0; i <= drawCount; i++) {
        const x = (i / (points.length - 1)) * w
        const y = (1 - points[i]) * h
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = `rgba(${color}, 0.5)`
      ctx.lineWidth = 1.5
      ctx.stroke()

      if (drawCount > 0) {
        const lastX = (drawCount / (points.length - 1)) * w
        ctx.lineTo(lastX, h)
        ctx.lineTo(0, h)
        ctx.closePath()
        const grad = ctx.createLinearGradient(0, 0, 0, h)
        grad.addColorStop(0, `rgba(${color}, 0.12)`)
        grad.addColorStop(1, `rgba(${color}, 0)`)
        ctx.fillStyle = grad
        ctx.fill()
      }
      if (progress < 1) animId = requestAnimationFrame(draw)
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animatedRef.current) {
          animatedRef.current = true
          draw()
          obs.unobserve(canvas)
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(canvas)

    return () => {
      if (animId) cancelAnimationFrame(animId)
      obs.disconnect()
    }
  }, [color])

  return <canvas ref={canvasRef} className={className || "dash-spark-canvas"} width={200} height={40} />
}

// ===== 4. Progress Ring Canvas =====
export function ProgressRing({
  percentage = 70,
  size = 160,
  lineWidth = 10,
  className,
}: {
  percentage?: number
  size?: number
  lineWidth?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animatedRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    const cx = size / 2, cy = size / 2, r = size / 2 - lineWidth - 10
    const targetPct = percentage / 100
    let currentPct = 0, glowAngle = 0
    let animId: number

    function draw() {
      currentPct = Math.min(targetPct, currentPct + 0.008)
      glowAngle += 0.03
      ctx.clearRect(0, 0, size, size)

      // BG circle
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(6,182,212,0.1)"
      ctx.lineWidth = lineWidth
      ctx.lineCap = "butt"
      ctx.stroke()

      // Progress arc
      const startAngle = -Math.PI / 2
      const endAngle = startAngle + currentPct * Math.PI * 2

      const grad = ctx.createConicGradient
        ? ctx.createConicGradient(startAngle, cx, cy)
        : ctx.createLinearGradient(0, 0, size, size)
      grad.addColorStop(0, "#06b6d4")
      grad.addColorStop(0.5, "#0ea5e9")
      grad.addColorStop(1, "#06b6d4")

      ctx.beginPath()
      ctx.arc(cx, cy, r, startAngle, endAngle)
      ctx.strokeStyle = grad
      ctx.lineWidth = lineWidth
      ctx.lineCap = "round"
      ctx.stroke()

      // Glow dot
      const dotX = cx + Math.cos(endAngle) * r
      const dotY = cy + Math.sin(endAngle) * r
      const glowR = 4 + Math.sin(glowAngle) * 1.5
      ctx.beginPath()
      ctx.arc(dotX, dotY, glowR, 0, Math.PI * 2)
      ctx.fillStyle = "#06b6d4"
      ctx.shadowColor = "#06b6d4"
      ctx.shadowBlur = 15
      ctx.fill()
      ctx.shadowBlur = 0

      if (currentPct < targetPct) {
        animId = requestAnimationFrame(draw)
      } else {
        // Continue glow animation
        function loop() {
          glowAngle += 0.03
          ctx.clearRect(0, 0, size, size)

          ctx.beginPath()
          ctx.arc(cx, cy, r, 0, Math.PI * 2)
          ctx.strokeStyle = "rgba(6,182,212,0.1)"
          ctx.lineWidth = lineWidth
          ctx.lineCap = "butt"
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(cx, cy, r, startAngle, endAngle)
          ctx.strokeStyle = grad
          ctx.lineWidth = lineWidth
          ctx.lineCap = "round"
          ctx.stroke()

          const dx2 = cx + Math.cos(endAngle) * r
          const dy2 = cy + Math.sin(endAngle) * r
          const gr2 = 4 + Math.sin(glowAngle) * 1.5
          ctx.beginPath()
          ctx.arc(dx2, dy2, gr2, 0, Math.PI * 2)
          ctx.fillStyle = "#06b6d4"
          ctx.shadowColor = "#06b6d4"
          ctx.shadowBlur = 15
          ctx.fill()
          ctx.shadowBlur = 0
          animId = requestAnimationFrame(loop)
        }
        animId = requestAnimationFrame(loop)
      }
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animatedRef.current) {
          animatedRef.current = true
          draw()
          obs.unobserve(canvas)
        }
      },
      { threshold: 0.3 }
    )
    obs.observe(canvas)

    return () => {
      if (animId) cancelAnimationFrame(animId)
      obs.disconnect()
    }
  }, [percentage, size, lineWidth])

  return <canvas ref={canvasRef} width={size} height={size} className={className} />
}

// ===== 5. Summary Card Background Blobs =====
export function SummaryBlobCanvas({ hue = 185, className }: { hue?: number; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")!
    let animId: number
    let w = 0, h = 0, time = Math.random() * 1000

    function resize() {
      w = canvas!.width = canvas!.offsetWidth || 400
      h = canvas!.height = canvas!.offsetHeight || 200
    }
    resize()

    function draw() {
      time += 0.5
      ctx.clearRect(0, 0, w, h)
      for (let i = 0; i < 2; i++) {
        const cx2 = (0.3 + i * 0.4 + Math.sin(time * 0.008 + i) * 0.15) * w
        const cy2 = (0.4 + Math.cos(time * 0.01 + i * 2) * 0.2) * h
        const radius = (0.4 + i * 0.1) * Math.min(w, h)
        const grad = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, radius)
        grad.addColorStop(0, `hsla(${hue + i * 15}, 65%, 70%, 0.12)`)
        grad.addColorStop(1, "transparent")
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, w, h)
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    window.addEventListener("resize", resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener("resize", resize)
    }
  }, [hue])

  return (
    <canvas
      ref={canvasRef}
      className={className || "absolute inset-0 w-full h-full opacity-50 pointer-events-none"}
      width={400}
      height={200}
    />
  )
}

// ===== 6. Animated Counter Hook =====
export function useAnimatedCounter(target: number, duration = 1800, decimals = 4) {
  const ref = useRef<HTMLElement>(null)
  const animatedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || animatedRef.current) return

    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4)

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animatedRef.current) {
          animatedRef.current = true
          const start = performance.now()
          function tick(now: number) {
            const p = Math.min((now - start) / duration, 1)
            if (el) {
              el.textContent = `$${(target * easeOut(p)).toFixed(decimals)}`
            }
            if (p < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          obs.unobserve(el)
        }
      },
      { threshold: 0.5 }
    )
    obs.observe(el)

    return () => obs.disconnect()
  }, [target, duration, decimals])

  return ref
}

// ===== 7. 3D Tilt Hook =====
export function use3DTilt() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = ref.current
    if (!card) return

    function onMove(e: MouseEvent) {
      const r = card!.getBoundingClientRect()
      const dx = ((e.clientX - r.left) / r.width - 0.5) * 2
      const dy = ((e.clientY - r.top) / r.height - 0.5) * 2
      card!.style.transform = `translateY(-4px) perspective(600px) rotateX(${dy * -3}deg) rotateY(${dx * 3}deg)`
    }
    function onLeave() {
      card!.style.transition = "transform .5s cubic-bezier(.34,1.56,.64,1)"
      card!.style.transform = ""
      setTimeout(() => { if (card) card.style.transition = "" }, 500)
    }

    card.addEventListener("mousemove", onMove)
    card.addEventListener("mouseleave", onLeave)

    return () => {
      card.removeEventListener("mousemove", onMove)
      card.removeEventListener("mouseleave", onLeave)
    }
  }, [])

  return ref
}

// ===== 8. Orchestrated Animation Hook =====
export function useOrchestration(delays: number[]) {
  const refs = useRef<(HTMLElement | null)[]>([])

  const setRef = useCallback((index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el
  }, [])

  useEffect(() => {
    // Reset all elements
    refs.current.forEach((el) => {
      if (el) el.classList.remove("dash-visible")
    })

    // Animate in with stagger
    delays.forEach((delay, i) => {
      setTimeout(() => {
        const el = refs.current[i]
        if (el) el.classList.add("dash-visible")
      }, delay)
    })
  }, []) // Run once on mount

  return setRef
}
