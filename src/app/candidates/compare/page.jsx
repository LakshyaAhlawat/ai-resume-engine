"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Swords, ChevronLeft, TrendingUp, Trophy, AlertTriangle, CheckCircle2, LayoutGrid, Brain, ShieldCheck, Zap } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ComparePage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const ids = searchParams.get('ids')?.split(',') || []
    const multitask = searchParams.get('multitask') === 'true'
    
    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(true)
    const [batchInsight, setBatchInsight] = useState(null)
    const [loadingInsight, setLoadingInsight] = useState(false)

    useEffect(() => {
        const fetchCandidates = async () => {
            if (ids.length < 2) {
                toast.error("Comparison requires at least 2 candidates")
                router.push('/candidates')
                return
            }

            setLoading(true)
            try {
                const { supabase } = await import("@/lib/supabase")
                const { data, error } = await supabase
                    .from('candidates')
                    .select('*')
                    .in('id', ids)
                
                if (error) throw error
                setCandidates(data || [])
            } catch (err) {
                console.error("Fetch error:", err)
                toast.error("Failed to load candidates for comparison")
            } finally {
                setLoading(false)
            }
        }
        fetchCandidates()
    }, [searchParams])

    const generateBatchInsight = async () => {
        setLoadingInsight(true)
        try {
            const res = await fetch('/api/scoring/batch', {
                method: 'POST',
                body: JSON.stringify({ candidates })
            })
            const data = await res.json()
            setBatchInsight(data)
        } catch (err) {
            toast.error("Failed to generate batch intelligence")
        } finally {
            setLoadingInsight(false)
        }
    }

    if (loading) return <AppShell title="Syncing Intelligence..."><div className="p-10 text-center">Assembling the Multi-Candidate Matrix...</div></AppShell>
    if (candidates.length < 2) return <AppShell title="Error"><div className="p-10 text-center text-destructive">Matrix requires at least 2 candidates.</div></AppShell>

    const gridCols = candidates.length === 2 ? 'lg:grid-cols-2' : candidates.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'

    return (
        <AppShell title="Multi-Candidate Intelligence Matrix">
            <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/candidates" className="flex items-center text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Pipeline
                    </Link>
                </Button>
                <div className="flex gap-2">
                    <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5">
                        <LayoutGrid className="mr-2 h-4 w-4 text-primary" />
                        Batch Analytics Mode
                    </Badge>
                    {multitask && (
                        <Badge variant="secondary" className="px-4 py-1 bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                            <Zap className="mr-2 h-3 w-3" /> Multitask Enabled
                        </Badge>
                    )}
                </div>
            </div>

            {/* Batch Insight Generator */}
            {!batchInsight && (
                <Card className="mb-8 border-dashed border-primary/40 bg-primary/5">
                    <CardContent className="p-8 text-center flex flex-col items-center gap-4">
                        <div className="p-4 rounded-full bg-primary/20">
                            <Brain className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Generate Cross-Candidate Intelligence</h3>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                                Analysis who among these best fits the role based on side-by-side technical trade-offs.
                            </p>
                        </div>
                        <Button onClick={generateBatchInsight} disabled={loadingInsight}>
                            {loadingInsight ? "Synthesizing Data..." : "Analyze Batch Trade-offs"}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {batchInsight && (
                <Card className="mb-8 border-primary/30 bg-primary/5 overflow-hidden animate-in fade-in slide-in-from-top-4">
                    <CardHeader className="bg-primary/10 border-b border-primary/20">
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            AI Selection Consensus
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="md:col-span-2">
                                <p className="text-sm font-bold uppercase text-primary mb-2">The Winning Edge:</p>
                                <p className="text-lg font-medium leading-relaxed">{batchInsight.winning_rationale}</p>
                            </div>
                            <div className="space-y-4 border-l pl-8 border-primary/10">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">TOP PICK</p>
                                    <p className="text-xl font-black">{batchInsight.top_pick}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Confidence level</p>
                                    <div className="flex items-center gap-2">
                                        <Progress value={batchInsight.confidence} className="h-2" />
                                        <span className="text-xs font-bold">{batchInsight.confidence}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className={`grid grid-cols-1 md:grid-cols-2 ${gridCols} gap-6 mb-8`}>
                {candidates.map((candidate, idx) => (
                    <Card key={candidate.id} className="relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-50" />
                        <CardHeader className="text-center pb-2">
                            <div className="w-16 h-16 mx-auto bg-muted rounded-full mb-2 flex items-center justify-center text-xl font-bold bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                                {(candidate.name || "C").charAt(0)}
                            </div>
                            <CardTitle className="text-xl line-clamp-1">{candidate.name}</CardTitle>
                            <CardDescription className="text-[10px] uppercase tracking-tighter">{candidate.role || "General"}</CardDescription>
                            
                            <div className="mt-4 p-4 rounded-3xl bg-background/50 border border-primary/10 shadow-inner">
                                <div className="text-4xl font-black text-primary">{candidate.score || 0}%</div>
                                <p className="text-[10px] text-muted-foreground uppercase mt-1">Match Score</p>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground">
                                    <span>Technical</span>
                                    <span>{candidate.analysis?.sub_scores?.technical || 0}%</span>
                                </div>
                                <Progress value={candidate.analysis?.sub_scores?.technical || 0} className="h-1" />
                                
                                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground">
                                    <span>Experience</span>
                                    <span>{candidate.analysis?.sub_scores?.experience || 0}%</span>
                                </div>
                                <Progress value={candidate.analysis?.sub_scores?.experience || 0} className="h-1" />
                            </div>

                            <Separator className="opacity-50" />
                            
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3 text-primary" /> Key Strengths
                                </p>
                                <div className="flex flex-wrap gap-1">
                                    {candidate.analysis?.strengths?.slice(0, 3).map((s, i) => (
                                        <Badge key={i} variant="outline" className="text-[9px] bg-primary/5">{s}</Badge>
                                    ))}
                                </div>
                            </div>

                            {candidate.analysis?.consensus_metrics && (
                                <div className="pt-2">
                                    <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="h-3 w-3 text-primary" />
                                            <span className="text-[9px] font-bold">L3 Consensus</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="text-[9px] px-1.5 py-0.5 rounded bg-background border flex items-center gap-1">
                                                <span className="opacity-50">G:</span> {candidate.analysis.consensus_metrics.gemini_score}%
                                            </div>
                                            <div className="text-[9px] px-1.5 py-0.5 rounded bg-background border flex items-center gap-1">
                                                <span className="opacity-50">L:</span> {candidate.analysis.consensus_metrics.groq_score}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="pt-4 flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1 text-[10px]" asChild>
                                    <Link href={`/candidates/${candidate.id}`}>Full Profile</Link>
                                </Button>
                                <Button size="sm" className="flex-1 text-[10px]">Shortlist</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AppShell>
    )
}
