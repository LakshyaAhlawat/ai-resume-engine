"use client"
import { useState, useEffect } from "react"

import { useParams } from "next/navigation"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle, Download, Mail, Copy, ChevronLeft, Send, Bot, User } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
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
        const initialMsg = [{ role: "assistant", content: "Hi! I'm your AI assistant. Ask me anything about this candidate's experience or skills." }]
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
        setChatMessages(prev => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }])
    } finally {
        setChatLoading(false)
    }
  }
  
  useEffect(() => {
    // Try finding in local storage first
    const stored = JSON.parse(localStorage.getItem('resume_ai_candidates') || '[]')
    const found = stored.find(c => c.id === params.id)
    
    if (found) {
        setCandidate(found)
    } else {
        // Fallback or static defaults (mock)
        if (params.id === "1") {
             setCandidate({
                name: "Alex Johnson",
                role: "Senior Frontend Engineer",
                status: "Shortlisted",
                score: 92,
                analysis: {
                    strengths: ["React architecture", "Leadership metrics"],
                    weaknesses: ["Cloud Infra gaps"]
                },
                skills: { technical: 95, experience: 88, education: 90 }
             })
        } else {
            // Generic fallback for demo
             setCandidate({
                name: "Candidate Details",
                role: "Applicant",
                status: "Review",
                score: 75,
                analysis: {
                    strengths: ["General competence"],
                    weaknesses: ["Specifics unclear"]
                },
                skills: { technical: 70, experience: 75, education: 80 }
             })
        }
    }
  }, [params.id])

  if (!candidate) return <AppShell title="Loading..."><div className="p-10 text-center">Loading candidate profile...</div></AppShell>

  const score = candidate.score || 0
  const technical = candidate.skills?.technical || 0
  const experience = candidate.skills?.experience || 0
  const education = candidate.skills?.education || 0

  const chartData = [
      { name: "Technical", score: technical },
      { name: "Experience", score: experience },
      { name: "Education", score: education },
      { name: "Soft Skills", score: 85 }, // Mock
      { name: "Culture", score: 80 }, // Mock
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
                <Badge variant="outline">5 Yrs Exp</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Button className="w-full">
                <Mail className="mr-2 h-4 w-4" /> Contact Candidate
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="flex-1" onClick={() => {
                  // Download resume from localStorage
                  const candidates = JSON.parse(localStorage.getItem('resume_ai_candidates') || '[]')
                  const fullCandidate = candidates.find(c => c.id === candidate.id)
                  if (fullCandidate?.resumeFile) {
                    const link = document.createElement('a')
                    link.href = fullCandidate.resumeFile
                    link.download = fullCandidate.filename || 'resume.pdf'
                    link.click()
                  } else {
                    alert('Resume file not available for download')
                  }
                }}>
                    <Download className="mr-2 h-4 w-4" /> Resume
                </Button>
                <Button variant="outline">
                    <Copy className="mr-2 h-4 w-4" /> Share
                </Button>
              </div>
            </CardContent>
          </Card>

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
                            <CardContent className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
                                <ScrollArea className="h-[450px] pr-4">
                                    <div className="flex flex-col gap-4">
                                        {chatMessages.map((msg, i) => (
                                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                {msg.role === 'assistant' && (
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                        <Bot className="h-5 w-5 text-primary" />
                                                    </div>
                                                )}
                                                <div className={`rounded-lg p-3 max-w-[80%] text-sm break-words whitespace-pre-wrap ${
                                                    msg.role === 'user' 
                                                        ? 'bg-primary text-primary-foreground' 
                                                        : 'bg-muted'
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
                                <div className="flex gap-2 pt-2">
                                    <Input 
                                        placeholder="Ask about experience, skills, etc..." 
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <Button onClick={handleSendMessage} disabled={chatLoading}>
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
    </AppShell>
  )
}
