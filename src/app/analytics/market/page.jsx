"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts"
import { Globe, Github, Star, ExternalLink, Clock, RotateCcw, TrendingUp, Sparkles, ShieldAlert } from "lucide-react"

const chartTooltipStyle = {
  contentStyle: { backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 8 },
  itemStyle: { color: 'var(--foreground)' },
  labelStyle: { color: 'var(--foreground)' },
}

export default function MarketIntelPage() {
  const [trends, setTrends] = useState(null)
  const [loadingTrends, setLoadingTrends] = useState(true)
  const [trendsError, setTrendsError] = useState(false)
  const [pipelineSkills, setPipelineSkills] = useState({})
  const [pipelineStats, setPipelineStats] = useState({ total: 0, avgScore: 0, strongFitPct: 0 })

  useEffect(() => {
    const loadTrends = async () => {
      setLoadingTrends(true)
      setTrendsError(false)
      try {
        const res = await fetch('/api/market/trends')
        if (!res.ok) throw new Error('Trends fetch failed')
        const data = await res.json()
        setTrends(data)
      } catch (err) {
        console.error("Market trends error:", err)
        setTrendsError(true)
      } finally {
        setLoadingTrends(false)
      }
    }
    loadTrends()
  }, [])

  useEffect(() => {
    const loadPipeline = async () => {
      try {
        const { getCandidates } = await import("@/actions/candidateActions")
        const res = await getCandidates()
        if (!res.success) return
        const candidates = res.candidates || []

        const skillMap = {}
        candidates.forEach((c) => {
          ;(c.extracted_data?.skills || []).forEach((s) => {
            const key = String(s).trim()
            if (key) skillMap[key] = (skillMap[key] || 0) + 1
          })
        })
        setPipelineSkills(skillMap)

        const total = candidates.length
        const avgScore = total ? Math.round(candidates.reduce((a, c) => a + (c.score || 0), 0) / total) : 0
        const strongFitPct = total ? Math.round((candidates.filter((c) => (c.score || 0) >= 70).length / total) * 100) : 0
        setPipelineStats({ total, avgScore, strongFitPct })
      } catch (err) {
        console.error("Pipeline stats error:", err)
      }
    }
    loadPipeline()
  }, [])

  const coverage = (trends?.trendingLanguages || []).map((lang) => {
    const matchKey = Object.keys(pipelineSkills).find((s) => s.toLowerCase() === lang.name.toLowerCase())
    return { ...lang, pipelineCount: matchKey ? pipelineSkills[matchKey] : 0 }
  })

  const lastUpdated = trends?.generatedAt ? new Date(trends.generatedAt) : null

  return (
    <AppShell title="Market Intelligence">
      <div className="space-y-8 max-w-7xl mx-auto pb-20">

        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 border border-blue-500/20 p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,color-mix(in_oklch,var(--chart-2)_15%,transparent),transparent)] pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            <div className="space-y-4 text-center md:text-left">
              <Badge variant="outline" className="px-4 py-1 border-blue-500/30 text-blue-400 bg-blue-500/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse mr-1.5 inline-block" /> Live — Real GitHub Activity
              </Badge>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter break-words">
                Market <span className="text-blue-500 italic">Global Intelligence</span>
              </h1>
              <p className="text-muted-foreground max-w-xl leading-relaxed">
                Actual repository activity from the last {trends?.windowDays || 14} days, ranked by stars — not projections. Cross-referenced against your own candidate pipeline below.
              </p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground/70 flex items-center gap-1.5 justify-center md:justify-start">
                  <Clock className="h-3 w-3" /> Updated {lastUpdated.toLocaleString()} · Source: {trends.source}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <div className="h-20 w-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Globe className="h-10 w-10 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {trendsError && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-6 flex items-center gap-3 text-sm text-destructive">
              <ShieldAlert className="h-5 w-5 shrink-0" /> Live market data is temporarily unavailable (GitHub&apos;s public API may be rate-limited). Try again shortly.
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Trending languages chart */}
          <Card className="border-blue-500/20 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <CardTitle>Trending Languages Right Now</CardTitle>
              </div>
              <CardDescription>By total stars across new repos created in the last {trends?.windowDays || 14} days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[320px] w-full mt-4">
                {loadingTrends ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm gap-2">
                    <RotateCcw className="h-4 w-4 animate-spin" /> Pulling live data...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trends?.trendingLanguages || []} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                      <XAxis type="number" stroke="var(--muted-foreground)" fontSize={12} />
                      <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" fontSize={12} width={90} />
                      <Tooltip {...chartTooltipStyle} />
                      <Bar dataKey="stars" radius={[0, 4, 4, 0]}>
                        {(trends?.trendingLanguages || []).map((_, i) => (
                          <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline health, computed from real data */}
          <Card className="border-blue-500/20 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <CardTitle>Your Pipeline Health</CardTitle>
              </div>
              <CardDescription>Computed live from your own candidate pool, right now</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-black">{pipelineStats.total}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Candidates</p>
                </div>
                <div>
                  <p className="text-2xl font-black">{pipelineStats.avgScore}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Avg Score</p>
                </div>
                <div>
                  <p className="text-2xl font-black">{pipelineStats.strongFitPct}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Strong Fits</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Coverage vs. Real-World Demand</p>
                {coverage.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Live trend data still loading.</p>
                ) : coverage.slice(0, 6).map((lang) => (
                  <div key={lang.name} className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0">
                    <span className="font-medium">{lang.name}</span>
                    {lang.pipelineCount > 0 ? (
                      <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-500 bg-green-500/5">{lang.pipelineCount} in pipeline</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-500 bg-red-500/5">Coverage gap</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top repos right now */}
        <Card className="border-blue-500/20 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Github className="h-5 w-5 text-blue-500" />
              <CardTitle>What&apos;s Hot on GitHub Right Now</CardTitle>
            </div>
            <CardDescription>Highest-starred repositories created in the last {trends?.windowDays || 14} days</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingTrends ? (
              <div className="py-10 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                <RotateCcw className="h-4 w-4 animate-spin" /> Loading live repositories...
              </div>
            ) : (trends?.topRepos || []).length === 0 ? (
              <p className="py-10 text-center text-muted-foreground text-sm">No live data available right now.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {trends.topRepos.map((repo) => (
                  <a
                    key={repo.name}
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-1 p-4 rounded-xl border border-border/50 bg-background/40 hover:border-blue-500/40 transition-colors group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold truncate group-hover:text-blue-500 transition-colors">{repo.name}</span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{repo.description || "No description provided."}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {repo.language && <Badge variant="secondary" className="text-[10px]">{repo.language}</Badge>}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> {repo.stars.toLocaleString()}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
