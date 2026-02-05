"use client"
import { useState, useEffect } from "react"

import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle, Download, Mail, Copy, ChevronLeft, Send, Bot, User, Trash2, Check, X, TrendingUp, Sparkles, Brain, LayoutGrid, RotateCcw, Plus, Github, Linkedin, ExternalLink, Coins, Eye, MonitorPlay, Target, Rocket, EyeOff, ShieldCheck, AlertCircle, ThumbsUp, ThumbsDown } from "lucide-react"
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

export default function CandidatePage() {
  const params = useParams()
  const [candidate, setCandidate] = useState(null)
  const [recommendation, setRecommendation] = useState(null)
  const [loadingRecommendation, setLoadingRecommendation] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
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
  const [isBlindMode, setIsBlindMode] = useState(false)
  const [analysisRating, setAnalysisRating] = useState(null) // 'good' | 'bad'
  
  // Load candidate from Supabase
  useEffect(() => {
    const fetchCandidate = async () => {
        if (!params.id) return
        
        try {
            const { supabase } = await import("@/lib/supabase")
            const { data, error } = await supabase
                .from('candidates')
                .select('*')
                .eq('id', params.id)
                .maybeSingle()
            
            if (error) {
                console.error("Database Error:", error.message)
                toast.error(`Database error: ${error.message}`)
                return
            }

            if (!data) {
                toast.error("Candidate profile not found")
                return
            }

            setCandidate(data)
        } catch (err) {
            console.error("Fetch Error:", err)
            toast.error("Failed to load candidate profile")
        }
    }
    
    fetchCandidate()
  }, [params.id])

  // Chat State with localStorage persistence
  const [chatInput, setChatInput] = useState("")
  const [chatMessages, setChatMessages] = useState([])
  const [chatLoading, setChatLoading] = useState(false)

  // Load chat history from localStorage when candidate loads
  useEffect(() => {
    if (candidate?.id) {
      const savedChats = localStorage.getItem(`chat_${candidate.id}`)
      if (savedChats) {
        setChatMessages(JSON.parse(savedChats))
      } else {
        // Initialize with welcome message
        const initialMsg = [{ role: "assistant", content: `Hi! I'm your AI assistant. Ask me anything about ${candidate.name}'s experience or skills.` }]
        setChatMessages(initialMsg)
        localStorage.setItem(`chat_${candidate.id}`, JSON.stringify(initialMsg))
      }
    }
  }, [candidate?.id])

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return
    
    const userMsg = { role: "user", content: chatInput }
    const updatedMessages = [...chatMessages, userMsg]
    setChatMessages(updatedMessages)
    localStorage.setItem(`chat_${candidate.id}`, JSON.stringify(updatedMessages))
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
        localStorage.setItem(`chat_${candidate.id}`, JSON.stringify(finalMessages))
    } catch (err) {
        console.error(err)
        const errorMessages = [...updatedMessages, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]
        setChatMessages(errorMessages)
        localStorage.setItem(`chat_${candidate.id}`, JSON.stringify(errorMessages))
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
          candidate_data: isBlindMode ? { ...candidate, name: "[ANONYMIZED]", email: "hidden@company.com" } : candidate, 
          jd: candidate.job_description || "Full Stack Engineer",
          persona: selectedPersona,
          blind_mode: isBlindMode
        })
      });
      const data = await res.json();
      
      const { supabase } = await import("@/lib/supabase")
      
      const mergedAnalysis = {
          ...data.analysis,
          recommendation: data.recommendation,
          confidence: data.confidence
      }

      // Update local recommendation summary state with the merged object
      setRecommendation(mergedAnalysis);

      // Persist the new analysis to Supabase
      const { error: updateError } = await supabase
          .from('candidates')
          .update({ 
              score: data.score,
              analysis: mergedAnalysis 
          })
          .eq('id', candidate.id)

      if (!updateError) {
          // Update local candidate state so all tabs and charts refresh
          setCandidate(prev => ({
              ...prev,
              score: data.score,
              analysis: mergedAnalysis
          }))
          toast.success(`AI ${selectedPersona} Analysis generated and saved!`);
      } else {
          console.error("Database persistence failed:", updateError)
          toast.error("Analysis generated but failed to save to database");
      }
    } catch (error) {
      console.error("Failed to fetch recommendation:", error);
      toast.error("Failed to generate recommendation");
    } finally {
      setLoadingRecommendation(false);
    }
  };

  // Candidate Actions (Supabase)
  const handleAccept = async () => {
    const { supabase } = await import("@/lib/supabase")
    const { error } = await supabase
        .from('candidates')
        .update({ status: 'Accepted' })
        .eq('id', candidate.id)

    if (error) {
        toast.error("Failed to update status")
        return
    }

    setCandidate({ ...candidate, status: 'Accepted' });
    toast.success(`${candidate.name} has been accepted!`);
  };

  const handleReject = async () => {
    const { supabase } = await import("@/lib/supabase")
    const { error } = await supabase
        .from('candidates')
        .update({ status: 'Rejected' })
        .eq('id', candidate.id)

    if (error) {
        toast.error("Failed to update status")
        return
    }

    setCandidate({ ...candidate, status: 'Rejected' });
    toast.error(`${candidate.name} has been rejected`);
  };

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const { supabase } = await import("@/lib/supabase")
      
      // 1. Storage Cleanup - Extract filename from URL
      if (candidate.resume_url) {
        try {
          // Supabase public URL format: .../resumes/filename
          const urlParts = candidate.resume_url.split('/')
          const fileName = urlParts[urlParts.length - 1]
          
          if (fileName) {
            const { error: storageError } = await supabase.storage
              .from('resumes')
              .remove([fileName])
            
            if (storageError) {
              console.error("Storage deletion error:", storageError)
              // We continue even if storage fails to ensure DB is clean, 
              // but we log it.
            } else {
              console.log("✅ Storage file deleted:", fileName)
            }
          }
        } catch (storageErr) {
          console.error("Failed to parse storage URL:", storageErr)
        }
      }

      // 2. Database Deletion
      const { error } = await supabase
          .from('candidates')
          .delete()
          .eq('id', candidate.id)

      if (error) {
          throw error
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

  const score = candidate.score || 0
  const technical = candidate.analysis?.sub_scores?.technical || 0
  const experience = candidate.analysis?.sub_scores?.experience || 0
  const education = candidate.analysis?.sub_scores?.education || 0
  const softSkills = candidate.analysis?.sub_scores?.soft_skills || 0
  const culture = candidate.analysis?.sub_scores?.culture || 0

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

        const { supabase } = await import("@/lib/supabase")
        const mergedAnalysis = {
          ...candidate.analysis,
          interview_questions: updatedQuestions
        }

        const { error } = await supabase
          .from('candidates')
          .update({ analysis: mergedAnalysis })
          .eq('id', candidate.id)

        if (!error) {
          setCandidate(prev => ({
            ...prev,
            analysis: mergedAnalysis
          }))
          setAddonInput("")
          toast.success("Extra question added!")
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

  const handleDeepResearch = async () => {
    const url = prompt("Enter Portfolio or GitHub URL:")
    if (!url) return
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
        setLoadingResearch(true) // Keep research state until reset
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Profile & Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full mb-4 flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-primary/20 to-primary/5">
                {(candidate.name || "C").charAt(0)}
              </div>
              <CardTitle className="text-2xl">{candidate.name || "Unknown Candidate"}</CardTitle>
              <CardDescription>{candidate.role || "Applicant"}</CardDescription>
              <div className="flex justify-center gap-2 mt-4">
                <Badge>{candidate.status || "Pending"}</Badge>
                <Badge variant="outline">{candidate.extracted_data?.career_level || "Beginner"}</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
               <div className="flex flex-col gap-4">
                  <Button className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" size="lg">
                    <Mail className="h-4 w-4 mr-2" /> Contact Candidate
                  </Button>
                  
                  {/* Blind Mode Toggle */}
                  <div className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between ${isBlindMode ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-transparent hover:bg-muted/50'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isBlindMode ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                            {isBlindMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </div>
                        <div>
                            <p className="text-sm font-bold">Blind Screening</p>
                            <p className="text-[10px] text-muted-foreground">Remove bias from analysis</p>
                        </div>
                    </div>
                    <Button 
                        variant={isBlindMode ? "default" : "outline"} 
                        size="sm" 
                        className="h-8 rounded-full"
                        onClick={() => {
                            setIsBlindMode(!isBlindMode)
                            toast.info(isBlindMode ? "Blind Mode Deactivated" : "Blind Mode Activated: Analysis will be anonymized.")
                        }}
                    >
                        {isBlindMode ? "ON" : "OFF"}
                    </Button>
                  </div>
               </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" /> Resume
                </Button>
                <Button variant="outline">
                    <Copy className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Actions</p>
                <Button 
                  className="w-full" 
                  variant={candidate.status === 'Accepted' ? 'default' : 'outline'}
                  onClick={handleAccept}
                  disabled={candidate.status === 'Accepted'}
                >
                  <Check className="mr-2 h-4 w-4" /> Accept Candidate
                </Button>
                <Button 
                  className="w-full" 
                  variant={candidate.status === 'Rejected' ? 'destructive' : 'outline'}
                  onClick={handleReject}
                  disabled={candidate.status === 'Rejected'}
                >
                  <X className="mr-2 h-4 w-4" /> Reject Candidate
                </Button>
                <Button 
                  className="w-full" 
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>AI Analysis Settings</CardTitle>
                      <CardDescription>Choose an AI persona for evaluation</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2 p-1 bg-muted rounded-md mb-2">
                    {['expert', 'hacker', 'architect'].map((p) => (
                      <button 
                        key={p}
                        onClick={() => setSelectedPersona(p)}
                        className={`flex-1 px-2 py-1 text-xs rounded-sm transition-all capitalize ${selectedPersona === p ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  {!recommendation && !candidate.analysis?.recommendation && !loadingRecommendation && (
                    <Button size="sm" onClick={fetchRecommendation} className="w-full">
                        <Sparkles className="mr-2 h-4 w-4" /> Analyze as {selectedPersona === 'expert' ? 'Expert Auditor' : selectedPersona === 'hacker' ? 'Startup Hacker' : 'System Architect'}
                    </Button>
                  )}
                </div>
            </CardHeader>
            <CardContent>
              {loadingRecommendation ? (
                <div className="text-center py-4 space-y-2">
                  <div className="flex justify-center"><Bot className="h-8 w-8 text-primary animate-bounce" /></div>
                  <p className="text-sm text-muted-foreground italic">AI Brain is thinking...</p>
                </div>
              ) : (recommendation || candidate.analysis?.recommendation) ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={
                      (recommendation || candidate.analysis).recommendation === 'Strong Hire' ? 'bg-green-600' :
                      (recommendation || candidate.analysis).recommendation === 'Hire' ? 'bg-blue-600' :
                      (recommendation || candidate.analysis).recommendation === 'Maybe' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }>
                      {(recommendation || candidate.analysis).recommendation}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {(recommendation || candidate.analysis).confidence}% confident
                    </span>
                  </div>
                  <p className="text-sm">{(recommendation || candidate.analysis).reasoning}</p>
                  
                  {(recommendation || candidate.analysis).highlights && (recommendation || candidate.analysis).highlights.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Key Highlights:</p>
                      <ul className="text-sm space-y-1">
                        {(recommendation || candidate.analysis).highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(recommendation || candidate.analysis).red_flags && (recommendation || candidate.analysis).red_flags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Red Flags:</p>
                      <ul className="text-sm space-y-1">
                        {(recommendation || candidate.analysis).red_flags.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(recommendation || candidate.analysis).candidate_feedback && (
                    <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-sm font-semibold mb-2 flex items-center text-primary">
                        <Bot className="mr-2 h-4 w-4" /> Growth Focused Feedback
                      </p>
                      <p className="text-sm italic text-muted-foreground leading-relaxed">
                        "{(recommendation || candidate.analysis).candidate_feedback}"
                      </p>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-primary/10 flex items-center justify-between">
                    <div className="flex flex-col">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Rate this Analysis</p>
                        <p className="text-[8px] opacity-50">Helps AI learn your preferences</p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant={analysisRating === 'good' ? 'default' : 'outline'} 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={() => {
                                setAnalysisRating('good')
                                toast.success("Thanks! We'll keep this style.")
                            }}
                        >
                            <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button 
                            variant={analysisRating === 'bad' ? 'destructive' : 'outline'} 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full"
                            onClick={() => {
                                setAnalysisRating('bad')
                                toast.info("Feedback noted. Try regenerating with a different persona.")
                            }}
                        >
                            <ThumbsDown className="h-3 w-3" />
                        </Button>
                    </div>
                  </div>

                  <Button variant="ghost" size="sm" className="w-full mt-4 text-[10px] opacity-50 hover:opacity-100" onClick={fetchRecommendation}>
                    <RotateCcw className="mr-2 h-3 w-3" /> Force Regenerate
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 border-2 border-dashed rounded-lg">
                  <Bot className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground mb-4">Click below to generate an AI hiring recommendation based on the JD.</p>
                  <Button variant="secondary" size="sm" onClick={fetchRecommendation}>
                    Generate with AI
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Target Job Description */}
          <Card>
            <CardHeader>
              <CardTitle>Target Job Description</CardTitle>
              <CardDescription>JD used for this analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-40 text-sm italic text-muted-foreground whitespace-pre-wrap">
                {candidate.job_description || "No job description provided."}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Fairness Audit */}
          {(recommendation || candidate.analysis)?.fairness_audit && (
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <CardTitle className="text-lg">Fairness Audit</CardTitle>
                    </div>
                    <CardDescription>AI verification of claims & transparency</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Evidence Density</span>
                        <Badge variant="secondary" className="capitalize">
                            {(recommendation || candidate.analysis).fairness_audit.evidence_density}
                        </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Seniority Alignment</span>
                        <Badge variant="outline" className="capitalize">
                            {(recommendation || candidate.analysis).fairness_audit.seniority_alignment}
                        </Badge>
                    </div>
                    <div className="p-3 rounded bg-card border text-xs text-muted-foreground italic">
                        "{(recommendation || candidate.analysis).fairness_audit.notes}"
                    </div>
                </CardContent>
            </Card>
          )}

          {/* Consensus Reliability (Level 3) */}
          {(recommendation || candidate.analysis)?.consensus_metrics && (
                <Card className="border-primary/20 bg-primary/5 overflow-hidden">
                    <CardHeader className="py-3 px-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <CardTitle className="text-sm">Consensus Reliability</CardTitle>
                        </div>
                        <Badge variant={(recommendation || candidate.analysis).consensus_metrics.reliability === "High" ? "default" : "destructive"} className="text-[9px]">
                            {(recommendation || candidate.analysis).consensus_metrics.reliability}
                        </Badge>
                    </CardHeader>
                    <CardContent className="py-2 px-4 pb-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-muted-foreground">Gemini Vote</p>
                                <p className="text-lg font-black">{(recommendation || candidate.analysis).consensus_metrics.gemini_score}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] uppercase text-muted-foreground">Groq Vote</p>
                                <p className="text-lg font-black">{(recommendation || candidate.analysis).consensus_metrics.groq_score}</p>
                            </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-primary/10 flex items-center justify-between">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <AlertCircle className="h-3 w-3" /> Variance: {(recommendation || candidate.analysis).consensus_metrics.variance}%
                            </div>
                            <p className="text-[8px] italic opacity-50">Combined Llama 3 & Gemini insight</p>
                        </div>
                    </CardContent>
                </Card>
          )}

          {/* Score Analysis */}
          <Card>
            <CardHeader>
                <CardTitle>Score Analysis</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center py-6">
                    <div className="relative flex items-center justify-center h-32 w-32 rounded-full border-8 border-primary/20">
                        <span className="text-4xl font-bold">{score}%</span>
                        <svg className="absolute top-0 left-0 h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                             <circle
                                cx="50"
                                cy="50"
                                r="46"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray="290"
                                strokeDashoffset={290 - (290 * score) / 100} 
                                className="text-primary transition-all duration-1000 ease-out"
                             />
                        </svg>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span>Technical Skills</span>
                            <span className="font-bold">{technical}/100</span>
                        </div>
                        <Progress value={technical} className="h-2" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span>Experience Relevance</span>
                            <span className="font-bold">{experience}/100</span>
                        </div>
                        <Progress value={experience} className="h-2" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span>Education</span>
                            <span className="font-bold">{education}/100</span>
                        </div>
                        <Progress value={education} className="h-2" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span>Soft Skills</span>
                            <span className="font-bold">{softSkills}/100</span>
                        </div>
                        <Progress value={softSkills} className="h-2" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span>Culture Alignment</span>
                            <span className="font-bold">{culture}/100</span>
                        </div>
                        <Progress value={culture} className="h-2" />
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Analysis */}
        <div className="md:col-span-2 space-y-6">
            <Card className="h-full flex flex-col border-none shadow-none bg-transparent">
                <Tabs defaultValue="report" className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <TabsList>
                            <TabsTrigger value="report">Assessment</TabsTrigger>
                            <TabsTrigger value="interview" className="flex items-center gap-2">
                                <Brain className="h-4 w-4" /> Interview
                            </TabsTrigger>
                            <TabsTrigger value="ghost" className="flex items-center gap-2">
                                <Bot className="h-4 w-4" /> Ghost Chat
                            </TabsTrigger>
                            <TabsTrigger value="outreach" className="flex items-center gap-2">
                                <Send className="h-4 w-4" /> Outreach
                            </TabsTrigger>
                            <TabsTrigger value="intelligence" className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" /> Intelligence
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="report" className="flex-1 mt-0">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>AI Assessment Report</CardTitle>
                                <CardDescription>Generated by Gemini Pro Vision</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center">
                                        <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
                                        Key Strengths
                                    </h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                                        {(recommendation || candidate.analysis)?.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center">
                                        <XCircle className="mr-2 h-5 w-5 text-red-500" />
                                        Potential Gaps
                                    </h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                                        {(recommendation || candidate.analysis)?.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>

                                <Separator />

                                {candidate.extracted_data?.projects && candidate.extracted_data.projects.length > 0 && (
                                    <>
                                        <div>
                                            <h3 className="font-semibold mb-4 flex items-center">
                                                <Bot className="mr-2 h-5 w-5 text-primary" />
                                                Extracted Projects
                                            </h3>
                                            <div className="grid gap-4">
                                                {candidate.extracted_data.projects.map((p, i) => (
                                                    <div key={i} className="p-3 rounded-lg border bg-muted/30">
                                                        <p className="font-medium text-sm">{p.title}</p>
                                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                                                        {p.technologies && (
                                                            <div className="flex flex-wrap gap-1 mt-2">
                                                                {Array.isArray(p.technologies) ? p.technologies.map((t, ti) => (
                                                                    <Badge key={ti} variant="outline" className="text-[10px] py-0 px-1">{t}</Badge>
                                                                )) : <Badge variant="outline" className="text-[10px] py-0 px-1">{p.technologies}</Badge>}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <Separator />
                                    </>
                                )}

                                {candidate.extracted_data?.experience && Array.isArray(candidate.extracted_data.experience) && candidate.extracted_data.experience.length > 0 && (
                                    <>
                                        <div>
                                            <h3 className="font-semibold mb-4 flex items-center">
                                                <CheckCircle2 className="mr-2 h-5 w-5 text-primary" />
                                                Work Experience
                                            </h3>
                                            <div className="space-y-4">
                                                {candidate.extracted_data.experience.map((exp, i) => (
                                                    <div key={i} className="border-l-2 border-primary/20 pl-4 py-1">
                                                        <div className="flex justify-between items-start">
                                                            <p className="font-medium text-sm">{exp.role}</p>
                                                            <span className="text-[10px] text-muted-foreground">{exp.duration}</span>
                                                        </div>
                                                        <p className="text-xs text-primary font-medium">{exp.company}</p>
                                                        {exp.key_points && (
                                                            <ul className="mt-2 space-y-1">
                                                                {Array.isArray(exp.key_points) ? exp.key_points.map((pt, pi) => (
                                                                    <li key={pi} className="text-xs text-muted-foreground">• {pt}</li>
                                                                )) : <li className="text-xs text-muted-foreground">• {exp.key_points}</li>}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <Separator />
                                    </>
                                )}

                                {(recommendation || candidate.analysis)?.career_projection && (
                                    <>
                                        <div>
                                            <h3 className="font-semibold mb-4 flex items-center">
                                                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                                                Career Trajectory Projection
                                            </h3>
                                            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium">Growth Velocity:</span>
                                                    <Badge variant="secondary" className="capitalize">{(recommendation || candidate.analysis).career_projection.trajectory}</Badge>
                                                </div>
                                                <div className="text-sm mb-3">
                                                    <span className="font-medium">Potential Next Role:</span>
                                                    <p className="text-primary mt-1">{(recommendation || candidate.analysis).career_projection.potential_role}</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Growth Focus Areas:</span>
                                                    <div className="flex flex-wrap gap-2 pt-1">
                                                        {(recommendation || candidate.analysis).career_projection.growth_areas.map((area, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-[10px]">{area}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <Separator />
                                    </>
                                )}

                                <div>
                                    <h3 className="font-semibold mb-4">Skill Match Visualization</h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                                <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} />
                                                <Tooltip 
                                                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                                                  cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                                                />
                                                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
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
                                {(recommendation || candidate.analysis)?.interview_questions ? (
                                    <div className="grid gap-4">
                                        {(recommendation || candidate.analysis).interview_questions
                                            .filter(q => (q.round || 'Technical') === interviewRound && q.question?.trim())
                                            .map((q, i) => (
                                                <div key={i} className="p-4 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                                                    <p className="font-medium text-sm text-foreground leading-relaxed">
                                                        <span className="text-primary mr-2">Q{i+1}:</span>
                                                        {q.question}
                                                    </p>
                                                    <div className="mt-3 p-3 rounded bg-background/50 border border-dashed border-primary/20">
                                                        <p className="text-xs font-semibold text-primary/70 uppercase tracking-tighter mb-1">Look for in the answer:</p>
                                                        <p className="text-xs text-muted-foreground italic leading-relaxed">
                                                            {q.expected_answer}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        {(recommendation || candidate.analysis).interview_questions.filter(q => (q.round || 'Technical') === interviewRound && q.question?.trim()).length === 0 && (
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

                    <TabsContent value="ghost" className="flex-1 mt-0 h-full">
                        <Card className="h-[600px] flex flex-col border-primary/20 bg-primary/[0.02]">
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

                    <TabsContent value="intelligence" className="flex-1 mt-0">
                        <div className="grid gap-6">
                            {/* Research & Salary */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="border-primary/20">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Github className="h-5 w-5" />
                                            <CardTitle className="text-lg">Portfolio Research</CardTitle>
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
                                                    <span className="text-sm font-medium">Technical Depth:</span>
                                                    <Badge variant="secondary">{researchData.depth_score}/100</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 pl-3">"{researchData.assessment}"</p>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Proficiency Markers:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {researchData.proficiency_markers.map((m, i) => (
                                                            <Badge key={i} variant="outline" className="text-[9px]">{m}</Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="outline" className="w-full" onClick={handleDeepResearch}>New Search</Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-primary/20">
                                    <CardHeader>
                                        <div className="flex items-center gap-2">
                                            <Coins className="h-5 w-5 text-yellow-500" />
                                            <CardTitle className="text-lg">Salary Forecast</CardTitle>
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
                                                    <p className="text-2xl font-bold text-primary">{salaryData.range.mid}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">{salaryData.range.low} - {salaryData.range.high} ({salaryData.currency})</p>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Leverage Points:</p>
                                                    <ul className="text-xs space-y-1">
                                                        {salaryData.leverage_points.map((p, i) => (
                                                            <li key={i} className="flex items-center gap-2">
                                                                <div className="h-1 w-1 rounded-full bg-primary" /> {p}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <Button size="sm" variant="outline" className="w-full" onClick={handlePredictSalary}>Recalculate</Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Interview Video Intelligence */}
                            <Card className="border-primary/20">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <MonitorPlay className="h-5 w-5 text-purple-500" />
                                        <CardTitle className="text-lg">Interview Video Intelligence</CardTitle>
                                    </div>
                                    <CardDescription>Analyze transcripts for technical accuracy and sentiment.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {!analysisVideo ? (
                                        <div className="space-y-4">
                                            <textarea 
                                                className="w-full h-32 p-3 text-sm bg-muted/30 rounded-lg border border-dashed resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                                                placeholder="Paste the Zoom/Meet transcript here..."
                                                value={videoTranscript}
                                                onChange={(e) => setVideoTranscript(e.target.value)}
                                            />
                                            <Button className="w-full" onClick={handleVideoAnalysis} disabled={loadingVideo || !videoTranscript.trim()}>
                                                {loadingVideo ? <RotateCcw className="h-4 w-4 animate-spin mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                                                Analyze Interview Sentiment
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">Technical Accuracy</span>
                                                    <Badge variant="secondary">{analysisVideo.technical_score}%</Badge>
                                                </div>
                                                <Progress value={analysisVideo.technical_score} className="h-2" />
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">Confidence & Vibe</span>
                                                    <Badge variant="outline" className="capitalize">{analysisVideo.vibe}</Badge>
                                                </div>
                                                <Progress value={analysisVideo.sentiment_score} className="h-2" />
                                            </div>
                                            <div className="space-y-3">
                                                <p className="text-[10px] font-bold uppercase text-red-500">Red Flags:</p>
                                                {analysisVideo.red_flags.length > 0 ? (
                                                    <ul className="text-xs space-y-1">
                                                        {analysisVideo.red_flags.map((f, i) => <li key={i} className="text-red-600">• {f}</li>)}
                                                    </ul>
                                                ) : <p className="text-xs italic text-muted-foreground">None detected</p>}
                                                <p className="text-[10px] font-bold uppercase text-green-500 mt-4">Golden Nuggets:</p>
                                                <ul className="text-xs space-y-1">
                                                    {analysisVideo.golden_nuggets.map((n, i) => <li key={i} className="text-green-600">• {n}</li>)}
                                                </ul>
                                            </div>
                                            <Button size="sm" variant="outline" className="md:col-span-2" onClick={() => setAnalysisVideo(null)}>New Analysis</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Role Architect */}
                            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/30">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                        <CardTitle className="text-lg">AI Role Architect</CardTitle>
                                    </div>
                                    <CardDescription>If they are not a fit for this role, what role SHOULD they be in?</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {!roleArchitectData ? (
                                        <Button className="w-full bg-primary/20 hover:bg-primary/30 border-primary/30 text-primary" onClick={handleRoleArchitect} disabled={loadingRoleArchitect}>
                                            {loadingRoleArchitect ? <RotateCcw className="h-4 w-4 animate-spin mr-2" /> : "Architect Alternative Path"}
                                        </Button>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in zoom-in-95">
                                            <div className="p-4 bg-background/80 rounded-xl border border-primary/20 shadow-xl">
                                                <p className="text-xs font-bold text-primary uppercase mb-1">Proposed High-Impact Role:</p>
                                                <p className="text-xl font-black">{roleArchitectData.proposed_role}</p>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4 text-xs">
                                                <div className="space-y-2">
                                                    <p className="font-bold uppercase text-muted-foreground">Hidden Superpowers:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {roleArchitectData.superpowers.map((s, i) => <Badge key={i} variant="outline" className="text-[9px]">{s}</Badge>)}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="font-bold uppercase text-muted-foreground">90-Day Milestones:</p>
                                                    <ul className="space-y-1">
                                                        {roleArchitectData.milestones.map((m, i) => <li key={i} className="flex gap-2"><div className="w-1 h-1 rounded-full bg-primary mt-1.5" /> {m}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                            <p className="text-xs italic text-muted-foreground border-t pt-4">Rationale: {roleArchitectData.pivot_rationale}</p>
                                            <Button size="sm" variant="ghost" className="w-full" onClick={() => setRoleArchitectData(null)}>Reset Architecture</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Culture Radar & Onboarding */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <Card className="border-primary/20">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Target className="h-5 w-5 text-primary" /> Culture Radar
                                        </CardTitle>
                                        <CardDescription>Alignment with priority company values.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="h-[300px]">
                                        {candidate.analysis?.culture_radar ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={candidate.analysis.culture_radar}>
                                                    <PolarGrid stroke="#333" />
                                                    <PolarAngleAxis dataKey="value" tick={{ fill: "#888", fontSize: 10 }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                                    <Radar
                                                        name={candidate.name}
                                                        dataKey="score"
                                                        stroke="var(--primary)"
                                                        fill="var(--primary)"
                                                        fillOpacity={0.6}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                                                <Target className="h-10 w-10 mb-2" />
                                                <p className="text-xs italic">Re-run analysis to generate culture data</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card className="border-primary/20 bg-primary/[0.01]">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Rocket className="h-5 w-5 text-primary" /> Success Roadmap
                                        </CardTitle>
                                        <CardDescription>AI-generated 30-60-90 day onboarding plan.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {!onboardingData ? (
                                            <div className="space-y-4">
                                                <p className="text-xs text-muted-foreground">Architect a personalized success path for {candidate.name} before extending the offer.</p>
                                                <Button className="w-full" onClick={handleGenerateOnboarding} disabled={loadingOnboarding}>
                                                    {loadingOnboarding ? <RotateCcw className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
                                                    Architect 30-60-90 Day Plan
                                                </Button>
                                            </div>
                                        ) : (
                                            <ScrollArea className="h-[350px] pr-4">
                                                <div className="space-y-6">
                                                    {onboardingData.phases.map((phase, idx) => (
                                                        <div key={idx} className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <Badge className="rounded-sm">{phase.period}</Badge>
                                                                <span className="text-xs font-bold uppercase">{phase.focus}</span>
                                                            </div>
                                                            <ul className="space-y-1 pl-4 border-l border-primary/20">
                                                                {phase.milestones.map((m, i) => (
                                                                    <li key={i} className="text-[11px] text-muted-foreground">• {m}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                    <div className="pt-4 border-t border-primary/10">
                                                        <p className="text-[10px] font-black uppercase text-primary mb-2">Friction Mitigation:</p>
                                                        {onboardingData.friction_mitigation.map((f, i) => (
                                                            <div key={i} className="mb-2 p-2 rounded bg-red-500/5 border border-red-500/10 text-[10px]">
                                                                <span className="font-bold text-red-400">RISK: {f.risk}</span>
                                                                <p className="mt-1">{f.solution}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </ScrollArea>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>
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
    </AppShell>
  )
}
