"use client"

import "./globals.css"
import { useEffect } from "react"

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Fatal app error:", error)
  }, [error])

  return (
    <html lang="en">
      <body className="antialiased bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-white/10 bg-card/60 p-8 text-center space-y-6 backdrop-blur-xl">
            <h1 className="text-xl font-bold">The app hit a critical error</h1>
            <p className="text-sm text-muted-foreground">
              Please reload the page. If this keeps happening, contact support and mention what you were doing.
            </p>
            <button
              onClick={() => reset()}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
