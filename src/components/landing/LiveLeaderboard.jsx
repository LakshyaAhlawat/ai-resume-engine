"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Github, Code2, Zap, Search, RotateCcw, TrendingUp } from "lucide-react"
import { toast } from "sonner"

const INITIAL_PROS = [
    { rank: 1, name: "Guillermo Rauch", github: "rauchg", leetcode: "rauchg", score: 98, tier: "S-Tier", stack: ["Node.js", "React", "Next.js"] },
    { rank: 2, name: "Shadcn", github: "shadcn", leetcode: "shadcn", score: 96, tier: "S-Tier", stack: ["Tailwind", "React", "Rust"] },
    { rank: 3, name: "Lee Robinson", github: "leerob", leetcode: "leerob", score: 94, tier: "A-Tier", stack: ["Next.js", "SQL", "TS"] },
];

export function LiveLeaderboard() {
    const [leaderboard, setLeaderboard] = useState(INITIAL_PROS)
    const [searchGh, setSearchGh] = useState("")
    const [searchLc, setSearchLc] = useState("")
    const [loading, setLoading] = useState(false)

    const handleJoin = async () => {
        if (!searchGh && !searchLc) {
            toast.error("Enter at least one handle")
            return
        }
        setLoading(true)
        try {
            const res = await fetch('/api/talent-pulse/live', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ githubUser: searchGh, leetcodeUser: searchLc })
            })
            const data = await res.json()
            
            if (data.success) {
                const newUser = {
                    rank: leaderboard.length + 1,
                    name: data.identity.github?.name || searchGh || searchLc,
                    github: searchGh,
                    leetcode: searchLc,
                    score: data.powerScore,
                    tier: data.tier,
                    stack: ["JavaScript", "Python"] // Simplified for demo
                }
                
                // Add and re-sort
                const updated = [...leaderboard, newUser].sort((a, b) => b.score - a.score);
                // Re-rank
                setLeaderboard(updated.map((u, i) => ({ ...u, rank: i + 1 })));
                toast.success("Joined the Global Leaderboard!");
                setSearchGh(""); setSearchLc("");
            } else {
                toast.error(data.error || "Failed to fetch live data")
            }
        } catch (err) {
            toast.error("Connection failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-end bg-white/5 p-6 rounded-[2rem] border border-white/10 backdrop-blur-xl">
                <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">GitHub Profile</label>
                    <div className="relative">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            value={searchGh}
                            onChange={(e) => setSearchGh(e.target.value)}
                            placeholder="username" 
                            className="pl-10 h-12 bg-black/20 border-white/10 rounded-xl" 
                        />
                    </div>
                </div>
                <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary">LeetCode Handle</label>
                    <div className="relative">
                        <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                            value={searchLc}
                            onChange={(e) => setSearchLc(e.target.value)}
                            placeholder="username" 
                            className="pl-10 h-12 bg-black/20 border-white/10 rounded-xl" 
                        />
                    </div>
                </div>
                <Button onClick={handleJoin} disabled={loading} className="h-12 px-8 rounded-xl font-black gap-2 shadow-xl shadow-primary/20">
                    {loading ? <RotateCcw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-current" />}
                    JOIN RANKING
                </Button>
            </div>

            <div className="rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-3xl overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5 hover:bg-transparent">
                            <TableHead className="w-[80px] font-black uppercase text-[10px] tracking-widest">Rank</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Astra Profile</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Tech DNA</TableHead>
                            <TableHead className="text-right font-black uppercase text-[10px] tracking-widest">Power Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <AnimatePresence mode="popLayout">
                            {leaderboard.map((user) => (
                                <motion.tr 
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    whileHover={{ 
                                        y: -5,
                                        scale: 1.01,
                                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                                        transition: { duration: 0.2 }
                                    }}
                                    key={user.github || user.leetcode}
                                    className="border-white/5 transition-colors group cursor-default relative overflow-hidden"
                                >
                                    <TableCell className="font-black italic text-lg text-muted-foreground group-hover:text-primary transition-colors pl-6">
                                        #{user.rank}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4 py-2">
                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 via-blue-500/10 to-transparent flex items-center justify-center border border-white/10 shadow-2xl relative group-hover:scale-110 transition-transform duration-500">
                                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-100" />
                                                <span className="relative z-10 text-xl font-black text-primary">{user.name.charAt(0)}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="font-black text-base tracking-tight group-hover:translate-x-1 transition-transform">{user.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[9px] font-black h-4 border-white/20 bg-white/5 text-slate-400 capitalize px-2 tracking-widest">{user.tier}</Badge>
                                                    <span className="text-[10px] text-muted-foreground font-bold flex items-center gap-1 opacity-70">
                                                       <TrendingUp className="h-3 w-3 text-emerald-500" /> Live Pulse
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-2">
                                            {user.stack.slice(0, 3).map(s => (
                                                <span key={s} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 hover:text-primary hover:border-primary/30 transition-all cursor-pointer">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                        <div className="inline-flex flex-col items-end group-hover:scale-110 transition-transform origin-right">
                                            <span className="text-3xl font-black text-primary leading-none tracking-tighter drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]">{user.score}</span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Astra Units</span>
                                        </div>
                                    </TableCell>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </TableBody>
                </Table>
            </div>
            
            <p className="text-center text-[10px] text-muted-foreground uppercase font-medium tracking-widest opacity-50">
                Data refreshed in real-time via GitHub & LeetCode APIs • Astra Engine v2.0
            </p>
        </div>
    )
}
