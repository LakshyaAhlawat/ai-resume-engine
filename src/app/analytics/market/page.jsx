"use client"

import { AppShell } from "@/components/layout/AppShell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import { Globe, TrendingUp, Zap, Target, Search, BarChart3 } from "lucide-react"

export default function MarketIntelPage() {
  // Mock data for trends (In a real app, this would come from a global trends API)
  const skillTrendData = [
    { month: 'Sep', ai: 45, cloud: 60, devops: 40 },
    { month: 'Oct', ai: 52, cloud: 65, devops: 42 },
    { month: 'Nov', ai: 68, cloud: 62, devops: 48 },
    { month: 'Dec', ai: 85, cloud: 70, devops: 45 },
    { month: 'Jan', ai: 95, cloud: 68, devops: 50 },
  ]

  return (
    <AppShell title="Market Intelligence">
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 border border-blue-500/20 p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent)] pointer-events-none" />
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            <div className="space-y-4 text-center md:text-left">
              <Badge variant="outline" className="px-4 py-1 border-blue-500/30 text-blue-400 bg-blue-500/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
                 Live Industry Analytics
              </Badge>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                Market <span className="text-blue-500 italic">Global Intelligence</span>
              </h1>
              <p className="text-muted-foreground max-w-xl leading-relaxed">
                Benchmark your candidate pipeline against global hiring trends. Identify emerging technical shifts and stay ahead of the talent curve.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="h-20 w-20 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Globe className="h-10 w-10 text-blue-500" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* AI/ML Trend Acceleration */}
          <Card className="border-blue-500/20 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <CardTitle>Skill Demand Acceleration</CardTitle>
              </div>
              <CardDescription>AI vs Cloud vs DevOps growth trajectory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={skillTrendData}>
                    <defs>
                      <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="month" stroke="#888" fontSize={12} />
                    <YAxis stroke="#888" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px' }}
                    />
                    <Area type="monotone" dataKey="ai" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAi)" />
                    <Area type="monotone" dataKey="cloud" stroke="#8b5cf6" fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Market Sentiment */}
          <Card className="border-blue-500/20 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <CardTitle>Recruiter Sentiment Index</CardTitle>
              </div>
              <CardDescription>Market competitiveness vs hire difficulty</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
               {[
                 { label: "Role Scarcity", value: 85, color: "bg-red-500" },
                 { label: "Salary Inflation", value: 64, color: "bg-blue-500" },
                 { label: "Technical Depth Req.", value: 92, color: "bg-purple-500" },
               ].map((item, i) => (
                 <div key={i} className="space-y-2">
                   <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                     <span className="text-muted-foreground">{item.label}</span>
                     <span>{item.value}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                     <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }} />
                   </div>
                 </div>
               ))}
               <div className="p-4 rounded-xl border border-dashed border-blue-500/20 bg-blue-500/5">
                 <p className="text-[10px] font-bold text-blue-400 uppercase mb-1 flex items-center gap-2">
                   <Search className="h-3 w-3" /> AI Market Insight
                 </p>
                 <p className="text-xs italic leading-relaxed text-muted-foreground">
                   "Global engineering demand is shifting from specialized cloud roles toward 'Intelligence-First' full-stack profiles capable of integrating LLMs."
                 </p>
               </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </AppShell>
  )
}
