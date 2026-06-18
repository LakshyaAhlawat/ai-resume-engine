"use client"

import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TiltCard } from "@/components/ui/tilt-card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Filter, ArrowUpRight, Download, Swords, History, Check, RotateCcw } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"
import { getCandidates } from "@/actions/candidateActions"

export default function CandidatesPage() {
  const router = useRouter()
  const [candidates, setCandidates] = useState([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    const fetchCandidates = async () => {
        setLoading(true)
        try {
            const res = await getCandidates();
            if (res.success && res.candidates) {
                setCandidates(res.candidates);
            } else {
                console.error("Error fetching candidates:", res.error);
                setCandidates([]);
            }
        } catch (err) {
            console.error("Fetch error:", err)
        } finally {
            setLoading(false)
        }
    }
    fetchCandidates()
  }, [])

  const statusOptions = ["All", ...Array.from(new Set(candidates.map(c => c.status || "Pending")))]

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.role?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "All" || (c.status || "Pending") === statusFilter
    return matchesSearch && matchesStatus
  })

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const startBattle = () => {
    if (selectedIds.length < 2) {
        toast.error("Select at least 2 candidates for the Intelligence Matrix!")
        return
    }
    router.push(`/candidates/compare?ids=${selectedIds.join(',')}&multitask=true`)
  }

  const exportCsv = () => {
    if (filteredCandidates.length === 0) {
        toast.error("No candidates to export")
        return
    }
    const headers = ["Name", "Email", "Role", "Score", "Status", "Applied"]
    const rows = filteredCandidates.map(c => [
        c.name || "Unknown",
        c.email || "N/A",
        c.role || "General Application",
        `${c.score || 0}%`,
        c.status || "Pending",
        c.applied || "Initial Screening",
    ])
    const escapeCsv = (value) => `"${String(value).replace(/"/g, '""')}"`
    const csv = [headers, ...rows].map(row => row.map(escapeCsv).join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `candidates-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success(`Exported ${filteredCandidates.length} candidate${filteredCandidates.length > 1 ? 's' : ''}`)
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter{statusFilter !== "All" ? `: ${statusFilter}` : ""}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {statusOptions.map((status) => (
                                <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                                    {statusFilter === status && <Check className="mr-2 h-4 w-4" />}
                                    <span className={statusFilter === status ? "" : "ml-6"}>{status}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" onClick={exportCsv}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            <TiltCard className="rounded-[2rem]">
            <Card className="border-primary/20 bg-card/40 backdrop-blur-xl overflow-hidden rounded-[2rem] shadow-2xl">
                <CardHeader className="border-b border-primary/10 bg-primary/5">
                    <CardTitle className="text-xl font-black tracking-tight">Main Pipeline</CardTitle>
                    <CardDescription className="text-xs uppercase tracking-widest font-bold opacity-70">Reviewing {filteredCandidates.length} Active Candidates</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-20 text-center flex flex-col items-center gap-4">
                            <RotateCcw className="h-10 w-10 text-primary animate-spin" />
                            <p className="text-muted-foreground text-sm font-medium italic">Synchronizing Talent Matrix...</p>
                        </div>
                    ) : filteredCandidates.length === 0 ? (
                         <div className="p-20 text-center text-muted-foreground font-medium italic">No candidates found matching your criteria.</div>
                    ) : (
                    <div className="overflow-x-auto">
                    <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="border-primary/10 hover:bg-transparent">
                        <TableHead className="w-12 pl-6"></TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Candidate</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Target Role</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Match Analysis</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Pipeline Stage</TableHead>
                        <TableHead className="text-right pr-6"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCandidates.map((candidate) => (
                        <TableRow key={candidate.id} className="border-primary/5 hover:bg-primary/5 transition-colors group">
                            <TableCell className="pl-6">
                                <Checkbox 
                                    checked={selectedIds.includes(candidate.id)} 
                                    onCheckedChange={() => toggleSelection(candidate.id)}
                                    disabled={selectedIds.length >= 4 && !selectedIds.includes(candidate.id)}
                                    className="border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                />
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary text-sm border border-primary/10 shadow-sm group-hover:scale-110 transition-transform">
                                        {(candidate.name || "C").charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold tracking-tight text-sm">{candidate.name || "Unknown"}</span>
                                        <span className="text-[10px] text-muted-foreground/80 font-medium">{(candidate.email || "No email").toLowerCase()}</span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground font-bold text-[10px] uppercase tracking-tighter">{candidate.role || "General Application"}</TableCell>
                            <TableCell>
                                <div className="flex flex-col gap-1 min-w-[120px]">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">Score</span>
                                        <span className="text-sm font-black text-foreground">{candidate.score || 0}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-primary/5">
                                        <div 
                                            className={`h-full transition-all duration-1000 ${
                                                (candidate.score || 0) > 80 ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : 
                                                (candidate.score || 0) > 50 ? "bg-gradient-to-r from-yellow-500 to-yellow-400" : "bg-gradient-to-r from-rose-500 to-rose-400"
                                            }`}
                                            style={{ width: `${candidate.score || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[9px] font-black uppercase tracking-widest border-2 ${
                                    candidate.status === "Shortlisted" ? "border-emerald-500/20 text-emerald-600 bg-emerald-500/5" : 
                                    candidate.status === "Rejected" ? "border-rose-500/20 text-rose-600 bg-rose-500/5" : "border-primary/20 text-primary bg-primary/5"
                                }`}>
                                    {candidate.status || "Pending"}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">{candidate.applied || "Initial Screening"}</TableCell>
                            <TableCell className="text-right pr-6">
                                <Button variant="ghost" size="sm" asChild className="rounded-xl hover:bg-primary/10">
                                    <Link href={`/candidates/${candidate.id}`} className="flex items-center gap-1.5 font-bold text-xs">
                                        Review <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </Button>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                    </div>
                    )}
                </CardContent>
            </Card>
            </TiltCard>

            {selectedIds.length > 0 && (
                <div className="fixed inset-x-4 bottom-6 z-50 flex justify-center sm:inset-x-0 sm:bottom-10 animate-in slide-in-from-bottom-5 duration-300">
                    <Card className="w-full sm:w-auto shadow-2xl border-primary/20 bg-primary/5 backdrop-blur-md">
                        <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6">
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                                <Swords className="h-5 w-5 text-primary shrink-0" />
                                <span className="text-sm font-semibold whitespace-nowrap">
                                    {selectedIds.length} Candidate{selectedIds.length > 1 ? 's' : ''} Selected
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="flex-1 sm:flex-none" onClick={() => setSelectedIds([])}>
                                    Clear
                                </Button>
                                 <Button size="sm" className="flex-1 sm:flex-none shadow-lg" onClick={startBattle} disabled={selectedIds.length < 2}>
                                    Launch Intelligence Matrix <ArrowUpRight className="ml-2 h-4 w-4" />
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
