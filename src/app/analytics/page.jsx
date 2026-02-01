"use client"
import { useState, useEffect } from "react"

import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AnalyticsPage() {
  const [scoreData, setScoreData] = useState([
    { range: "0-20", count: 5 },
    { range: "21-40", count: 15 },
    { range: "41-60", count: 45 },
    { range: "61-80", count: 80 },
    { range: "81-100", count: 35 },
  ])
  
  const [funnel, setFunnel] = useState([
    { name: "Total Applicants", value: 1248, fill: "#8884d8" },
    { name: "Parsed Successfully", value: 1100, fill: "#83a6ed" },
    { name: "Qualified (>60%)", value: 450, fill: "#8dd1e1" },
    { name: "Shortlisted", value: 45, fill: "#82ca9d" },
  ])

  const [fairnessData, setFairnessData] = useState([
    { name: "Group A", score: 85 },
    { name: "Group B", score: 82 },
    { name: "Group C", score: 84 },
    { name: "Group D", score: 86 },
  ])

  useEffect(() => {
    // Load dynamic data
    const stored = JSON.parse(localStorage.getItem('resume_ai_candidates') || '[]')
    
    if (stored.length > 0) {
        // Update Score Distribution
        const newScores = [...scoreData]
        stored.forEach(c => {
            const score = c.score || 0
            if (score <= 20) newScores[0].count++
            else if (score <= 40) newScores[1].count++
            else if (score <= 60) newScores[2].count++
            else if (score <= 80) newScores[3].count++
            else newScores[4].count++
        })
        setScoreData(newScores)

        // Update Funnel
        const newFunnel = [...funnel]
        newFunnel[0].value += stored.length // Applicants
        newFunnel[1].value += stored.length // Parsed
        newFunnel[2].value += stored.filter(c => c.score > 60).length // Qualified
        newFunnel[3].value += stored.filter(c => c.score > 80).length // Shortlisted (mock threshold)
        setFunnel(newFunnel)
    }
  }, [])

  return (
    <AppShell title="Analytics">
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Average Match Score</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">72.4%</div>
                    <p className="text-xs text-muted-foreground">+5% from last batch</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Bias-Free Index</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-500">98.2%</div>
                    <p className="text-xs text-muted-foreground">High fairness score</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Top Skill</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">React.js</div>
                    <p className="text-xs text-muted-foreground">Found in 65% of resumes</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">1.2s</div>
                    <p className="text-xs text-muted-foreground">Per resume average</p>
                </CardContent>
            </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="fairness">Fairness & Bias</TabsTrigger>
                <TabsTrigger value="skills">Skills Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Score Distribution</CardTitle>
                            <CardDescription>How candidates scored across the board.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={scoreData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                    <Tooltip 
                                         contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                         itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Filtering Funnel</CardTitle>
                            <CardDescription>Attrition rate through the process.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={funnel} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
                                    <Tooltip 
                                         contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                         itemStyle={{ color: 'hsl(var(--foreground))' }}
                                    />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="fairness" className="space-y-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Demographic Parity Check</CardTitle>
                        <CardDescription>Ensuring scores are consistent across different groups (anonymized).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={fairnessData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                                <Tooltip 
                                     contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                                     itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                 </Card>
            </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}
