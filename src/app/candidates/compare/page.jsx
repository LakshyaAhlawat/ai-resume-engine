"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Swords, ChevronLeft, TrendingUp, Trophy, AlertTriangle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ComparePage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const ids = searchParams.get('ids')?.split(',') || []
    
    const [candidates, setCandidates] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCandidates = async () => {
            if (ids.length !== 2) {
                toast.error("Battle Mode requires exactly 2 candidates")
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

    if (loading) return <AppShell title="Loading Arena..."><div className="p-10 text-center">Preparing the Battle Arena...</div></AppShell>
    if (candidates.length !== 2) return <AppShell title="Error"><div className="p-10 text-center text-destructive">Battle Arena requires 2 gladiators.</div></AppShell>

    const [c1, c2] = candidates

    const ComparisonRow = ({ label, val1, val2, invert = false }) => {
        const isWinning = invert ? val1 < val2 : val1 > val2
        const isLosing = invert ? val1 > val2 : val1 < val2
        
        return (
            <div className="space-y-2 py-4 border-b last:border-0">
                <div className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest">{label}</div>
                <div className="grid grid-cols-2 gap-8 items-center">
                    <div className="space-y-1 text-right">
                        <div className="flex items-center justify-end gap-2">
                             {isWinning && <Trophy className="h-4 w-4 text-yellow-500" />}
                             <span className={`text-lg font-bold ${isWinning ? 'text-primary' : ''}`}>{val1}%</span>
                        </div>
                        <Progress value={val1} className="h-1.5 ml-auto w-full rotate-180" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                             <span className={`text-lg font-bold ${isLosing ? '' : 'text-primary'}`}>{val2}%</span>
                             {!isWinning && val1 !== val2 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <Progress value={val2} className="h-1.5 w-full" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <AppShell title="Candidate Battle Arena">
            <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/candidates" className="flex items-center text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Candidates
                    </Link>
                </Button>
                <Badge variant="outline" className="px-4 py-1 border-primary/20 bg-primary/5">
                    <Swords className="mr-2 h-4 w-4 text-primary" />
                    Head-to-Head Comparison
                </Badge>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8 relative">
                {/* VS Overlay */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden lg:flex h-16 w-16 items-center justify-center rounded-full bg-background border-4 border-muted shadow-xl italic font-black text-2xl text-muted-foreground">
                    VS
                </div>

                {candidates.map((candidate, idx) => (
                    <Card key={candidate.id} className={`${idx === 0 ? 'border-r-0 rounded-r-none' : 'border-l-0 rounded-l-none'} shadow-lg`}>
                        <CardHeader className="text-center pb-2">
                            <div className="w-16 h-16 mx-auto bg-muted rounded-full mb-2 flex items-center justify-center text-xl font-bold bg-gradient-to-br from-primary/20 to-primary/5">
                                {(candidate.name || "C").charAt(0)}
                            </div>
                            <CardTitle className="text-xl">{candidate.name}</CardTitle>
                            <CardDescription>{candidate.role}</CardDescription>
                            <div className="mt-4 flex justify-center">
                                <div className="text-3xl font-black text-primary">{candidate.score}%</div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="p-3 rounded-lg bg-muted/30 text-xs italic text-muted-foreground line-clamp-3 min-h-[60px]">
                                "{candidate.analysis?.reasoning?.split('.')[0]}..."
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/candidates/${candidate.id}`}>View Profile</Link>
                                </Button>
                                <Button size="sm">Contact</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-lg">Detailed Stats Battle</CardTitle>
                </CardHeader>
                <CardContent className="px-10">
                    <ComparisonRow 
                        label="Overall Match" 
                        val1={c1.score || 0} 
                        val2={c2.score || 0} 
                    />
                    <ComparisonRow 
                        label="Technical Depth" 
                        val1={c1.analysis?.sub_scores?.technical || 0} 
                        val2={c2.analysis?.sub_scores?.technical || 0} 
                    />
                    <ComparisonRow 
                        label="Experience Relevance" 
                        val1={c1.analysis?.sub_scores?.experience || 0} 
                        val2={c2.analysis?.sub_scores?.experience || 0} 
                    />
                    <ComparisonRow 
                        label="Soft Skills" 
                        val1={c1.analysis?.sub_scores?.soft_skills || 0} 
                        val2={c2.analysis?.sub_scores?.soft_skills || 0} 
                    />
                    <ComparisonRow 
                        label="Culture Fit" 
                        val1={c1.analysis?.sub_scores?.culture || 0} 
                        val2={c2.analysis?.sub_scores?.culture || 0} 
                    />
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-8">
                {candidates.map((candidate) => (
                    <Card key={candidate.id}>
                        <CardHeader>
                            <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Unique Edge</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                {candidate.analysis?.strengths?.slice(0, 3).map((s, i) => (
                                    <div key={i} className="flex gap-2 text-sm items-start">
                                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                        <span>{s}</span>
                                    </div>
                                ))}
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <p className="text-xs font-bold text-muted-foreground uppercase">Potential Gaps</p>
                                {candidate.analysis?.weaknesses?.slice(0, 2).map((w, i) => (
                                    <div key={i} className="flex gap-2 text-xs items-start text-muted-foreground">
                                        <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 shrink-0" />
                                        <span>{w}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AppShell>
    )
}
