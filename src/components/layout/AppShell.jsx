"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { Background3D } from "@/components/landing/Background3D"
import { useAuth } from "@/lib/auth"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { TooltipProvider } from "@/components/ui/tooltip"

export function AppShell({ children, title }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Safety net: if a Dialog/Sheet gets interrupted mid-close by a route change,
  // Radix can leave the page's scroll permanently locked. Clear it on every navigation.
  useEffect(() => {
    document.documentElement.style.overflow = ""
    document.body.style.overflow = ""
    document.documentElement.removeAttribute("data-scroll-locked")
    document.body.removeAttribute("data-scroll-locked")
  }, [pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground animate-pulse">Ensuring secure session...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-screen premium-bg">
        <Background3D variant="subtle" />
        <div className="scanline-overlay" />
        <span className="hud-corner hud-corner-tr" />
        <span className="hud-corner hud-corner-br" />
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col relative z-10">
          <Header title={title} />
          <main className="flex-1 min-w-0 p-4 sm:p-6 space-y-6 overflow-y-auto overflow-x-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
