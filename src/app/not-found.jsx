import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Compass, Home } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6 premium-bg">
      <Card className="max-w-md w-full relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <Compass className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-4xl font-black">404</CardTitle>
          <CardDescription>
            This page doesn&apos;t exist or may have moved. Let&apos;s get you back on track.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" asChild>
            <Link href="/dashboard">
              <Home className="mr-2 h-4 w-4" /> Back to dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
