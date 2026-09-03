"use client"
import { useState, useEffect } from "react"

import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { MapPin, Calendar, CheckCircle2, XCircle, Download, Mail, Copy, ChevronLeft, Send, Bot, User, Trash2, Check, X, TrendingUp, Sparkles, Brain, LayoutGrid, RotateCcw, Plus, Github, Linkedin, ExternalLink, Coins, Eye, MonitorPlay, Target, Rocket, EyeOff, ShieldCheck, AlertCircle, ThumbsUp, ThumbsDown, BarChart3, Flame, MessageSquareQuote, Hourglass, Users2, FileEdit, Milestone, LineChart, Zap } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip as InfoTooltip, TooltipTrigger as InfoTooltipTrigger, TooltipContent as InfoTooltipContent } from "@/components/ui/tooltip"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie
} from "recharts"

const PERSONA_INFO = {
  expert: {
    label: "Expert Auditor",
    description: "Skeptical and precise. Grades strictly on proven technical evidence and seniority — the harshest of the three, best for senior/critical hires.",
  },
  hacker: {
    label: "Startup Hacker",
    description: "Values speed and versatility over polish. Rewards candidates who've shipped real things from scratch — best for early-stage, scrappy teams.",
  },
  architect: {
    label: "System Architect",
    description: "Prioritizes scalability and long-term maintainability. Favors clean structure and design thinking over raw speed — best for platform/infra roles.",
  },
}

