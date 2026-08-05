'use client'

import { useEffect, useRef } from 'react'

export default function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    // Set canvas size
    const setSize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
      }
    }
    setSize()
    window.addEventListener('resize', setSize)

    // Node class
    class Node {
      x: number
      y: number
      vx: number
      vy: number
      radius: number

      constructor(w: number, h: number) {
        this.x = Math.random() * w
        this.y = Math.random() * h
        this.vx = (Math.random() - 0.5) * 0.5
        this.vy = (Math.random() - 0.5) * 0.5
        this.radius = Math.random() * 2 + 2
      }

      update(w: number, h: number) {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > w) this.vx *= -1
        if (this.y < 0 || this.y > h) this.vy *= -1
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(165, 180, 252, 0.8)' // Indigo-300
        ctx.fill()
        
        // Add glow
        ctx.shadowBlur = 15
        ctx.shadowColor = 'rgba(129, 140, 248, 0.5)'
      }
    }

    const nodes = Array.from({ length: 12 }, () => new Node(canvas.width, canvas.height))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.shadowBlur = 0 // Reset shadow for lines

      // Update and draw nodes
      nodes.forEach(node => {
        node.update(canvas.width, canvas.height)
        node.draw(ctx)
      })

      // Draw lines
      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 150

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.3
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.strokeStyle = `rgba(199, 210, 254, ${alpha})` // Indigo-200
            ctx.stroke()
          }
        }
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(animate)
      }
    }

    animate()

    return () => {
      window.removeEventListener('resize', setSize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-60"
    />
  )
}
