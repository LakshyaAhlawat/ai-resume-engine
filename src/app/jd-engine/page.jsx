
"use client"
import { useState } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Copy, FileText, Send, RotateCcw, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export default function JDEnginePage() {
  const [formData, setFormData] = useState({
    role_title: "",
    key_requirements: "",
    company_context: "",
    tone: "modern"
  })
  const [loading, setLoading] = useState(false)
  const [jdData, setJDData] = useState(null)

  const handleGenerate = async () => {
    if (!formData.role_title) {
        toast.error("Please enter a role title")
        return
    }
    setLoading(true)
    try {
        const res = await fetch('/api/generate/jd', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        const data = await res.json()
        setJDData(data)
        toast.success("AI JD Architected!")
    } catch (err) {
        toast.error("Generation failed")
    } finally {
        setLoading(false)
    }
  }

  return (
    <AppShell title="AI JD Engine">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Input Panel */}
        <Card className="border-primary/20 bg-primary/[0.01]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>JD Architect</CardTitle>
            </div>
            <CardDescription>Provide the core details and let AI handle the heavy lifting.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Role Title</label>
              <Input 
                placeholder="e.g., Senior Full Stack Engineer" 
                value={formData.role_title}
                onChange={(e) => setFormData(prev => ({ ...prev, role_title: e.target.value }))}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Key Requirements (Bullet points)</label>
              <Textarea 
                placeholder="e.g., 5+ years React, Node.js, Experience with AWS..."
                className="h-32 bg-background resize-none"
                value={formData.key_requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, key_requirements: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Company Context / Culture</label>
              <Input 
                placeholder="e.g., Series A Fintech startup, Remote-first, Velocity-focused" 
                value={formData.company_context}
                onChange={(e) => setFormData(prev => ({ ...prev, company_context: e.target.value }))}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">Tone</label>
              <div className="flex gap-2 p-1 bg-muted rounded-lg">
                {['modern', 'robust', 'scrappy', 'corporate'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFormData(prev => ({ ...prev, tone: t }))}
                    className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${formData.tone === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={handleGenerate} disabled={loading}>
              {loading ? <RotateCcw className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
              {jdData ? "Re-Architect JD" : "Build Premium JD"}
            </Button>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <div className="space-y-6">
          {!jdData && !loading && (
             <div className="h-full flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-10 text-center opacity-40">
                <FileText className="h-16 w-16 mb-4 text-primary" />
                <p className="text-lg font-medium">Your AI-generated JD will appear here.</p>
                <p className="text-sm">Complete the form to start architecting.</p>
             </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center space-y-4 py-32">
                 <div className="relative">
                    <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 animate-pulse" />
                 </div>
                 <p className="text-lg font-bold animate-pulse">Architecting your JD...</p>
                 <p className="text-xs text-muted-foreground italic">Optimizing for ATS and engagement...</p>
            </div>
          )}

          {jdData && !loading && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-700">
               <Card className="border-primary/30 shadow-2xl overflow-hidden">
                  <CardHeader className="bg-primary/5 border-b border-primary/10 flex flex-row items-center justify-between">
                     <div>
                        <CardTitle className="text-xl">Generated Design</CardTitle>
                        <CardDescription>Ready for your careers page.</CardDescription>
                     </div>
                     <Button variant="ghost" size="sm" onClick={() => {
                        const summary = jdData?.summary || "";
                        const resp = jdData?.responsibilities?.join('\n') || "";
                        const tech = jdData?.required_skills?.technical?.join(', ') || "";
                        const text = `${summary}\n\nRESONSIBILITIES:\n${resp}\n\nSKILLS:\n${tech}`;
                        navigator.clipboard.writeText(text);
                        toast.success("JD copied to clipboard!");
                     }}>
                        <Copy className="h-4 w-4 mr-2" /> Copy All
                     </Button>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8 max-h-[700px] overflow-auto">
                     <div className="space-y-4">
                        <h2 className="text-3xl font-black tracking-tight">{formData.role_title}</h2>
                        <p className="text-lg text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4">
                           "{jdData.summary}"
                        </p>
                     </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Core Responsibilities</h3>
                        <ul className="space-y-3">
                           {(jdData?.responsibilities || []).map((r, i) => (
                              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                                 <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                 {r}
                              </li>
                           ))}
                        </ul>
                     </div>

                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Technical Stack</h3>
                           <div className="flex flex-wrap gap-2">
                              {(jdData?.required_skills?.technical || []).map((s, i) => <Badge key={i} variant="secondary">{s}</Badge>)}
                           </div>
                        </div>
                        <div className="space-y-4">
                           <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Soft Skills</h3>
                           <div className="flex flex-wrap gap-2">
                              {(jdData?.required_skills?.soft || []).map((s, i) => <Badge key={i} variant="outline">{s}</Badge>)}
                           </div>
                        </div>
                     </div>

                      <div className="space-y-4 pt-4 border-t border-primary/10">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-primary">Success Markers</h3>
                        <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
                            {(jdData?.preferred || []).map((p, i) => (
                                <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="h-3 w-3 text-green-500" /> {p}
                                </li>
                            ))}
                        </ul>
                     </div>

                     <div className="p-6 rounded-2xl bg-muted/50 border italic text-sm text-center">
                        {jdData.about_company}
                     </div>
                  </CardContent>
               </Card>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
