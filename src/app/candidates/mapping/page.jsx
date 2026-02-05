"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { MapPin, Users, Target, Brain, Sparkles, TrendingUp } from "lucide-react"
import { toast } from "sonner"

export default function TalentMappingPage() {
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const { supabase } = await import("@/lib/supabase")
        const { data, error } = await supabase
          .from('candidates')
          .select('*')
        
        if (error) throw error
        setCandidates(data || [])
      } catch (err) {
        console.error("Mapping Fetch Error:", err)
        toast.error("Failed to load talent map data")
      } finally {
        setLoading(false)
      }
    }
    fetchCandidates()
  }, [])

  // Process data for charts
  const skillDistribution = candidates.reduce((acc, c) => {
    const skills = c.extracted_data?.skills || []
    skills.forEach(skill => {
      const existing = acc.find(item => item.name === skill)
      if (existing) existing.value += 1
      else acc.push({ name: skill, value: 1 })
    })
    return acc
  }, []).sort((a, b) => b.value - a.value).slice(0, 10)

  const seniorityData = [
    { name: "Junior", value: candidates.filter(c => (c.extracted_data?.years_experience || 0) < 3).length },
    { name: "Mid-Level", value: candidates.filter(c => (c.extracted_data?.years_experience || 0) >= 3 && (c.extracted_data?.years_experience || 0) < 6).length },
    { name: "Senior", value: candidates.filter(c => (c.extracted_data?.years_experience || 0) >= 6 && (c.extracted_data?.years_experience || 0) < 10).length },
    { name: "Lead/Staff", value: candidates.filter(c => (c.extracted_data?.years_experience || 0) >= 10).length },
  ]

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  if (loading) return <AppShell title="Talent Mapping"><div className="p-10 text-center">Architecting Talent Map...</div></AppShell>

  return (
    <AppShell title="Talent Mapping & Skill Density">
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 border border-primary/20 p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,rgba(var(--primary-rgb),0.1),transparent)] pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            <div className="space-y-4 text-center md:text-left">
              <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary bg-primary/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
                 Talent Intelligence Hub
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                Global <span className="text-primary italic">Talent Map</span>
              </h1>
              <p className="text-muted-foreground max-w-xl leading-relaxed">
                Visualize skill density and seniority distribution across your entire candidate pool. Identify talent surpluses and strategic gaps in real-time.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-primary/5 border-primary/20 p-4 text-center">
                <p className="text-2xl font-black text-primary">{candidates.length}</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Candidates</p>
              </Card>
              <Card className="bg-primary/5 border-primary/20 p-4 text-center">
                <p className="text-2xl font-black text-primary">{skillDistribution.length}</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Unique Skills</p>
              </Card>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Skill Density Chart */}
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <CardTitle>Skill Density (Top 10)</CardTitle>
              </div>
              <CardDescription>Frequency of technical skills across all profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillDistribution} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={100} 
                      fontSize={10} 
                      stroke="#888"
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                      itemStyle={{ color: '#8b5cf6' }}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Seniority Distribution */}
          <Card className="border-primary/20 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle>Seniority Experience</CardTitle>
              </div>
              <CardDescription>Talent distribution by years of professional work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={seniorityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {seniorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* High-Potential Watchlist */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Strategic High-Potential Watchlist
            </CardTitle>
            <CardDescription>Candidates with top scores and exponential career arcs</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
               <div className="space-y-4">
                  {candidates
                    .sort((a, b) => (b.score || 0) - (a.score || 0))
                    .slice(0, 5)
                    .map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-muted/30 hover:bg-primary/5 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-sm">{c.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{c.current_title || "Software Engineer"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-primary">{c.score}%</p>
                          <Badge variant="outline" className="text-[8px] bg-primary/5 border-primary/20">MATCH SCORE</Badge>
                        </div>
                      </div>
                    ))}
               </div>
            </ScrollArea>
          </CardContent>
        </Card>

      </div>
    </AppShell>
  )
}
