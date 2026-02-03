
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Bot, ArrowLeft, Shield } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 py-20 px-6 font-light">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>

        <header className="space-y-4">
           <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <Shield className="h-8 w-8 text-primary" />
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Privacy Policy</h1>
           <p className="text-slate-500">Last updated: February 3, 2026</p>
        </header>

        <section className="space-y-6 leading-relaxed">
          <p>
            At <strong>ResumeAI Engine</strong>, we take your data privacy as seriously as we take our AI models. This policy describes how we collect, use, and handle your information when you use our services.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">1. Data Collection</h2>
          <p>
            We collect information you provide directly to us, such as your name, email address, and any resumes or job descriptions you upload. Resumes are processed using advanced LLM reasoning and are stored securely to provide you with insights.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">2. AI Processing</h2>
          <p>
            Your data is processed by our AI models (powered by Gemini-1.5-Pro) to provide resume scoring, bias detection, and interview generation. We do not use your proprietary resume data to train global AI models without your explicit consent.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">3. Data Security</h2>
          <p>
            We use enterprise-grade encryption and secure database protocols (Supabase) to protect your information. Access to your candidates is restricted to your authenticated account.
          </p>

          <h2 className="text-2xl font-bold text-white pt-4">4. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your data at any time through our platform. If you close your account, all associated candidate data and resumes will be permanently purged from our active systems.
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
