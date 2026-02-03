
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bot, ArrowLeft, FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 py-20 px-6 font-light">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <header className="space-y-4">
           <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <FileText className="h-8 w-8 text-primary" />
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Terms of Service</h1>
           <p className="text-slate-500">Last updated: February 3, 2026</p>
        </header>

        <section className="space-y-6 leading-relaxed">
          <p>
            By accessing or using <strong>ResumeAI Engine</strong>, you agree to be bound by these Terms of Service. Please read them carefully.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">1. Use of Service</h2>
          <p>
            You must be an authorized recruiter or hiring professional to use this platform. You are responsible for ensuring all resume uploads comply with local data protection laws (e.g., GDPR, CCPA).
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">2. AI-Generated Output</h2>
          <p>
            While our AI provides high-fidelity analysis, it should be used as a decision-support tool. Final hiring decisions are the sole responsibility of the human recruiter. ResumeAI is not liable for hiring outcomes.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">3. Prohibited Conduct</h2>
          <p>
            You may not use the service to scrape data, reverse-engineer our AI models, or upload malicious content. Any attempt to bypass our security measures will result in immediate account termination.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">4. Intellectual Property</h2>
          <p>
            The ResumeAI brand, its logos, and proprietary scoring algorithms are the intellectual property of ResumeAI Engine.
          </p>
        </section>

        <footer className="pt-20 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-lg">
                <Bot className="h-5 w-5 text-primary" />
                <span className="italic text-white">ResumeAI</span>
            </div>
            <p className="text-xs text-slate-600">© 2026 ResumeAI Engine</p>
        </footer>
      </div>
    </div>
  )
}
