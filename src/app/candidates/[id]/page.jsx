"use client"
import { useState, useEffect } from "react"

import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle, Download, Mail, Copy, ChevronLeft, Send, Bot, User, Trash2, Check, X, TrendingUp, Sparkles, Brain, LayoutGrid, RotateCcw, Plus } from "lucide-react"
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
          candidate_data: candidate, 
          jd: candidate.job_description || "Full Stack Engineer",
          persona: selectedPersona
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
              <Button className="w-full">
                <Mail className="mr-2 h-4 w-4" /> Contact Candidate
              </Button>
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

                  <Button variant="outline" size="sm" className="w-full mt-4" onClick={fetchRecommendation}>
                    <RotateCcw className="mr-2 h-3 w-3" /> Regenerate Analysis
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
                                <Brain className="h-4 w-4" /> Interview Simulator
                            </TabsTrigger>
                            <TabsTrigger value="chat" className="flex items-center gap-2">
                                <Bot className="h-4 w-4" /> AI Chat
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

                    <TabsContent value="chat" className="flex-1 mt-0 h-full">
                        <Card className="h-[600px] flex flex-col">
                            <CardHeader>
                                <CardTitle>Chat Assistant</CardTitle>
                                <CardDescription>Ask questions about {candidate.name}'s profile.</CardDescription>
                            </CardHeader>
                    <CardContent className="flex-1 flex flex-col min-h-0 p-4">
                                <ScrollArea className="flex-1 pr-4 mb-4">
                                    <div className="flex flex-col gap-4 pb-4">
                                        {chatMessages.map((msg, i) => (
                                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                {msg.role === 'assistant' && (
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <Bot className="h-5 w-5 text-primary" />
                                                    </div>
                                                )}
                                                <div className={`rounded-lg p-3 max-w-[85%] text-sm break-words whitespace-pre-wrap shadow-sm ${
                                                    msg.role === 'user' 
                                                        ? 'bg-primary text-primary-foreground ml-auto' 
                                                        : 'bg-muted mr-auto'
                                                }`}>
                                                    {msg.content}
                                                </div>
                                                {msg.role === 'user' && (
                                                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                        <User className="h-5 w-5 text-secondary-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {chatLoading && (
                                            <div className="flex gap-3 justify-start">
                                                 <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <Bot className="h-5 w-5 text-primary" />
                                                 </div>
                                                 <div className="bg-muted rounded-lg p-3 text-sm animate-pulse">
                                                    Thinking...
                                                 </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                                <div className="flex gap-2 pt-2 border-t mt-auto">
                                    <Input 
                                        placeholder="Ask about experience, skills, etc..." 
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        className="flex-1"
                                    />
                                    <Button onClick={handleSendMessage} disabled={chatLoading} size="icon">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
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
