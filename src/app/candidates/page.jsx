"use client"

import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Filter, ArrowUpRight, Download, Swords, History, Check } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"

export default function CandidatesPage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    const fetchCandidates = async () => {
        setLoading(true)
        try {
            const { supabase } = await import("@/lib/supabase")
            const { data, error } = await supabase
                .from('candidates')
                .select('*')
                .order('created_at', { ascending: false })
            
            if (error) {
                console.error("Error fetching candidates:", error)
                return
            }

            if (data) {
                setCandidates(data)
            }
        } catch (err) {
            console.error("Fetch error:", err)
        } finally {
            setLoading(false)
        }
    }
    fetchCandidates()
  }, [])

  const filteredCandidates = candidates.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.role?.toLowerCase().includes(search.toLowerCase())
  )

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const startBattle = () => {
    if (selectedIds.length !== 2) {
        toast.error("Select exactly 2 candidates for Battle Mode!")
        return
    }
    router.push(`/candidates/compare?ids=${selectedIds.join(',')}`)
  }

  return (
    <AppShell title="Candidates">
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search candidates..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Candidates</CardTitle>
                    <CardDescription>Manage and review your candidate pipeline.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading candidates...</div>
                    ) : filteredCandidates.length === 0 ? (
                         <div className="p-8 text-center text-muted-foreground">No candidates found matching your search.</div>
                    ) : (
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Candidate</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Match Analysis</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Applied</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCandidates.map((candidate) => (
                        <TableRow key={candidate.id}>
                            <TableCell>
                                <Checkbox 
                                    checked={selectedIds.includes(candidate.id)} 
                                    onCheckedChange={() => toggleSelection(candidate.id)}
                                    disabled={selectedIds.length >= 2 && !selectedIds.includes(candidate.id)}
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{candidate.name || "Unknown"}</span>
                                    <span className="text-xs text-muted-foreground">{candidate.email || "No email"}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{candidate.role || "General Application"}</TableCell>
                            <TableCell>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col gap-1 min-w-[100px]">
                                    <div className="flex justify-between text-xs">
                                        <span>Match</span>
                                        <span className="font-bold">{candidate.score || 0}%</span>
                                    </div>
                                    <Progress 
                                        value={candidate.score || 0} 
                                        className="h-2 w-full"
                                        indicatorColor={
                                            (candidate.score || 0) > 80 ? "bg-green-500" : 
                                            (candidate.score || 0) > 50 ? "bg-yellow-500" : "bg-red-500"
                                        } 
                                    />
                                </div>
                            </div>
                            </TableCell>
                            <TableCell>
                            <Badge variant={
                                candidate.status === "Shortlisted" ? "default" : 
                                candidate.status === "Rejected" ? "destructive" : "secondary"
                            }>
                                {candidate.status || "Pending"}
                            </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{candidate.applied || "Recently"}</TableCell>
                            <TableCell className="text-right">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href={`/candidates/${candidate.id}`}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Link>
                            </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>

            {selectedIds.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
                    <Card className="shadow-2xl border-primary/20 bg-primary/5 backdrop-blur-md">
                        <CardContent className="p-4 flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Swords className="h-5 w-5 text-primary" />
                                <span className="text-sm font-semibold whitespace-nowrap">
                                    {selectedIds.length} Candidate{selectedIds.length > 1 ? 's' : ''} Selected
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                                    Clear
                                </Button>
                                <Button size="sm" onClick={startBattle} disabled={selectedIds.length !== 2} className="shadow-lg">
                                    Enter Battle Arena <ArrowUpRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    </AppShell>
  )
}
