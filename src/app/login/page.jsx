"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Bot, Mail, Lock, Loader2, Github, ArrowRight } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/lib/auth"
import { toast } from "sonner"
import { useEffect } from "react"

function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(null)
  const router = useRouter()
  const { user, login, signUp, loading, loginWithProvider } = useAuth()

  const handleOAuth = async (provider) => {
    setOauthLoading(provider)
    try {
      await loginWithProvider(provider)
    } catch (error) {
      toast.error("Sign-in failed")
      setOauthLoading(null)
    }
  }
  
  // Auto-redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function onSubmit(event) {
    event.preventDefault()
    setIsLoading(true)
    
    try {
        if (isSignUp) {
            await signUp(email, password)
            toast.success("Account created! Welcome aboard.")
            router.push("/dashboard")
        } else {
            await login(email, password)
            toast.success("Welcome back!")
            router.push("/dashboard")
        }
    } catch (error) {
        console.error("Auth error:", error)
        toast.error(error.message || "Authentication failed")
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background lg:h-screen lg:grid lg:grid-cols-2">
      {/* Ambient background for mobile/tablet — desktop gets the photo panel instead */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_color-mix(in_oklch,var(--chart-2)_16%,transparent),transparent_60%)] lg:hidden" />

      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=2676&ixlib=rb-4.0.3')] bg-cover bg-center opacity-20" />
        <Link href="/" className="relative z-20 flex items-center text-lg font-medium hover:text-primary transition-colors">
          <Bot className="mr-2 h-6 w-6 text-primary" />
          ResumeAI Engine
        </Link>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;This platform revolutionized our hiring process. We reduced bias and saved thousands of hours on manual screening.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis, Head of Talent</footer>
          </blockquote>
        </div>
      </div>

      <div className="flex min-h-screen flex-col lg:h-full lg:min-h-0 lg:p-8">
        <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:absolute lg:right-8 lg:top-8 lg:block lg:px-0 lg:py-0">
          <Link href="/" className="flex items-center gap-2 font-semibold lg:hidden">
            <Bot className="h-5 w-5 text-primary" />
            ResumeAI
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">Back to Website</Link>
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-10 sm:px-6">
        <div className="mx-auto flex w-full max-w-sm flex-col justify-center space-y-6 rounded-3xl border border-border/60 bg-card/60 p-6 shadow-xl backdrop-blur-xl sm:p-8 lg:max-w-[350px] lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none lg:backdrop-blur-none">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight break-words">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Enter your email below to create your account" : "Enter your email below to access your account"}
            </p>
          </div>
          <div className="grid gap-6">
            <form onSubmit={onSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                     <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                     <Input
                        id="email"
                        placeholder="name@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        disabled={isLoading}
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        id="password"
                        placeholder="••••••••"
                        type="password"
                        disabled={isLoading}
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <Button disabled={isLoading} className="w-full">
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isSignUp ? "Sign Up" : "Sign In"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
              <div className="text-center text-sm">
                  {isSignUp ? "Already have an account? " : "Don't have an account? "}
                  <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="underline hover:text-primary">
                      {isSignUp ? "Sign In" : "Sign Up"}
                  </button>
              </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                disabled={isLoading || oauthLoading !== null}
                onClick={() => handleOAuth("github")}
              >
                {oauthLoading === "github" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Github className="mr-2 h-4 w-4" />
                )}
                GitHub
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={isLoading || oauthLoading !== null}
                onClick={() => handleOAuth("google")}
              >
                {oauthLoading === "google" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GoogleIcon className="mr-2 h-4 w-4" />
                )}
                Google
              </Button>
            </div>
          </div>
          <p className="px-0 text-center text-sm text-muted-foreground sm:px-8">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        </div>
      </div>
    </div>
  )
}