export default function CandidatePage() {
  const params = useParams()
  const [candidate, setCandidate] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [loadingRecommendation, setLoadingRecommendation] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false)
  const [portfolioUrlInput, setPortfolioUrlInput] = useState("")
  const [quizAnswers, setQuizAnswers] = useState({})

  const selectQuizAnswer = (questionIndex, optionIndex) => {
    setQuizAnswers((prev) => {
      if (prev[questionIndex] !== undefined) return prev
      return { ...prev, [questionIndex]: optionIndex }
    })
  }
  const [selectedPersona, setSelectedPersona] = useState('expert')
  const [interviewRound, setInterviewRound] = useState('Technical')
  const [addonInput, setAddonInput] = useState("")
  const [loadingAddon, setLoadingAddon] = useState(false)

  // GenAI Expansion States
  const [outreachData, setOutreachData] = useState(null)
  const [loadingOutreach, setLoadingOutreach] = useState(false)
  const [ghostChatInput, setGhostChatInput] = useState("")
  const [ghostChatMessages, setGhostChatMessages] = useState([])
  const [ghostChatLoading, setGhostChatLoading] = useState(false)
  const [researchData, setResearchData] = useState(null)
  const [loadingResearch, setLoadingResearch] = useState(false)
  const [analysisVideo, setAnalysisVideo] = useState(null)
  const [loadingVideo, setLoadingVideo] = useState(false)
  const [videoTranscript, setVideoTranscript] = useState("")
  const [salaryData, setSalaryData] = useState(null)
  const [loadingSalary, setLoadingSalary] = useState(false)
  const [roleArchitectData, setRoleArchitectData] = useState(null)
  const [loadingRoleArchitect, setLoadingRoleArchitect] = useState(false)
  const [onboardingData, setOnboardingData] = useState(null)
  const [loadingOnboarding, setLoadingOnboarding] = useState(false)
  
  // Enterprise Suite (Level 3)
  const [analysisRating, setAnalysisRating] = useState(null) // 'good' | 'bad'
  
  // Load candidate from MongoDB
  useEffect(() => {
    const fetchCandidate = async () => {
        if (!params.id) return
        
        try {
            const { getCandidateById } = await import("@/actions/candidateActions")
            const res = await getCandidateById(params.id)
            
            if (!res.success) {
                console.error("Database Error:", res.error)
                toast.error(`Database error: ${res.error}`)
                return
            }

            if (!res.candidate) {
                toast.error("Candidate profile not found")
                return
            }

            setCandidate(res.candidate)
        } catch (err) {
            console.error("Fetch Error:", err)
            toast.error("Failed to load candidate profile")
        }
    }
    
    fetchCandidate()
  }, [params.id])

  // Chat State with MongoDB persistence
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)

  const persistChatHistory = async (messages) => {
    if (!candidate?.id) return
    const { updateCandidateChatHistory } = await import("@/actions/candidateActions")
    await updateCandidateChatHistory(candidate.id, messages)
  }

  // Load chat history from MongoDB when candidate loads
  useEffect(() => {
    if (candidate?.id) {
      if (candidate.chat_history?.length > 0) {
        setChatMessages(candidate.chat_history)
      } else {
        const initialMsg = [{ role: "assistant", content: `Hi! I'm your AI assistant. Ask me anything about ${candidate.name}'s experience or skills.` }]
        setChatMessages(initialMsg)
        persistChatHistory(initialMsg)
      }
    }
  }, [candidate?.id])

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return
    
    const userMsg = { role: "user", content: chatInput }
    const updatedMessages = [...chatMessages, userMsg]
    setChatMessages(updatedMessages)
    await persistChatHistory(updatedMessages)
    setChatInput("")
    setChatLoading(true)

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            body: JSON.stringify({ message: userMsg.content, candidate: candidate })
        })
        const data = await res.json()
        const assistantMsg = { role: data.role, content: data.content }
        const finalMessages = [...updatedMessages, assistantMsg]
        setChatMessages(finalMessages)
        await persistChatHistory(finalMessages)
    } catch (err) {
        console.error(err)
        const errorMessages = [...updatedMessages, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]
        setChatMessages(errorMessages)
        await persistChatHistory(errorMessages)
    } finally {
        setChatLoading(false)
    }
  }

  const router = useRouter()

  // Fetch AI Recommendation (On-Demand)
  const fetchRecommendation = async () => {
    if (!candidate) return;
    setLoadingRecommendation(true);
    try {
      const res = await fetch('/api/scoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          candidate_data: candidate, 
          jd: candidate.job_description || "Full Stack Engineer",
          persona: selectedPersona
        })
      });
      const data = await res.json();
      
      const parsedScore = parseInt(String(data.score).replace(/[^0-9]/g, '')) || 0;
      const mergedAnalysis = {
          ...data.analysis,
          sub_scores: data.analysis.sub_scores, 
          recommendation: data.recommendation,
          confidence: data.confidence,
          last_analyzed: new Date().toISOString()
      }

      // Update local state atomically
      setRecommendation(mergedAnalysis);
      setQuizAnswers({});

      // Persist to MongoDB
      const { updateCandidate } = await import("@/actions/candidateActions")
      const updateResult = await updateCandidate(candidate.id, { 
          score: parsedScore,
          analysis: mergedAnalysis 
      })

      if (updateResult.success) {
          // Update candidate state immediately
          setCandidate(prev => ({
              ...prev,
              score: parsedScore,
              analysis: mergedAnalysis
          }))
          
          toast.success(`AI ${selectedPersona} Analysis generated and saved!`);
      } else {
          console.error("Database persistence failed:", updateResult.error)
          toast.error("Analysis generated but failed to save to database");
      }
    } catch (error) {
      console.error("Failed to fetch recommendation:", error);
      toast.error("Failed to generate recommendation");
    } finally {
      setLoadingRecommendation(false);
    }
  };

  // Candidate Actions (MongoDB)
  const handleAccept = async () => {
    const { updateCandidate } = await import("@/actions/candidateActions")
    const res = await updateCandidate(candidate.id, { status: 'Accepted' })

    if (!res.success) {
        toast.error("Failed to update status")
        return
    }

    setCandidate({ ...candidate, status: 'Accepted' });
    toast.success(`${candidate.name} has been accepted!`);
  };

  const handleReject = async () => {
    const { updateCandidate } = await import("@/actions/candidateActions")
    const res = await updateCandidate(candidate.id, { status: 'Rejected' })

    if (!res.success) {
        toast.error("Failed to update status")
        return
    }

    setCandidate({ ...candidate, status: 'Rejected' });
    toast.error(`${candidate.name} has been rejected`);
  };

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { deleteCandidate } = await import("@/actions/candidateActions")
      
      // We can add Vercel Blob deletion here if we have a delete route/action
      // For now, we delete from DB.

      // 2. Database Deletion
      const res = await deleteCandidate(candidate.id)

      if (!res.success) {
          throw new Error(res.error)
      }

      toast.success('Candidate and resume permanently deleted');
      router.push('/dashboard');
    } catch (error) {
      console.error("Deletion failed:", error)
      toast.error(`Deletion failed: ${error.message}`)
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  };

  const handleDownload = () => {
    if (candidate?.resume_url) {
      window.open(candidate.resume_url, '_blank');
      toast.success('Resume opening in new tab');
    } else {
      toast.error('Resume file not available');
    }
  };

  if (!candidate) return <AppShell title="Loading..."><div className="p-10 text-center">Loading candidate profile...</div></AppShell>

  const technical = (recommendation || candidate.analysis)?.sub_scores?.technical || 0
  const experience = (recommendation || candidate.analysis)?.sub_scores?.experience || 0
  const education = (recommendation || candidate.analysis)?.sub_scores?.education || 0
  const softSkills = (recommendation || candidate.analysis)?.sub_scores?.soft_skills || 0
  const culture = (recommendation || candidate.analysis)?.sub_scores?.culture || 0

  const handleRequestAddon = async () => {
    if (loadingAddon) return
    setLoadingAddon(true)

    try {
      const res = await fetch('/api/interview/addon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jd: candidate.job_description,
          candidate_data: {
            name: candidate.name,
            skills: candidate.skills,
            extracted_data: candidate.extracted_data
          },
          round: interviewRound,
          user_query: addonInput
        })
      })

      const newQuestion = await res.json()
      
      if (newQuestion.question) {
        const updatedQuestions = [
          ...(candidate.analysis?.interview_questions || []),
          newQuestion
        ]

        const { updateCandidate } = await import("@/actions/candidateActions")
        const mergedAnalysis = {
          ...candidate.analysis,
          interview_questions: updatedQuestions
        }

        const res = await updateCandidate(candidate.id, { analysis: mergedAnalysis })

        if (res.success) {
          // Update candidate state
          setCandidate(prev => ({
            ...prev,
            analysis: mergedAnalysis
          }))
          
          // CRITICAL: Update recommendation state too, as it takes precedence in the UI
          if (recommendation) {
            setRecommendation(mergedAnalysis)
          }

          setAddonInput("")
          toast.success("Extra question added and persisted!")
        }
      }
    } catch (err) {
      console.error("Addon Error:", err)
      toast.error("Failed to generate extra question")
    } finally {
      setLoadingAddon(false)
    }
  }

  // GenAI Expansion Handlers
  const handleGenerateOutreach = async (platform = 'linkedin', tone = 'professional') => {
    setLoadingOutreach(true)
    try {
      const res = await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jd: candidate.job_description,
          candidate_name: candidate.name,
          candidate_data: candidate.extracted_data,
          platform,
          tone
        })
      })
      const data = await res.json()
      setOutreachData(data)
      toast.success("Personalized outreach generated!")
    } catch (err) {
      toast.error("Failed to generate outreach")
    } finally {
      setLoadingOutreach(false)
    }
  }

  const handleSendGhostMessage = async () => {
    if (!ghostChatInput.trim()) return
    const userMsg = { role: "user", content: ghostChatInput }
    setGhostChatMessages(prev => [...prev, userMsg])
    setGhostChatInput("")
    setGhostChatLoading(true)

    try {
      const res = await fetch('/api/chat/candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          history: ghostChatMessages.map(m => ({ 
            role: m.role === 'user' ? 'user' : 'model', 
            parts: [{ text: m.content }] 
          })),
          candidate_name: candidate.name,
          candidate_data: candidate.extracted_data,
          jd: candidate.job_description
        })
      })
      const data = await res.json()
      setGhostChatMessages(prev => [...prev, { role: "assistant", content: data.text }])
    } catch (err) {
      toast.error("Candidate ghost is currently silent.")
    } finally {
      setGhostChatLoading(false)
    }
  }

  const handleDeepResearch = () => {
    setPortfolioUrlInput("")
    setIsPortfolioDialogOpen(true)
  }

  const submitPortfolioResearch = async () => {
    const url = portfolioUrlInput.trim()
    if (!url) {
      toast.error("Please enter a portfolio or GitHub URL")
      return
    }
    setIsPortfolioDialogOpen(false)
    setLoadingResearch(true)
    try {
        const res = await fetch('/api/analyze/portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                portfolio_url: url,
                candidate_data: candidate.extracted_data
            })
        })
        const data = await res.json()
        setResearchData(data)
        toast.success("GitHub/Portfolio depth analysis complete!")
    } catch (err) {
        toast.error("Research failed")
    } finally {
        setLoadingResearch(false)
    }
  }

  const handleVideoAnalysis = async () => {
    if (!videoTranscript.trim()) {
        toast.error("Please paste an interview transcript first")
        return
    }
    setLoadingVideo(true)
    try {
        const res = await fetch('/api/analyze/video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                transcript: videoTranscript,
                candidate_name: candidate.name
            })
        })
        const data = await res.json()
        setAnalysisVideo(data)
        toast.success("Interview analyzed for sentiment & accuracy!")
    } catch (err) {
        toast.error("Analysis failed")
    } finally {
        setLoadingVideo(false)
    }
  }

  const handlePredictSalary = async () => {
    setLoadingSalary(true)
    try {
        const res = await fetch('/api/predict/salary', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jd: candidate.job_description,
                candidate_data: candidate.extracted_data
            })
        })
        const data = await res.json()
        setSalaryData(data)
        toast.success("Market salary range forecasted!")
    } catch (err) {
        toast.error("Forecasting failed")
    } finally {
        setLoadingSalary(false)
    }
  }

  const handleRoleArchitect = async () => {
    setLoadingRoleArchitect(true)
    try {
        const res = await fetch('/api/analyze/role-architect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                candidate_data: candidate.extracted_data,
                current_jd: candidate.job_description
            })
        })
        const data = await res.json()
        setRoleArchitectData(data)
        toast.success("Alternative career path architected!")
    } catch (err) {
        toast.error("Architecture failed")
    } finally {
        setLoadingRoleArchitect(false)
    }
  }

  const handleGenerateOnboarding = async () => {
    setLoadingOnboarding(true)
    try {
        const res = await fetch('/api/analyze/onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                candidate_data: { name: candidate.name, extracted_data: candidate.extracted_data },
                jd: candidate.job_description
            })
        })
        const data = await res.json()
        setOnboardingData(data)
        toast.success("Succes Roadmap architected!")
    } catch (err) {
        toast.error("Onboarding architecture failed")
    } finally {
        setLoadingOnboarding(false)
    }
  }

  const chartData = [
      { name: "Technical", score: technical },
      { name: "Experience", score: experience },
      { name: "Education", score: education },
      { name: "Soft Skills", score: softSkills },
      { name: "Culture", score: culture },
  ]

  return (
    <AppShell title={`Candidate #${params.id}`}>
        <div className="mb-6">
            <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>

      <div className="grid gap-8 lg:grid-cols-3 items-start pb-20 min-w-0">
        {/* Combined Side Navigation (1/3) */}
        <div className="space-y-6 lg:sticky lg:top-8 min-w-0">
          <Card className="border-primary/20 bg-card/40 backdrop-blur-xl overflow-hidden rounded-[2rem] shadow-2xl">
            <CardHeader className="pb-3 border-b border-primary/10 bg-primary/5">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-24 h-24 rounded-3xl bg-card border-2 border-primary/20 flex items-center justify-center text-3xl font-black text-primary shadow-xl">
                        {(candidate.name || "C").charAt(0)}
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black tracking-tighter leading-none">{candidate.name}</h1>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{candidate.role || "Specialist"}</p>
                    </div>
                    <div className="flex flex-col gap-1.5 w-full pt-2">
                        <div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 shadow-inner">
                            <p className="text-4xl font-black text-primary leading-none mb-1">{candidate.score || 0}%</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Match Intensity</p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <div className="grid gap-2">
                    <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-muted/30 border border-border/50 text-[11px] font-medium text-muted-foreground">
                        <Mail className="h-4 w-4 text-primary" /> {candidate.email}
                    </div>
                    <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-muted/30 border border-border/50 text-[11px] font-medium text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" /> Remote / Global
                    </div>
                    <div className="flex items-center gap-3 py-2 px-3 rounded-xl bg-muted/30 border border-border/50 text-[11px] font-medium text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary" /> Recent Application
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                    <Button variant="outline" className="rounded-2xl h-11 border-primary/20 hover:bg-primary/10 text-primary font-bold" onClick={handleAccept}>
                        <Check className="h-4 w-4 mr-1.5" /> Accept
                    </Button>
                    <Button variant="outline" className="rounded-2xl h-11 border-destructive/20 text-destructive hover:bg-destructive/10 font-bold" onClick={handleReject}>
                        <X className="h-4 w-4 mr-1.5" /> Reject
                    </Button>
                </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/40 backdrop-blur-xl overflow-hidden rounded-[2rem] shadow-xl">
             <CardHeader className="py-3 border-b border-primary/10 bg-primary/5">
               <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                 <Flame className="h-3.5 w-3.5 text-orange-500" /> Intelligence Settings
               </CardTitle>
             </CardHeader>
             <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase opacity-70">AI Persona Select</p>
                  <div className="flex gap-1 p-1 bg-muted/50 border border-border/50 rounded-2xl">
                    {['expert', 'hacker', 'architect'].map((p) => (
                      <InfoTooltip key={p}>
                        <InfoTooltipTrigger asChild>
                          <button
                            onClick={() => setSelectedPersona(p)}
                            className={`flex-1 px-2 py-2 text-[10px] font-black rounded-xl transition-all capitalize ${selectedPersona === p ? 'bg-background shadow-lg text-primary scale-[1.05]' : 'text-muted-foreground hover:text-foreground'}`}
                          >
                            {p}
                          </button>
                        </InfoTooltipTrigger>
                        <InfoTooltipContent className="max-w-[220px] text-xs leading-relaxed">
                          <span className="font-bold block mb-0.5">{PERSONA_INFO[p].label}</span>
                          {PERSONA_INFO[p].description}
                        </InfoTooltipContent>
                      </InfoTooltip>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed px-1">
                    {PERSONA_INFO[selectedPersona].description}
                  </p>
                </div>

                <Button className="w-full rounded-2xl py-8 h-auto flex flex-col items-center gap-1 font-black shadow-xl shadow-primary/20 group" onClick={fetchRecommendation} disabled={loadingRecommendation}>
                  <div className="flex items-center gap-2 text-sm uppercase tracking-tighter">
                    <RotateCcw className={`h-4 w-4 ${loadingRecommendation ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    {loadingRecommendation ? "Synchronizing Brain..." : "Generate Insights"}
                  </div>
                  <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest">{selectedPersona === 'expert' ? 'Expert Auditor' : selectedPersona === 'hacker' ? 'Startup Hacker' : 'System Architect'}</span>
                </Button>
             </CardContent>
          </Card>

          <Card className="border-primary/20 bg-card/40 backdrop-blur-xl overflow-hidden rounded-[2rem]">
             <CardContent className="p-4 grid grid-cols-3 gap-2">
                <Button variant="outline" className="rounded-xl h-12 flex flex-col gap-1 border-primary/10" onClick={handleDownload} title="Download Resume">
                    <Download className="h-4 w-4 text-primary" />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">PDF</span>
                </Button>
                <Button variant="outline" className="rounded-xl h-12 flex flex-col gap-1 border-primary/10" title="Share Profile">
                    <Copy className="h-4 w-4 text-primary" />
                    <span className="text-[8px] font-bold uppercase tracking-tighter">Share</span>
                </Button>
                <Button variant="outline" className="rounded-xl h-12 flex flex-col gap-1 border-destructive/20 text-destructive hover:bg-destructive/10" onClick={() => setIsDeleteDialogOpen(true)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="text-[8px] font-bold uppercase tracking-tighter text-destructive">Kill</span>
                </Button>
             </CardContent>
          </Card>
        </div>

        {/* Main Content Dashboard (2/3) */}
        <div className="lg:col-span-2 space-y-6 min-h-screen min-w-0">
          <Tabs defaultValue="report" className="w-full">
            <div className="flex items-center justify-between mb-6 p-1.5 bg-card/40 backdrop-blur-xl border border-primary/10 rounded-2xl sticky top-8 z-30 shadow-xl">
              <TabsList className="bg-transparent border-none w-full grid grid-cols-3 sm:grid-cols-6 gap-1 h-auto sm:h-12">
                <TabsTrigger value="report" className="text-[10px] font-black uppercase tracking-widest rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Report</TabsTrigger>
                <TabsTrigger value="intelligence" className="text-[10px] font-black uppercase tracking-widest rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Intel</TabsTrigger>
                <TabsTrigger value="interview" className="text-[10px] font-black uppercase tracking-widest rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Prep</TabsTrigger>
                <TabsTrigger value="ghost" className="text-[10px] font-black uppercase tracking-widest rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Ghost</TabsTrigger>
                <TabsTrigger value="outreach" className="text-[10px] font-black uppercase tracking-widest rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Reach</TabsTrigger>
                <TabsTrigger value="predictive" className="text-[10px] font-black uppercase tracking-widest rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all">Matrix</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="report" className="mt-0">
               <Card className="rounded-[2rem] border-primary/20 bg-card/40 backdrop-blur-xl overflow-hidden min-h-[600px]">
                 <CardContent className="p-8 space-y-8">
                   {loadingRecommendation ? (
                     <div className="flex flex-col items-center justify-center py-20 space-y-6">
                        <div className="relative">
                            <Bot className="h-16 w-16 text-primary animate-bounce" />
                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-ping" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-black tracking-tighter uppercase italic text-primary">AI Neural Matrix Loading...</p>
                            <p className="text-sm text-muted-foreground font-medium">Decoding candidate potential using Groq GPT-OSS-120B...</p>
                        </div>
                     </div>
                   ) : (recommendation || candidate.analysis?.recommendation) ? (
                     <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-primary/10">
                           <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Hire Verdict</p>
                             <div className="flex items-center gap-3">
                                <Badge className={`text-sm px-4 py-1.5 rounded-full font-black uppercase tracking-tight shadow-xl ${
                                    (recommendation || candidate.analysis).recommendation === 'Strong Hire' ? 'bg-green-600 hover:bg-green-700' :
                                    (recommendation || candidate.analysis).recommendation === 'Hire' ? 'bg-blue-600 hover:bg-blue-700' :
                                    (recommendation || candidate.analysis).recommendation === 'Maybe' ? 'bg-yellow-600 hover:bg-yellow-700' :
                                    'bg-red-600 hover:bg-red-700'
                                }`}>
                                    {(recommendation || candidate.analysis).recommendation}
                                </Badge>
                                <span className="text-xs font-bold text-muted-foreground italic">
                                    {(recommendation || candidate.analysis).confidence}% Confidence Rating
                                </span>
                             </div>
                           </div>
                           <div className="p-4 bg-primary/5 rounded-3xl border border-primary/10 text-right">
                              <p className="text-[10px] font-black uppercase text-primary mb-1">Generated Insight</p>
                              <p className="text-[10px] text-muted-foreground italic">{new Date().toLocaleDateString()}</p>
                           </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                           <div className="space-y-6">
                              <div>
                                 <h3 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-primary">
                                    <CheckCircle2 className="h-4 w-4" /> Core Strengths
                                 </h3>
                                 <ul className="space-y-3">
                                    {(recommendation || candidate.analysis)?.strengths?.map((s, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-muted-foreground bg-green-500/5 p-3 rounded-xl border border-green-500/10 hover:border-green-500/30 transition-all">
                                            <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                            </div>
                                            {s}
                                        </li>
                                    ))}
                                 </ul>
                              </div>

                              <div>
                                 <h3 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2 text-primary">
                                    <XCircle className="h-4 w-4" /> Technical Gaps
                                 </h3>
                                 <ul className="space-y-3">
                                    {(recommendation || candidate.analysis)?.weaknesses?.map((w, i) => (
                                        <li key={i} className="flex gap-3 text-sm text-muted-foreground bg-red-500/5 p-3 rounded-xl border border-red-500/10 hover:border-red-500/30 transition-all">
                                            <div className="h-5 w-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                                                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                                            </div>
                                            {w}
                                        </li>
                                    ))}
                                 </ul>
                              </div>
                           </div>

                           <div className="space-y-6">
                              <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 shadow-inner">
                                 <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Bot className="h-4 w-4 text-primary" /> Hiring Reasoning
                                 </h3>
                                 <p className="text-sm leading-relaxed text-muted-foreground italic">
                                    "{(recommendation || candidate.analysis).reasoning}"
                                 </p>
                              </div>

                              {(recommendation || candidate.analysis).candidate_feedback && (
                                <div className="p-6 bg-muted/30 rounded-[2rem] border border-border/50">
                                    <h3 className="text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <MessageSquareQuote className="h-4 w-4 text-primary" /> Growth Advice
                                    </h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {(recommendation || candidate.analysis).candidate_feedback}
                                    </p>
                                </div>
                              )}
                           </div>
                        </div>

                        {/* Summary Visualization */}
                        <div className="mt-12 p-8 bg-card/60 rounded-[2rem] border border-primary/10 grid grid-cols-2 md:grid-cols-5 gap-4">
                           {chartData.map((d, i) => (
                              <div key={i} className="text-center space-y-2">
                                 <p className="text-[9px] font-black uppercase text-muted-foreground">{d.name}</p>
                                 <p className="text-2xl font-black text-primary">{d.score}%</p>
                                 <Progress value={d.score} className="h-1.5 bg-primary/10" />
                              </div>
                           ))}
                        </div>
                     </div>
                   ) : (
                     <div className="flex flex-col items-center justify-center py-32 space-y-6 opacity-40">
                        <Bot className="h-16 w-16" />
                        <div className="text-center">
                            <p className="text-lg font-black tracking-tight uppercase">Neural Analysis Required</p>
                            <p className="text-sm">Initiate intelligence generation from the sidebar to begin.</p>
                        </div>
                     </div>
                   )}
                 </CardContent>
               </Card>
            </TabsContent>

            <TabsContent value="intelligence" className="mt-0 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Score Analysis Card */}
                    <Card className="rounded-[2rem] border-primary/20 bg-card/40 backdrop-blur-xl overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-widest">Radar Alignment</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={10} width={80} fontWeight="bold" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid color-mix(in oklch, var(--chart-1) 30%, transparent)' }}
                                            itemStyle={{ color: 'var(--foreground)' }}
                                            cursor={{ fill: 'color-mix(in oklch, var(--chart-1) 8%, transparent)' }}
                                        />
                                        <Bar dataKey="score" fill="var(--chart-1)" radius={[0, 12, 12, 0]} barSize={24}>
                                            {chartData.map((entry, index) => (
                                                <Cell key={index} fill={index % 2 === 0 ? 'var(--chart-1)' : 'color-mix(in oklch, var(--chart-1) 60%, transparent)'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Fairness Audit */}
                    {(recommendation || candidate.analysis)?.fairness_audit && (
                        <Card className="rounded-[2rem] border-primary/20 bg-primary/5 backdrop-blur-xl overflow-hidden shadow-inner">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-green-500" />
                                    <CardTitle className="text-sm font-black uppercase tracking-widest">Fairness Protocol</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-background/40 rounded-2xl border border-border/50">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Evidence Density</span>
                                        <p className="text-xl font-black mt-1">{(recommendation || candidate.analysis).fairness_audit.evidence_density}</p>
                                    </div>
                                    <div className="p-4 bg-background/40 rounded-2xl border border-border/50">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Seniority Sync</span>
                                        <p className="text-xl font-black mt-1">{(recommendation || candidate.analysis).fairness_audit.seniority_alignment}</p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-3xl bg-green-500/5 border border-green-500/10 text-xs italic leading-relaxed text-muted-foreground">
                                    "{(recommendation || candidate.analysis).fairness_audit.notes}"
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Market Gap Analysis */}
                    {(recommendation || candidate.analysis)?.market_gap_analysis && (
                        <Card className="rounded-[2rem] border-primary/20 bg-card/40 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="py-4 border-b border-primary/10 bg-primary/5">
                                <div className="flex items-center gap-2">
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                    <CardTitle className="text-sm font-black uppercase tracking-widest">Market Leverage</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="flex justify-between items-center bg-background/40 p-3 rounded-2xl border">
                                    <span className="text-xs font-bold text-muted-foreground">Global Demand</span>
                                    <Badge variant="outline" className="text-xs font-black uppercase">{(recommendation || candidate.analysis).market_gap_analysis.demand_forecast}</Badge>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Critical Gaps vs Market:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {(recommendation || candidate.analysis).market_gap_analysis.trending_skills_missing.map((s, i) => (
                                            <Badge key={i} variant="secondary" className="text-[10px] px-3 py-1 bg-red-500/10 text-red-600 border-red-500/20">{s}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-primary/5 text-xs text-muted-foreground leading-relaxed">
                                    <span className="font-black text-primary block mb-1">UNIQUE EDGE:</span>
                                    {(recommendation || candidate.analysis).market_gap_analysis.unique_market_leverage}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Consensus metrics */}
                    {(recommendation || candidate.analysis)?.consensus_metrics && (
                        <Card className="rounded-[2rem] border-primary/20 bg-card/40 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="py-4 border-b border-primary/10 bg-primary/5">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-yellow-500" />
                                    <CardTitle className="text-sm font-black uppercase tracking-widest">AI Multi-Model Consensus</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-6 relative">
                                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-primary/10 hidden md:block" />
                                    <div className="space-y-4 text-center">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Gemini-Pro</p>
                                        <p className="text-4xl font-black text-primary">{(recommendation || candidate.analysis).consensus_metrics.gemini_score}</p>
                                    </div>
                                    <div className="space-y-4 text-center">
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase">GPT-OSS-120B (Groq)</p>
                                        <p className="text-4xl font-black text-primary">{(recommendation || candidate.analysis).consensus_metrics.groq_score}</p>
                                    </div>
                                </div>
                                <div className="mt-8 pt-6 border-t border-primary/10 flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-primary" /> Variance: {(recommendation || candidate.analysis).consensus_metrics.variance}%
                                        </div>
                                        <div className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5">
                                            <span className="h-2 w-2 rounded-full bg-green-500" /> Reliability: {(recommendation || candidate.analysis).consensus_metrics.reliability}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                
                
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Research & Salary */}
                    <Card className="border-primary/20 bg-card/40 backdrop-blur-xl">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Github className="h-5 w-5" />
                                <CardTitle className="text-sm font-black uppercase">Portfolio Research</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!researchData ? (
                                <Button className="w-full" onClick={handleDeepResearch} disabled={loadingResearch}>
                                    {loadingResearch ? <RotateCcw className="h-4 w-4 animate-spin mr-2" /> : <ExternalLink className="h-4 w-4 mr-2" />}
                                    Deep Dive GitHub/Portfolio
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium">Technical Depth:</span>
                                        <Badge variant="secondary">{researchData.depth_score}/100</Badge>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed italic border-l-2 pl-3">"{researchData.assessment}"</p>
                                    <Button size="sm" variant="outline" className="w-full" onClick={handleDeepResearch}>New Search</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-card/40 backdrop-blur-xl">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Coins className="h-5 w-5 text-yellow-500" />
                                <CardTitle className="text-sm font-black uppercase">Salary Forecast</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!salaryData ? (
                                <Button className="w-full" onClick={handlePredictSalary} disabled={loadingSalary}>
                                    {loadingSalary ? <RotateCcw className="h-4 w-4 animate-spin mr-2" /> : <Coins className="h-4 w-4 mr-2" />}
                                    Predict Market Range
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-center">
                                        <p className="text-xl font-bold text-primary">{salaryData.range.mid}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase">{salaryData.range.low} - {salaryData.range.high} ({salaryData.currency})</p>
                                    </div>
                                    <Button size="sm" variant="outline" className="w-full" onClick={handlePredictSalary}>Recalculate</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Interview Video Intelligence */}
                    <Card className="border-primary/20 bg-card/40 backdrop-blur-xl">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <MonitorPlay className="h-5 w-5 text-purple-500" />
                                <CardTitle className="text-sm font-black uppercase">Video Intel</CardTitle>
                            </div>
                            <CardDescription className="text-[10px]">Analyze transcripts for sentiment.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!analysisVideo ? (
                                <div className="space-y-4">
                                    <textarea 
                                        className="w-full h-24 p-2 text-[10px] bg-muted/30 rounded-lg border border-dashed resize-none focus:outline-none"
                                        placeholder="Paste interview transcript..."
                                        value={videoTranscript}
                                        onChange={(e) => setVideoTranscript(e.target.value)}
                                    />
                                    <Button size="sm" className="w-full" onClick={handleVideoAnalysis} disabled={loadingVideo || !videoTranscript.trim()}>
                                        {loadingVideo ? <RotateCcw className="h-3 w-3 animate-spin mr-2" /> : "Analyze Sentiment"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-medium">Accuracy</span>
                                        <Badge variant="secondary" className="text-[9px]">{analysisVideo.technical_score}%</Badge>
                                    </div>
                                    <Progress value={analysisVideo.technical_score} className="h-1.5" />
                                    <Button size="xs" variant="ghost" className="w-full text-[9px]" onClick={() => setAnalysisVideo(null)}>New Analysis</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20 bg-card/40 backdrop-blur-xl">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                <CardTitle className="text-sm font-black uppercase">Role Architect</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!roleArchitectData ? (
                                <Button size="sm" className="w-full bg-primary/20 hover:bg-primary/30 text-primary border-primary/30" onClick={handleRoleArchitect} disabled={loadingRoleArchitect}>
                                    Architect Alternative Path
                                </Button>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-primary uppercase">Proposed Role:</p>
                                    <p className="text-sm font-black leading-tight">{roleArchitectData.proposed_role}</p>
                                    <Button size="xs" variant="ghost" className="w-full text-[9px]" onClick={() => setRoleArchitectData(null)}>Reset</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-primary/20 bg-card/40 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" /> Culture Radar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[250px]">
                            {candidate.analysis?.culture_radar ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={candidate.analysis.culture_radar}>
                                        <PolarGrid stroke="var(--border)" />
                                        <PolarAngleAxis dataKey="value" tick={{ fill: "var(--muted-foreground)", fontSize: 9 }} />
                                        <Radar name={candidate.name} dataKey="score" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.5} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                                    <p className="text-[10px] italic text-center">Re-run analysis to generate data</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-primary/20 bg-primary/[0.02] bg-card/40 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                                <Rocket className="h-5 w-5 text-primary" /> Success Roadmap
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!onboardingData ? (
                                <Button size="sm" className="w-full" onClick={handleGenerateOnboarding} disabled={loadingOnboarding}>
                                    Architect Onboarding plan
                                </Button>
                            ) : (
                                <ScrollArea className="h-[200px]">
                                    <ul className="space-y-2">
                                        {onboardingData.phases.map((phase, idx) => (
                                            <li key={idx} className="text-[10px]">
                                                <span className="font-bold text-primary">{phase.period}:</span> {phase.focus}
                                            </li>
                                        ))}
                                    </ul>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>


                    <TabsContent value="interview" className="flex-1 mt-0">
                        <Card className="h-full">
                            <CardHeader className="pb-3">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Sparkles className="h-5 w-5 text-primary" />
                                            Interview Preparation Simulator
                                        </CardTitle>
                                        <CardDescription>Generated specifically for {candidate.name}</CardDescription>
                                    </div>
                                    <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
                                        {['Technical', 'Culture', 'Systems'].map((round) => (
                                            <button
                                                key={round}
                                                onClick={() => setInterviewRound(round)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${interviewRound === round ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                            >
                                                {round}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {(recommendation || candidate.analysis)?.interview_questions && Array.isArray((recommendation || candidate.analysis)?.interview_questions) ? (
                                    <div className="grid gap-4">
                                        {(recommendation || candidate.analysis)?.interview_questions
                                            .filter(q => q && (q.round || 'Technical').toLowerCase() === interviewRound.toLowerCase() && q.question?.trim())
                                            .map((q, i) => (
                                                <div key={i} className="p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                                                    <p className="font-medium text-sm text-foreground leading-relaxed">
                                                        <span className="text-primary mr-2">Q{i+1}:</span>
                                                        {q.question}
                                                    </p>
                                                    <div className="mt-3 p-3 rounded bg-background/50 border border-dashed border-primary/20">
                                                        <p className="text-xs font-semibold text-primary/70 uppercase tracking-tighter mb-1">Look for in the answer:</p>
                                                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                                                            {q.expected_answer || "Focus on core technical proof and seniority markers."}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        {(recommendation || candidate.analysis)?.interview_questions.filter(q => q && (q.round || 'Technical').toLowerCase() === interviewRound.toLowerCase() && q.question?.trim()).length === 0 && (
                                            <div className="text-center py-10 text-sm text-muted-foreground">
                                                No questions available for this round. Try regenerating the analysis.
                                            </div>
                                        )}

                                        <div className="pt-6 border-t mt-4">
                                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3 flex items-center">
                                                <Plus className="mr-1 h-3 w-3" /> Request Custom Add-on
                                            </p>
                                            <div className="flex gap-2">
                                                <Input 
                                                    placeholder={`Ask for a specific ${interviewRound} topic...`} 
                                                    value={addonInput}
                                                    onChange={(e) => setAddonInput(e.target.value)}
                                                    className="bg-background text-sm"
                                                    disabled={loadingAddon}
                                                />
                                                <Button size="sm" onClick={handleRequestAddon} disabled={loadingAddon || !addonInput.trim()}>
                                                    {loadingAddon ? <RotateCcw className="h-4 w-4 animate-spin" /> : "Request"}
                                                </Button>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground mt-2 italic">
                                                Tip: Try "Ask me about a React hook" or "Generate a harder DSA problem".
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-20 flex flex-col items-center gap-4">
                                        <div className="p-4 rounded-full bg-primary/5">
                                            <Brain className="h-10 w-10 text-primary/40" />
                                        </div>
                                        <p className="text-muted-foreground text-sm max-w-[250px]">
                                            Analysis needed. Use the <strong>Analyze</strong> button in the sidebar to generate custom interview questions.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

            <TabsContent value="ghost" className="mt-0">
                <Card className="rounded-[2rem] border-primary/20 bg-card/40 backdrop-blur-xl overflow-hidden min-h-[600px] flex flex-col">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Bot className="h-5 w-5 text-primary" />
                                    <CardTitle>AI Candidate Ghost Chat</CardTitle>
                                </div>
                                <CardDescription>Role-play with a virtual persona of {candidate.name} based on their resume.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col min-h-0 p-4">
                                <ScrollArea className="flex-1 pr-4 mb-4">
                                    <div className="flex flex-col gap-4 pb-4">
                                        {ghostChatMessages.length === 0 && (
                                            <div className="text-center py-10 opacity-50">
                                                <p className="text-sm">Ask the "Ghost" candidate a question about their background...</p>
                                            </div>
                                        )}
                                        {ghostChatMessages.map((msg, i) => (
                                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                {msg.role !== 'user' && (
                                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20">
                                                        <Bot className="h-4 w-4 text-primary" />
                                                    </div>
                                                )}
                                                <div className={`rounded-2xl p-4 max-w-[85%] text-sm shadow-sm ${
                                                    msg.role === 'user' 
                                                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                                        : 'bg-muted border border-border rounded-tl-none'
                                                }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                        {ghostChatLoading && (
                                            <div className="flex gap-3 justify-start">
                                                 <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 animate-pulse">
                                                        <Bot className="h-4 w-4 text-primary" />
                                                 </div>
                                                 <div className="bg-muted rounded-2xl p-4 text-sm animate-pulse border border-border">
                                                    The candidate is typing...
                                                 </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                                <div className="flex gap-2 pt-4 border-t border-primary/10">
                                    <Input 
                                        placeholder={`Ask ${candidate.name.split(' ')[0]} anything...`} 
                                        value={ghostChatInput}
                                        onChange={(e) => setGhostChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendGhostMessage()}
                                        className="rounded-xl bg-background"
                                    />
                                    <Button onClick={handleSendGhostMessage} disabled={ghostChatLoading} className="rounded-xl px-6">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="outreach" className="flex-1 mt-0">
                        <Card className="h-full border-primary/20">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-primary" />
                                    <CardTitle>AI Talent Outreach</CardTitle>
                                </div>
                                <CardDescription>Generate personalized messages that get replies.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3 p-4 rounded-xl border bg-muted/30">
                                        <p className="text-sm font-semibold flex items-center gap-2">
                                            <Linkedin className="h-4 w-4 text-blue-600" /> LinkedIn Variant
                                        </p>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleGenerateOutreach('linkedin', 'professional')} disabled={loadingOutreach}>
                                                Professional
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleGenerateOutreach('linkedin', 'casual')} disabled={loadingOutreach}>
                                                Casual
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-3 p-4 rounded-xl border bg-muted/30">
                                        <p className="text-sm font-semibold flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-primary" /> Email Variant
                                        </p>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" onClick={() => handleGenerateOutreach('email', 'professional')} disabled={loadingOutreach}>
                                                Formal
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => handleGenerateOutreach('email', 'creative')} disabled={loadingOutreach}>
                                                Creative
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {loadingOutreach && (
                                    <div className="py-20 text-center animate-pulse space-y-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                            <Sparkles className="h-6 w-6 text-primary" />
                                        </div>
                                        <p className="text-sm text-muted-foreground italic">Drafting the perfect message...</p>
                                    </div>
                                )}

                                {outreachData && !loadingOutreach && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <Card className="bg-slate-900 border-primary/30 text-slate-100 overflow-hidden">
                                            {outreachData.subject && (
                                                <div className="px-4 py-2 border-b border-primary/20 bg-primary/10 font-medium text-xs">
                                                    Subject: {outreachData.subject}
                                                </div>
                                            )}
                                            <div className="p-6 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                                                {outreachData.message}
                                            </div>
                                            <CardContent className="pt-0 flex justify-end p-4">
                                                <Button size="sm" variant="ghost" onClick={() => {
                                                    navigator.clipboard.writeText(outreachData.message)
                                                    toast.success("Copied to clipboard!")
                                                }}>
                                                    <Copy className="h-3 w-3 mr-2" /> Copy Message
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="predictive" className="flex-1 mt-0">
                        <div className="grid gap-6">
                            {/* Level 4: Career Arc & Team Dynamics */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="border-primary/20">
                                    <CardHeader>
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Hourglass className="h-4 w-4 text-primary" /> Projected Career Arc
                                        </CardTitle>
                                        <CardDescription className="text-[10px]">AI-calculated trajectory for 10 years</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="relative pl-8 space-y-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/20">
                                            {[
                                                { label: "2 YEAR", title: (recommendation || candidate.analysis)?.career_arc?.title_2_year || "Senior Engineer" },
                                                { label: "5 YEAR", title: (recommendation || candidate.analysis)?.career_arc?.title_5_year || "Staff/Principal" },
                                                { label: "10 YEAR", title: (recommendation || candidate.analysis)?.career_arc?.title_10_year || "VP Intelligence" }
                                            ].map((milestone, i) => (
                                                <div key={i} className="relative">
                                                    <div className="absolute -left-8 top-1 h-3 w-3 rounded-full bg-primary border-4 border-background" />
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase">{milestone.label}</p>
                                                    <p className="text-sm font-bold text-primary">{milestone.title}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-3 rounded-xl bg-primary/5 border border-dashed border-primary/20">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Trajectory Model</p>
                                            <p className="text-xs italic">"{(recommendation || candidate.analysis)?.career_arc?.milestone_prediction || "Predictive models suggest rapid technical advancement toward strategic leadership."}"</p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-primary/20">
                                    <CardHeader>
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Users2 className="h-4 w-4 text-primary" /> Team Dynamics Audit
                                        </CardTitle>
                                        <CardDescription className="text-[10px]">Archetype & Culture Complementarity</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 border">
                                           <div>
                                             <p className="text-[10px] font-bold text-muted-foreground uppercase">Role Archetype</p>
                                             <p className="text-lg font-black text-primary">{(recommendation || candidate.analysis)?.team_dynamics?.archetype || "Visionary"}</p>
                                           </div>
                                           <div className="p-3 bg-primary/10 rounded-full">
                                             <Rocket className="h-5 w-5 text-primary" />
                                           </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Gap Contribution:</p>
                                            <p className="text-xs leading-relaxed">
                                                {(recommendation || candidate.analysis)?.team_dynamics?.team_complementarity || "Providing high-level structural thinking that may be missing in execution-heavy teams."}
                                            </p>
                                        </div>
                                        <div className="pt-2">
                                            <p className="text-[10px] font-bold text-red-500 uppercase mb-2">Watch-out Areas:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {(recommendation || candidate.analysis)?.team_dynamics?.potential_conflict_areas?.map((area, i) => (
                                                    <Badge key={i} variant="outline" className="text-[8px] border-red-500/30 text-red-600 bg-red-500/5">{area}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Level 4: Skill Verification Quiz */}
                            <Card className="border-primary/20 shadow-lg shadow-primary/5">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FileEdit className="h-5 w-5 text-primary" /> Bespoke Skill Verification Quiz
                                        </CardTitle>
                                        <CardDescription className="text-xs font-mono">Generated specifically for {candidate.name}</CardDescription>
                                    </div>
                                    <Badge variant="outline" className="bg-primary/5">Level 4 Interactive</Badge>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {(recommendation || candidate.analysis)?.skill_verification_quiz ? (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {(recommendation || candidate.analysis).skill_verification_quiz.slice(0, 4).map((q, i) => (
                                                <div key={i} className="p-4 rounded-xl border bg-muted/30 space-y-3">
                                                    <div className="flex justify-between">
                                                        <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Q{i+1}</p>
                                                        <Badge className="text-[8px] h-4">{q.difficulty}</Badge>
                                                    </div>
                                                    <p className="text-sm font-bold leading-tight">{q.question}</p>
                                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                                        {q.options.map((opt, oi) => {
                                                            const selected = quizAnswers[i]
                                                            const isPicked = selected === oi
                                                            const isCorrect = oi === q.correct_index
                                                            const revealed = selected !== undefined
                                                            return (
                                                                <button
                                                                    key={oi}
                                                                    type="button"
                                                                    onClick={() => selectQuizAnswer(i, oi)}
                                                                    disabled={revealed}
                                                                    className={`p-2 rounded border text-[10px] text-center transition-all ${
                                                                        revealed && isCorrect
                                                                            ? "bg-green-500/10 border-green-500/40 text-green-500 font-bold"
                                                                            : revealed && isPicked
                                                                            ? "bg-red-500/10 border-red-500/40 text-red-500 font-bold"
                                                                            : "bg-background border-border text-muted-foreground hover:border-primary"
                                                                    }`}
                                                                >
                                                                    {opt}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                    {quizAnswers[i] !== undefined && (
                                                        <p className={`text-[10px] font-bold ${quizAnswers[i] === q.correct_index ? "text-green-500" : "text-red-500"}`}>
                                                            {quizAnswers[i] === q.correct_index ? "Correct" : "Incorrect"} — answer: {q.options[q.correct_index]}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-10 text-center border-2 border-dashed rounded-xl">
                                            <p className="text-sm text-muted-foreground italic">Regenerate the analysis to produce a customized technical quiz for this candidate.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle className="text-xl font-bold text-destructive">Delete Candidate Profile?</DialogTitle>
                <DialogDescription className="pt-2">
                    This will permanently delete <strong>{candidate?.name}</strong> and their resume from the database and storage. This action cannot be undone.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                    Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="min-w-[100px]">
                    {isDeleting ? "Deleting..." : "Delete Permanently"}
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPortfolioDialogOpen} onOpenChange={setIsPortfolioDialogOpen}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Github className="h-5 w-5 text-primary" /> Deep Dive Research
                </DialogTitle>
                <DialogDescription className="pt-2">
                    Paste a GitHub profile or personal portfolio URL. The AI assesses technical depth using the candidate's resume as ground truth — it does not browse the link itself.
                </DialogDescription>
            </DialogHeader>
            <Input
                autoFocus
                placeholder="https://github.com/username"
                value={portfolioUrlInput}
                onChange={(e) => setPortfolioUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitPortfolioResearch() }}
            />
            <DialogFooter className="mt-4 flex gap-3">
                <Button variant="outline" onClick={() => setIsPortfolioDialogOpen(false)}>Cancel</Button>
                <Button onClick={submitPortfolioResearch}>Analyze</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  )
}
