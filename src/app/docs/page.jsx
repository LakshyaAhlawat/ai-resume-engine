
"use client"

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
  Rocket
} from "lucide-react"

export default function DocsPage() {
  return (
    <AppShell title="AI Resume Engine: Mega Guide">
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 border border-primary/20 p-8 md:p-20 text-center space-y-8 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(var(--primary-rgb),0.15),transparent)] pointer-events-none" />
          <div className="flex justify-center">
            <Badge variant="outline" className="px-6 py-2 border-primary/30 text-primary bg-primary/10 rounded-full text-xs font-black uppercase tracking-[0.2em]">
               GenAI All-in-One Suite v2.0
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Your Hiring <br /><span className="text-primary italic">Exponentially</span> Faster.
          </h1>
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            Welcome to the future of recruitment. From architecting perfect JDs to chatting with candidate personas—everything you need is now under one GenAI roof.
          </p>
        </div>

        {/* Categories Tabbed navigation */}
        <Tabs defaultValue="basics" className="space-y-10">
            <div className="flex justify-center">
                <TabsList className="bg-muted/50 p-1 h-14 rounded-2xl border border-primary/10">
                    <TabsTrigger value="basics" className="px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full">Basics</TabsTrigger>
                    <TabsTrigger value="genai" className="px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full">GenAI Suite</TabsTrigger>
                    <TabsTrigger value="jd" className="px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full">JD Engine</TabsTrigger>
                    <TabsTrigger value="intelligence" className="px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full">Candidate Intel</TabsTrigger>
                </TabsList>
            </div>

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
                            <CardTitle>Explainable Scoring</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground leading-relaxed">
                            No more "Black Box" scores. Each candidate gets a breakdown of technical merit, experience density, and education relevance, all cited from their resume.
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
            </TabsContent>

            <TabsContent value="genai" className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <Badge className="bg-primary/20 text-primary border-primary/20">Level 1 Feature</Badge>
                        <h2 className="text-4xl font-black flex items-center gap-3">
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
                        <h2 className="text-4xl font-black flex items-center gap-3">
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
                    <h2 className="text-4xl font-black">AI JD Architect</h2>
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
