"use client"

import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MoreHorizontal, ArrowUpRight, FileText } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function DashboardPage() {
  const [candidates, setCandidates] = useState([])

  useEffect(() => {
    const fetchCandidates = async () => {
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
    }
    fetchCandidates()
  }, [])

  const totalCandidates = candidates.length
  const avgScore = candidates.length > 0 
    ? Math.round(candidates.reduce((acc, curr) => acc + (curr.score || 0), 0) / candidates.length) 
    : 0
  const shortlisted = candidates.filter(c => c.status === "Shortlisted" || c.status === "Accepted").length
  const openRoles = Array.from(new Set(candidates.map(c => c.role))).length

  return (
    <AppShell title="Dashboard">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCandidates}</div>
            <p className="text-xs text-muted-foreground">Across all positions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500/20" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shortlisted}</div>
            <p className="text-xs text-muted-foreground">Qualified for interview</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Match Score</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500/20" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}%</div>
            <p className="text-xs text-muted-foreground">Overall talent quality</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
            <div className="h-4 w-4 rounded-full bg-orange-500/20" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRoles}</div>
            <p className="text-xs text-muted-foreground">Currently hiring</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Candidates</CardTitle>
            <Button size="sm" variant="outline">
              View All <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Match Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map((candidate, i) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">#{candidate.id.slice(0, 5)}</TableCell>
                    <TableCell className="font-medium">{candidate.name}</TableCell>
                    <TableCell className="text-muted-foreground">{candidate.role}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{candidate.score}%</span>
                        <Progress value={candidate.score} className="w-[60px]" 
                          indicatorColor={candidate.score > 80 ? "bg-green-500" : candidate.score > 50 ? "bg-yellow-500" : "bg-red-500"} 
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={candidate.status === "Shortlisted" ? "default" : candidate.status === "Rejected" ? "destructive" : "secondary"}>
                        {candidate.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{candidate.applied}</TableCell>
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
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
