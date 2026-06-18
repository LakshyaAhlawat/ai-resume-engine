
"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Sparkles,
  Search,
  ShieldCheck,
  Zap,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Lightbulb,
  Bot,
  Mail,
  FileText,
  Github,
  MonitorPlay,
  Target,
  Rocket,
  Users2,
  FileEdit,
  MapPin,
  Globe,
  LayoutDashboard,
  Users,
  Scale,
  Settings,
  Lock
} from "lucide-react"

export default function DocsPage() {
  return (
    <Suspense fallback={null}>
      <DocsPageContent />
    </Suspense>
  )
}

function DocsPageContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "workspace")

  return (
    <AppShell title="AI Resume Engine: Mega Guide">
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 border border-primary/20 p-8 md:p-20 text-center space-y-8 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--chart-2)_25%,transparent),transparent)] pointer-events-none" />
          <div className="flex justify-center">
            <Badge variant="outline" className="px-4 sm:px-6 py-2 border-primary/30 text-primary bg-primary/10 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest sm:tracking-[0.2em] whitespace-normal text-center max-w-full">
               GenAI All-in-One Suite v2.0
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter break-words bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Your Hiring <br /><span className="text-primary italic">Exponentially</span> Faster.
          </h1>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            Welcome to the future of recruitment. From architecting perfect JDs to chatting with candidate personas—everything you need is now under one GenAI roof.
          </p>
        </div>

        {/* Categories Tabbed navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
            <div className="flex justify-center overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-x-visible">
                <TabsList className="bg-muted/50 p-1 h-14 rounded-2xl border border-primary/10 shrink-0">
                    <TabsTrigger value="workspace" className="px-4 sm:px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full">Workspace</TabsTrigger>
                    <TabsTrigger value="basics" className="px-4 sm:px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full">Basics</TabsTrigger>
                    <TabsTrigger value="genai" className="px-4 sm:px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full">GenAI Suite</TabsTrigger>
                    <TabsTrigger value="jd" className="px-4 sm:px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full">JD Engine</TabsTrigger>
                    <TabsTrigger value="intelligence" className="px-4 sm:px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full">Candidate Intel</TabsTrigger>
                    <TabsTrigger value="predictive" className="px-4 sm:px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full">Predictive Suite</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="workspace" className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="text-center max-w-2xl mx-auto space-y-4 mb-10">
                    <h2 className="text-3xl sm:text-4xl font-black break-words">Your Core Workspace</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        These are the everyday screens in your sidebar. Every one of them only ever shows data that belongs to your account — built on a strict per-user data model, never shared across recruiters.
                    </p>
                </div>
                <div className="grid gap-8 md:grid-cols-3">
                    <Card className="border-primary/10 bg-primary/[0.02]">
                        <CardHeader>
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                                <LayoutDashboard className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle>Dashboard</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed">
                            Your pipeline at a glance: candidate counts, average scores, and recent activity. It exists so you never have to dig through the full candidate list just to know where hiring stands today.
                        </CardContent>
                    </Card>
                    <Card className="border-primary/10 bg-primary/[0.02]">
                        <CardHeader>
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle>Candidates</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed">
                            Every resume you&apos;ve uploaded, scored, and saved — searchable and filterable. This is your single source of truth per role, so nothing falls through the cracks between screening rounds.
                        </CardContent>
                    </Card>
                    <Card className="border-primary/10 bg-primary/[0.02]">
                        <CardHeader>
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                                <Scale className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle>Compare</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed">
                            Put 2+ shortlisted candidates side-by-side and let AI surface the trade-offs — who has the highest ceiling vs. the lowest-risk hire — so the final call isn&apos;t a gut feeling.
                        </CardContent>
                    </Card>
                    <Card className="border-primary/10 bg-primary/[0.02]">
                        <CardHeader>
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                                <MapPin className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle>Talent Mapping</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed">
                            A visual map of your whole candidate pool by skill density and seniority. Useful for spotting gaps in your pipeline before they become a hiring crisis.
                        </CardContent>
                    </Card>
                    <Card className="border-primary/10 bg-primary/[0.02]">
                        <CardHeader>
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle>Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed">
                            Trends across every candidate you&apos;ve evaluated — score distributions, skill demand, and market intel. Helps you justify hiring decisions with data, not just instinct.
                        </CardContent>
                    </Card>
                    <Card className="border-primary/10 bg-primary/[0.02]">
                        <CardHeader>
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                                <Settings className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle>Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed">
                            Manage your profile and account. Your login is the only key to your data — nobody else can see your candidates, chats, or scoring history, and you can&apos;t see theirs.
                        </CardContent>
                    </Card>
                </div>
                <div className="p-8 rounded-2xl border border-primary/20 bg-primary/5 flex items-start gap-4">
                    <Lock className="h-6 w-6 text-primary shrink-0 mt-1" />
                    <div>
                        <h4 className="font-semibold mb-1">Privacy, by design</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Every candidate, resume, score, and AI chat you create is tagged to your account on the server and filtered on every query — not just hidden in the UI. Logging in as a different user shows a completely empty workspace until that user uploads their own resumes.
                        </p>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="basics" className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="grid gap-8 md:grid-cols-3">
                    <Card className="border-primary/10 bg-primary/[0.02]">
                        <CardHeader>
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                                <Zap className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle>Resume Parsing</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed">
                            Upload PDF or DOCX files. Our parser uses Gemini Vision (for PDFs) and text extraction to build a 100% accurate structured profile of the candidate.
                        </CardContent>
                    </Card>
                    <Card className="border-primary/10 bg-primary/[0.02]">
                        <CardHeader>
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                                <Target className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle>Groq-Powered Scoring</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed">
                            Powered by Llama 3.3 70B via Groq. Includes a 5-dimension breakdown: Technical, Experience, Education, Soft Skills, and Culture DNA. All insights are generated with sub-1s latency.
                        </CardContent>
                    </Card>
                    <Card className="border-primary/10 bg-primary/[0.02]">
                        <CardHeader>
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle>Bias-Free Hiring</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed">
                            Our "Fairness Audit" proactively scans for bias in the evaluation and ensures scoring is based strictly on performance potential and JD alignment.
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <div className="text-center max-w-2xl mx-auto space-y-2">
                        <h3 className="text-2xl font-black">Choose Your AI Persona</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Every score and insight is generated through a lens you pick on the candidate page. Same resume, same JD — different persona, different verdict. Use the one that matches what you're actually hiring for.
                        </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="border-primary/10 bg-primary/[0.02]">
                            <CardHeader>
                                <Badge variant="outline" className="w-fit mb-2 text-[10px] uppercase tracking-widest">Strictest</Badge>
                                <CardTitle>Expert Auditor</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground leading-relaxed">
                                Skeptical and precise. Grades strictly on proven technical evidence and seniority — no benefit of the doubt. Best for senior or mission-critical hires where a wrong call is expensive.
                            </CardContent>
                        </Card>
                        <Card className="border-primary/10 bg-primary/[0.02]">
                            <CardHeader>
                                <Badge variant="outline" className="w-fit mb-2 text-[10px] uppercase tracking-widest">Fastest-moving</Badge>
                                <CardTitle>Startup Hacker</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground leading-relaxed">
                                Values speed and versatility over polish. Rewards candidates who've shipped real things from scratch, even without a perfectly clean resume. Best for early-stage, scrappy teams.
                            </CardContent>
                        </Card>
                        <Card className="border-primary/10 bg-primary/[0.02]">
                            <CardHeader>
                                <Badge variant="outline" className="w-fit mb-2 text-[10px] uppercase tracking-widest">Long-term</Badge>
                                <CardTitle>System Architect</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground leading-relaxed">
                                Prioritizes scalability and maintainability over raw speed. Favors clean structure and design thinking. Best for platform, infrastructure, or staff-level roles.
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="genai" className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <Badge className="bg-primary/20 text-primary border-primary/20">Level 1 Feature</Badge>
                        <h2 className="text-3xl sm:text-4xl font-black flex items-center gap-3 break-words">
                            <Bot className="h-8 w-8 text-primary" /> AI Ghost Chat
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Stop waiting for screening calls. Chat with a <span className="text-primary font-bold italic">Virtual Ghost</span> of the candidate. Our AI clones their experience (using their resume as context) so you can ask deep technical or behavioral questions before they even walk in the door.
                        </p>
                        <div className="p-4 rounded-xl border border-primary/10 bg-muted/50 italic text-sm">
                            "Ask the Ghost: 'Explain your contribution to the low-latency trading engine project in your second role.'"
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -inset-4 bg-primary/10 blur-3xl rounded-full" />
                        <Card className="relative border-primary/20 shadow-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center">
                            <Bot className="h-20 w-20 text-primary animate-pulse" />
                        </Card>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center py-10">
                    <div className="order-2 md:order-1 relative">
                        <div className="absolute -inset-4 bg-blue-500/10 blur-3xl rounded-full" />
                        <Card className="relative border-primary/20 shadow-2xl overflow-hidden bg-slate-900 p-8 space-y-4">
                             <div className="h-2 w-2/3 bg-blue-500/30 rounded" />
                             <div className="h-2 w-1/2 bg-blue-500/20 rounded" />
                             <div className="pt-4 space-y-2">
                                <div className="h-2 w-full bg-white/5 rounded" />
                                <div className="h-2 w-full bg-white/5 rounded" />
                                <div className="h-2 w-3/4 bg-white/5 rounded" />
                             </div>
                             <div className="flex justify-end pt-4">
                                <div className="h-8 w-24 bg-blue-600 rounded-lg animate-pulse" />
                             </div>
                        </Card>
                    </div>
                    <div className="order-1 md:order-2 space-y-6">
                        <Badge className="bg-primary/20 text-primary border-primary/20">Engagement</Badge>
                        <h2 className="text-3xl sm:text-4xl font-black flex items-center gap-3 break-words">
                            <Mail className="h-8 w-8 text-primary" /> Talent Outreach
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Conversion rates matter. Generate hyper-personalized LinkedIn and Email sequences that reference specific candidate achievements. Choose between Professional, Creative, or Casual tones.
                        </p>
                        <ul className="grid grid-cols-2 gap-4">
                            {['LinkedIn Hook', 'Email Nurturing', 'Direct Copy-Paste', 'Tone Control'].map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm font-medium">
                                    <CheckCircle2 className="h-4 w-4 text-primary" /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="jd" className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="text-center max-w-2xl mx-auto space-y-4 mb-10">
                    <h2 className="text-3xl sm:text-4xl font-black break-words">AI JD Architect</h2>
                    <p className="text-muted-foreground leading-relaxed">
                        Don't start with a blank page. Build high-converting JDs in seconds by defining your mission and tech stack.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                     <Card className="border-primary/20 bg-primary/[0.02] p-8 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-bold">The Workspace</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            A dedicated environment for JD creation. Includes sections for summary, responsibilities, technical stack, and success markers. Optimized for ATS readability and human engagement.
                        </p>
                     </Card>
                     <Card className="border-primary/20 bg-primary/[0.02] p-8 space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Rocket className="h-6 w-6 text-primary" />
                            <h3 className="text-xl font-bold">One-Click Optimization</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Instantly transform technical requirements into a compelling narrative that aligns with your company culture—from Series A startups to Global Enterprises.
                        </p>
                     </Card>
                </div>
            </TabsContent>

            <TabsContent value="intelligence" className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                        <CardHeader>
                            <Github className="h-8 w-8 mb-2" />
                            <CardTitle>Portfolio Researcher</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed">
                            Auto-analyze GitHub profiles and public sites. The AI evaluates code quality, tech density, and project impact without you opening a single repo.
                        </CardContent>
                    </Card>
                    <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                        <CardHeader>
                            <MonitorPlay className="h-8 w-8 mb-2 text-primary" />
                            <CardTitle>Interview Analytics</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed">
                            Paste interview transcripts to receive an AI assessment of technical accuracy, sentiment scores, and potential "Red Flags" or "Golden Nuggets."
                        </CardContent>
                    </Card>
                    <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                        <CardHeader>
                            <BarChart3 className="h-8 w-8 mb-2 text-primary" />
                            <CardTitle>Market Salary Predictor</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed">
                            Get dynamic salary range suggestions based on skill density and market demand. Know exactly what to offer before the negotiation starts.
                        </CardContent>
                    </Card>
                </div>

                <div className="p-10 rounded-3xl bg-gradient-to-br from-primary/20 to-transparent border border-primary/30 relative overflow-hidden">
                    <div className="relative z-10 space-y-6 max-w-2xl">
                        <h3 className="text-3xl font-black">AI Role Architect</h3>
                        <p className="text-lg text-primary/80 leading-relaxed italic border-l-4 border-primary/40 pl-6">
                             "What if the perfect candidate applied for the wrong job?"
                        </p>
                        <p className="text-muted-foreground">
                            Identify high-potential talent that doesn't fit the current JD. The AI proposes custom roles where they could add massive value to your organization.
                        </p>
                    </div>
                    <Sparkles className="absolute -bottom-10 -right-10 h-64 w-64 text-primary/10" />
                </div>
            </TabsContent>

            <TabsContent value="predictive" className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <Badge className="bg-primary/20 text-primary border-primary/20">Level 4 Prediction</Badge>
                        <h2 className="text-3xl sm:text-4xl font-black flex items-center gap-3 break-words">
                            <Rocket className="h-8 w-8 text-primary" /> Projected Career Arc
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            See the future of your talent. Our AI projects the candidate's trajectory over 2, 5, and 10 years, identifying high-potential leaders and specialist experts before they reach their peak.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <Badge className="bg-primary/20 text-primary border-primary/20">Team Psychology</Badge>
                        <h2 className="text-3xl sm:text-4xl font-black flex items-center gap-3 break-words">
                            <Users2 className="h-8 w-8 text-primary" /> Team Dynamics Audit
                        </h2>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            Understand the human element. The AI audits the candidate's archetype (Visionary, Executor, etc.) and predicts how they will complement or conflict with your existing team structure.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 pt-10">
                    <Card className="border-primary/20 bg-primary/[0.02]">
                        <CardHeader>
                            <FileEdit className="h-8 w-8 mb-2 text-primary" />
                            <CardTitle>Bespoke Skill Quizzes</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Custom-generated 5-question technical assessments for every candidate. Designed to verify depth in their self-proclaimed expertise.
                        </CardContent>
                    </Card>
                    <Card className="border-primary/20 bg-primary/[0.02]">
                        <CardHeader>
                            <MapPin className="h-8 w-8 mb-2 text-primary" />
                            <CardTitle>Talent Mapping</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Visualize your entire candidate pool by skill density, seniority, and "Role Fit" to identify gaps in your hiring pipeline.
                        </CardContent>
                    </Card>
                    <Card className="border-primary/20 bg-primary/[0.02]">
                        <CardHeader>
                            <Globe className="h-8 w-8 mb-2 text-primary" />
                            <CardTitle>Market Intel</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            Internal global trends analyzer comparing your candidates against real-time industry demands and missing skills.
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </Tabs>

        {/* Support Section */}
        <Card className="text-center p-12 bg-zinc-950 border-primary/20 overflow-hidden relative rounded-[2.5rem]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="space-y-6 relative z-10">
                <h3 className="text-3xl font-bold">Ready to automate your pipeline?</h3>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">Our specialized AI agents are standing by to help you build the best team in the world.</p>
                <div className="flex flex-wrap justify-center gap-4 pt-6">
                    <Button variant="outline" className="px-8 rounded-xl h-12 border-primary/20 hover:bg-primary/5">Explore Tutorials</Button>
                    <Button className="px-8 rounded-xl h-12">Talk to an Architect</Button>
                </div>
            </div>
        </Card>
      </div>
    </AppShell>
  )
}

function CheckCircle2({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
    )
}
