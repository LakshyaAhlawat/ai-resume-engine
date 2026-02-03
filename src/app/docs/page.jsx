
"use client"

import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Zap, 
  MessageSquare, 
  BarChart3, 
  ArrowRight,
  Lightbulb
} from "lucide-react"
import Image from "next/image"

export default function DocsPage() {
  const features = [
    {
      title: "AI Resume Scoring",
      description: "Our core engine uses 'gemini-1.5-pro' to analyze resumes against your specific JD. It doesn't just look for keywords; it understands context, project complexity, and seniority.",
      icon: Sparkles,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Fairness & Bias Audit",
      description: "Every analysis includes a mandatory fairness check. The AI scans for gender, age, or ethnic bias in the resume and ensures your hiring process remains equitable.",
      icon: ShieldCheck,
      color: "text-green-500",
      bg: "bg-green-500/10"
    },
    {
      title: "Multi-Round Interview Simulator",
      description: "Generate tailored questions for Technical (DSA), Culture, and Systems Design rounds. Authentically simulate the experience and get 'expected answer' insights.",
      icon: MessageSquare,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Career Trajectory Projection",
      description: "The AI predicts the candidate's future growth based on their historical data, helping you identify long-term talent and high-potential individuals.",
      icon: BarChart3,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    }
  ]

  return (
    <AppShell title="User Guide & Documentation">
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-white/5 p-8 md:p-16 text-center space-y-6">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
          <Badge variant="outline" className="px-4 py-1 border-primary/20 text-primary bg-primary/5 animate-pulse">
            Documentation v1.0
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            Master the <br />AI Resume Engine
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Welcome to your mission control. Learn how to leverage advanced LLM reasoning to automate your talent pipeline with 100% explainability.
          </p>
          
          <div className="relative mt-10 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
             <img 
               src="/docs_hero_banner.png" 
               alt="Hero Banner" 
               className="w-full object-cover aspect-video"
             />
          </div>
        </div>

        {/* Quick Start Grid */}
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-gradient-to-br from-card to-card/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" /> Quick Start
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4 items-start">
                        <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
                        <p className="text-sm">Upload your candidate resumes (PDF/DOCX) in the <strong>Upload</strong> section.</p>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
                        <p className="text-sm">Paste your <strong>Job Description</strong>. Be detailed for better accuracy.</p>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
                        <p className="text-sm">Click <strong>Start Analysis</strong> and let the AI score and rank your candidates.</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-blue-500/5 border-blue-500/10">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-blue-400" /> Pro Tip
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-blue-300/80 leading-relaxed">
                        Use the <strong>"Add-on Questions"</strong> feature inside the Candidate Profile. If you're unsure about a specific skill, ask the AI to generate a targeted question for that skill in real-time.
                    </p>
                    <Button variant="link" className="p-0 text-blue-400 mt-2 h-auto" asChild>
                        <a href="/upload">Try an upload <ArrowRight className="ml-1 h-3 w-3" /></a>
                    </Button>
                </CardContent>
            </Card>
        </div>

        {/* Feature Sections */}
        <div className="space-y-20 pt-10">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-purple-500" />
                    </div>
                    <h2 className="text-3xl font-bold">Intelligent Scoring</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Our engine uses semantic embeddings to compare candidate experience with your requirements. It identifies "Gold Standard" candidates by calculating a weighted score across technical merit, role relevance, and cultural fit.
                    </p>
                    <ul className="space-y-3">
                        {['95%+ Accuracy', 'Explainable Reasoning', 'Skill Gap Identification'].map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="h-1.5 w-1.5 rounded-full bg-purple-500" /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="rounded-2xl overflow-hidden border border-white/5 shadow-xl rotate-1">
                    <img src="/docs_scoring_feature.png" alt="Scoring Feature" />
                </div>
            </div>

            {/* Feature 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1 rounded-2xl overflow-hidden border border-white/5 shadow-xl -rotate-1">
                    <img src="/docs_interview_simulator.png" alt="Interview Simulator" />
                </div>
                <div className="order-1 md:order-2 space-y-6">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-blue-500" />
                    </div>
                    <h2 className="text-3xl font-bold">Interview Simulator</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Prepare for every round. The AI generates 15 targeted questions per candidate, split across Technical, Culture, and Systems. Each question comes with an "Expected Best Answer" to guide recruiters during the actual interview.
                    </p>
                    <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                        <p className="text-xs font-mono text-blue-400 mb-2">// Sample Output</p>
                        <p className="text-sm italic">"How would you optimize this candidate's specific project architecture for 1M+ users?"</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Support Section */}
        <Card className="text-center p-10 bg-zinc-950 border-white/5 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="space-y-4 relative z-10">
                <h3 className="text-2xl font-bold">Need more help?</h3>
                <p className="text-muted-foreground">Our support team is available 24/7 for Enterprise customers.</p>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <Button variant="outline">Contact Support</Button>
                    <Button>Book a Training Session</Button>
                </div>
            </div>
        </Card>
      </div>
    </AppShell>
  )
}
