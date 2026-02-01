"use client"

import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Filter, ArrowUpRight, Download } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth"

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Merge static mock data with dynamic data from localStorage
    const stored = JSON.parse(localStorage.getItem('resume_ai_candidates') || '[]')
    const staticData = [
      {
        id: "1",
        name: "Alex Johnson",
        role: "Senior Frontend Engineer",
        score: 92,
        status: "Shortlisted",
        match: "High",
        applied: "2h ago",
        email: "alex.j@example.com"
      },
      {
        id: "2",
        name: "Sarah Williams",
        role: "Product Designer",
        score: 88,
        status: "Review",
        match: "High",
        applied: "5h ago",
        email: "s.williams@design.co"
      },
      {
        id: "3",
        name: "Michael Brown",
        role: "Backend Developer",
        score: 74,
        status: "Pending",
        match: "Medium",
        applied: "1d ago",
        email: "mike.brown@dev.io"
      },
      {
        id: "4",
        name: "Emily Davis",
        role: "Data Scientist",
        score: 45,
        status: "Rejected",
        match: "Low",
        applied: "1d ago",
        email: "emily.d@data.sci"
      },
       {
        id: "5",
        name: "David Wilson",
        role: "DevOps Engineer",
        score: 65,
        status: "Pending",
        match: "Medium",
        applied: "2d ago",
        email: "dwilson@cloud.net"
      },
    ]
    
    // De-duplicate by ID
    const all = [...stored, ...staticData]
    const unique = Array.from(new Map(all.map(item => [item.id, item])).values())
    
    setCandidates(unique)
    setLoading(false)
  }, [])

  const filteredCandidates = candidates.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.role?.toLowerCase().includes(search.toLowerCase())
  )

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
        </div>
    </AppShell>
  )
}
