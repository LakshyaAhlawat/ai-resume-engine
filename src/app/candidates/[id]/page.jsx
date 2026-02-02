"use client"
import { useState, useEffect } from "react"

import { useParams, useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle, Download, Mail, Copy, ChevronLeft, Send, Bot, User, Trash2, Check, X } from "lucide-react"
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
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          candidate, 
          jobDescription: candidate.job_description || "Full Stack Engineer" 
        })
      });
      const data = await res.json();
      setRecommendation(data);
      toast.success("AI Recommendation generated!");
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>AI Recommendation</CardTitle>
                  <CardDescription>Intelligent hiring suggestion</CardDescription>
                </div>
                {!recommendation && !loadingRecommendation && (
                  <Button size="sm" onClick={fetchRecommendation}>
                    <Bot className="mr-2 h-4 w-4" /> Generate
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
              ) : recommendation ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={
                      recommendation.recommendation === 'Strong Hire' ? 'bg-green-600' :
                      recommendation.recommendation === 'Hire' ? 'bg-blue-600' :
                      recommendation.recommendation === 'Maybe' ? 'bg-yellow-600' :
                      'bg-red-600'
                    }>
                      {recommendation.recommendation}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {recommendation.confidence}% confident
                    </span>
                  </div>
                  <p className="text-sm">{recommendation.reasoning}</p>
                  
                  {recommendation.highlights && recommendation.highlights.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Key Highlights:</p>
                      <ul className="text-sm space-y-1">
                        {recommendation.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recommendation.red_flags && recommendation.red_flags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Red Flags:</p>
                      <ul className="text-sm space-y-1">
                        {recommendation.red_flags.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={fetchRecommendation}>
                    Regenerate Analysis
                  </Button>

                  {recommendation.candidate_feedback && (
                    <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-sm font-semibold mb-2 flex items-center text-primary">
                        <Bot className="mr-2 h-4 w-4" /> Growth Focused Feedback
                      </p>
                      <p className="text-sm italic text-muted-foreground leading-relaxed">
                        "{recommendation.candidate_feedback}"
                      </p>
                    </div>
                  )}
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
          {candidate.analysis?.fairness_audit && (
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
                            {candidate.analysis.fairness_audit.evidence_density}
                        </Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Seniority Alignment</span>
                        <Badge variant="outline" className="capitalize">
                            {candidate.analysis.fairness_audit.seniority_alignment}
                        </Badge>
                    </div>
                    <div className="p-3 rounded bg-card border text-xs text-muted-foreground italic">
                        "{candidate.analysis.fairness_audit.notes}"
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
                            <TabsTrigger value="report">AI Report</TabsTrigger>
                            <TabsTrigger value="chat" className="flex items-center gap-2">
                                <Bot className="h-4 w-4" /> Chat with Candidate
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
                                        {candidate.analysis?.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="font-semibold mb-3 flex items-center">
                                        <XCircle className="mr-2 h-5 w-5 text-red-500" />
                                        Potential Gaps
                                    </h3>
                                    <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                                        {candidate.analysis?.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
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
