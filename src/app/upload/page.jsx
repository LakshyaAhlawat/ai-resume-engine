"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { UploadCloud, File, X, Info } from "lucide-react"

import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const [jobDescription, setJobDescription] = useState("")
  const [roleTitle, setRoleTitle] = useState("")

  const router = useRouter()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const onFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size, originalFile: f }))
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files).map(f => ({ name: f.name, size: f.size, originalFile: f }))
      setFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleFileSelect = () => {
    document.getElementById('hidden-file-input').click()
  }

  const startAnalysis = async () => {
    if (files.length === 0) return
    setIsAnalyzing(true)

    try {
        // 1. Mock Upload & Parsing
        const formData = new FormData()
        formData.append('file', files[0].originalFile) // Taking first file for demo
        
        const parseRes = await fetch('/api/parsing', { method: 'POST', body: formData })
        
        if (!parseRes.ok) {
            throw new Error(`Parsing failed: ${parseRes.statusText}`)
        }

        const parseData = await parseRes.json()
        
        if (parseData.error || !parseData.parsed_data) {
             throw new Error(parseData.error || "Failed to extract data from resume")
        }

        // 2. Mock Scoring
        const scoreRes = await fetch('/api/scoring', { 
            method: 'POST', 
            body: JSON.stringify({ jd: "Mock JD", candidate_data: parseData }) 
        })
        
        if (!scoreRes.ok) {
             throw new Error("Scoring failed")
        }

        const scoreData = await scoreRes.json()

        // 3. Upload to Supabase Storage
        const { supabase } = await import("@/lib/supabase")
        const file = files[0].originalFile
        const fileName = `${Math.random().toString(36).substr(2, 9)}-${file.name}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(fileName, file)

        if (uploadError) {
            console.error("Upload error details:", uploadError)
            throw new Error(`Resume upload failed: ${uploadError.message}. Make sure the 'resumes' bucket is created and set to public in Supabase Storage.`)
        }

        const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(fileName)

        // 4. Create Candidate Object & Save to Database
        const newCandidate = {
            name: parseData.parsed_data.name || "Uploaded Candidate",
            email: parseData.parsed_data.email || "N/A",
            role: roleTitle || "Full Stack Engineer",
            job_description: jobDescription || "No job description provided",
            score: parseFloat(scoreData.score) || 0,
            status: "Review",
            analysis: {
                ...scoreData.analysis,
                sub_scores: scoreData.sub_scores || { technical: 0, experience: 0, education: 0 }
            },
            extracted_data: parseData.parsed_data,
            resume_url: publicUrl,
            resume_name: file.name
        }

        const { data: insertedData, error: insertError } = await supabase
            .from('candidates')
            .insert([newCandidate])
            .select()

        if (insertError) {
            console.error("Database insert error:", insertError)
            throw new Error(`Failed to save candidate: ${insertError.message}. Make sure the 'candidates' table is created.`)
        }
        
        const savedCandidate = insertedData[0]
        toast.success("Resume analyzed and saved successfully!")

        // 5. Redirect
        router.push(`/candidates/${savedCandidate.id}`)

    } catch (error) {
        console.error("Analysis failed", error)
        toast.error(error.message || "An error occurred during analysis")
    } finally {
        setIsAnalyzing(false)
    }
  }

  return (
    <AppShell title="Upload Resumes">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 h-full">
        <div className="col-span-2 space-y-6">
          <input 
            type="file" 
            id="hidden-file-input" 
            className="hidden" 
            multiple 
            onChange={onFileInputChange} 
            accept=".pdf,.docx,.doc"
          />
          <Card className="border-dashed border-2 transition-colors data-[active=true]:border-primary data-[active=true]:bg-primary/5" data-active={dragActive}>
            <CardContent
              className="flex flex-col items-center justify-center py-10 md:py-16 text-center cursor-pointer"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={handleFileSelect}
            >
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6 ring-4 ring-card transition-all">
                <UploadCloud className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Drag & Drop Resumes Here</h3>
              <p className="text-muted-foreground max-w-xs mb-6">
                PDF, DOCX supported. Upload multiple files to screen bulk candidates.
              </p>
              <Button onClick={(e) => { e.stopPropagation(); handleFileSelect() }}>Select Files</Button>
            </CardContent>
          </Card>

          {files.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Uploaded Files ({files.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
                            <div className="flex items-center gap-3">
                                <File className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setFiles(files.filter((_, i) => i !== idx))}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>Paste the JD to evaluate candidates against.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">Role Title</Label>
                <input
                     id="role"
                     className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     placeholder="e.g. Senior Product Designer"
                     value={roleTitle}
                     onChange={(e) => setRoleTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jd">Job Details</Label>
                <Textarea
                  id="jd"
                  placeholder="Paste JD requirements, skills, and qualifications here..."
                  className="min-h-[300px] resize-none"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
              <Button className="w-full" size="lg" onClick={startAnalysis} disabled={isAnalyzing || files.length === 0}>
                {isAnalyzing ? "Analyzing..." : "Start Analysis"}
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-500/10 border-blue-500/20">
            <CardContent className="pt-6">
                <div className="flex gap-4">
                    <Info className="h-6 w-6 text-blue-400 shrink-0" />
                    <div className="space-y-1">
                        <h4 className="font-semibold text-blue-400">Pro Tip</h4>
                        <p className="text-sm text-blue-400/80">
                            Detailed JDs yield better scoring accuracy. Include years of experience and specific technical skills.
                        </p>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}
