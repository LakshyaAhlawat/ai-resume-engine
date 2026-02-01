"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, CheckCircle2, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-6 h-16 flex items-center border-b backdrop-blur-md bg-background/50 fixed w-full z-50">
        <Link href="#" className="flex items-center gap-2 font-semibold">
          <Bot className="h-6 w-6 text-primary" />
          <span className="text-lg">ResumeAI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
            Pricing
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
            About
          </Link>
        </nav>
        <div className="ml-6 flex items-center gap-4">
            <Link href="/login">
                <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/login">
                <Button>Sign Up</Button>
            </Link>
        </div>
      </header>
      <main className="flex-1 pt-24">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 grid place-items-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                  AI-Powered Resume Shortlisting
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                  Automate your hiring process with advanced LLM reasoning. Rank candidates fairly, visually, and instantly.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/login">
                    <Button size="lg" className="h-12 px-8">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
                <Link href="/dashboard">
                    <Button variant="outline" size="lg" className="h-12 px-8">
                    View Demo
                    </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-secondary/20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-6 bg-card/50 rounded-xl border border-border/50 backdrop-blur-sm">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Instant Ranking</h2>
                <p className="text-gray-400">
                  Parse and score thousands of resumes in seconds against your JD.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 bg-card/50 rounded-xl border border-border/50 backdrop-blur-sm">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">LLM Reasoning</h2>
                <p className="text-gray-400">
                  Get detailed explanations for why a candidate is a good match, not just a number.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-6 bg-card/50 rounded-xl border border-border/50 backdrop-blur-sm">
                <div className="p-3 bg-primary/10 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Bias-Free</h2>
                <p className="text-gray-400">
                  Focus on skills and experience with our fairness-first algorithms.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-400">© 2026 ResumeAI. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-400">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-gray-400">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}
