"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"
import Link from "next/link"

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Unhandled app error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-6 premium-bg">
      <Card className="max-w-md w-full border-destructive/20 relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-destructive" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>
            An unexpected error interrupted this page. Your data is safe — try again, or head back to your dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1" onClick={() => reset()}>
            <RotateCcw className="mr-2 h-4 w-4" /> Try again
          </Button>
          <Button variant="outline" className="flex-1" asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" /> Go to dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
