"use client"

import { useRef } from "react"
import { motion, useMotionTemplate, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

export function TiltCard({ children, className, ...props }) {
  const ref = useRef(null)
  const rotateX = useSpring(0, { stiffness: 200, damping: 20 })
  const rotateY = useSpring(0, { stiffness: 200, damping: 20 })
  const glowX = useSpring(50, { stiffness: 200, damping: 20 })
  const glowY = useSpring(50, { stiffness: 200, damping: 20 })
  const background = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, color-mix(in oklch, var(--primary) 15%, transparent), transparent 60%)`

  function onMouseMove(e) {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    rotateY.set((px - 0.5) * 10)
    rotateX.set((0.5 - py) * 10)
    glowX.set(px * 100)
    glowY.set(py * 100)
  }

  function onMouseLeave() {
    rotateX.set(0)
    rotateY.set(0)
    glowX.set(50)
    glowY.set(50)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={cn("glow-border relative overflow-hidden rounded-xl", className)}
      {...props}
    >
      <motion.div className="absolute inset-0 pointer-events-none" style={{ background }} />
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}
