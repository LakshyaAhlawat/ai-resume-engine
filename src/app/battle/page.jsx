"use client"

import { useState, useEffect, useRef } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Swords, 
  Zap, 
  Trophy, 
  RotateCcw, 
  Send, 
  ShieldAlert, 
  Cpu, 
  Medal,
  Timer,
  ChevronRight,
  Flame,
  Play,
  Settings,
  Globe,
  Lock,
  Users,
  Terminal,
  Clock,
  Layout,
  BookOpen,
  Bot,
  Copy,
  Check
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CodeEditor } from "@/components/ui/code-editor"

const LANGUAGES = [
    { id: 'cpp', name: 'C++', default: '#include <iostream>\n\nint main() {\n    return 0;\n}' },
    { id: 'python', name: 'Python', default: 'def solution():\n    pass' },
    { id: 'javascript', name: 'JavaScript', default: '/**\n * @param {any} input\n * @return {any}\n */\nfunction solution(input) {\n    \n}' },
    { id: 'java', name: 'Java', default: 'public class Main {\n    public static void main(String[] args) {\n        \n    }\n}' },
];

export default function BattleArenaPage() {
    const { user: authUser } = useAuth()
    const [gameState, setGameState] = useState('lobby') // 'lobby', 'create', 'join', 'active', 'finished'
    const [roomConfig, setRoomConfig] = useState({ id: '', team: 'Shadow', source: 'ai', questions: [{ difficulty: 'Medium' }] })
    const [roomState, setRoomState] = useState(null)
    const [language, setLanguage] = useState(LANGUAGES[2]) // Default JS
    const [questions, setQuestions] = useState([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [codeMap, setCodeMap] = useState({}) // { questionId: code }
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [consoleOutput, setConsoleOutput] = useState([])
    const [resultTab, setResultTab] = useState('testcase')
    const [timer, setTimer] = useState(0)
    const [totalPoints, setTotalPoints] = useState(0)
    const [submittedQuestions, setSubmittedQuestions] = useState([]) // Array of solved question IDs
    const [showExitDialog, setShowExitDialog] = useState(false)
    const heartbeatRef = useRef(null)
    const eventSourceRef = useRef(null)

    // SSE Live Stream — replaces polling for real-time updates
    useEffect(() => {
        if (gameState === 'active' && roomConfig.id) {
            const interval = setInterval(() => setTimer(prev => prev + 1), 1000);

            // Connect to SSE stream
            const es = new EventSource(`/api/battle/rooms/stream?roomId=${roomConfig.id}`);
            es.onmessage = (event) => {
                try {
                    const room = JSON.parse(event.data);
                    setRoomState(room);
                } catch (e) {}
            };
            es.onerror = () => {
                // Auto-reconnects per SSE spec
            };
            eventSourceRef.current = es;

            return () => {
                clearInterval(interval);
                es.close();
                eventSourceRef.current = null;
            };
        }
    }, [gameState, roomConfig.id]);

    useEffect(() => {
        if (gameState === 'active') {
            const timeout = setTimeout(async () => {
                const currentQ = questions[currentQuestionIndex];
                const currentCode = codeMap[currentQ?.id] || "";
                const progress = Math.min(Math.round((currentCode.length / 500) * 100), 99);
                await fetch('/api/battle/rooms', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        roomId: roomConfig.id, 
                        userId: authUser?.id, 
                        progress 
                    })
                });
            }, 10000);
            return () => clearTimeout(timeout);
        }
    }, [codeMap, currentQuestionIndex, questions, gameState, roomConfig.id, authUser?.id]);

    const generateRoomId = () => {
        const prefixes = ['ALPHA', 'SIGMA', 'OMEGA', 'QUANTUM', 'NEON', 'CYBER', 'VOID', 'PHANTOM'];
        const suffixes = ['SYNC', 'STRIKE', 'PROTOCOL', 'MATRIX', 'WAVE', 'CORE', 'GRID', 'PHASE'];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const randomNum = Math.floor(Math.random() * 100);
        const newId = `${randomPrefix}-${randomSuffix}-${randomNum}`;
        setRoomConfig(prev => ({ ...prev, id: newId }));
    }

    const handleCreateArena = () => {
        generateRoomId();
        setGameState('create');
    }

    const handleJoinArena = () => {
        setRoomConfig(prev => ({ ...prev, id: '' }));
        setGameState('join');
    }

    const handleJoinBattle = async () => {
        if (!roomConfig.id) {
            toast.error("Room ID required")
            return
        }
        setLoading(true)
        try {
            // 1. Sync Room State
            const syncRes = await fetch('/api/battle/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    roomId: roomConfig.id, 
                    config: {
                        source: roomConfig.source,
                        questions: roomConfig.questions
                    },
                    user: {
                        id: authUser?.id,
                        name: authUser?.email?.split('@')[0] || "Player",
                        team: roomConfig.team
                    }
                })
            })
            const syncData = await syncRes.json()
            if (!syncData.success) {
                toast.error(syncData.error)
                return
            }

            const room = syncData.room;
            let finalQuestions = room.questions || [];

            // 2. Generate if room is new/empty — with uniqueness enforcement
            if (finalQuestions.length === 0) {
                const generated = [];
                const usedTitles = [];
                const qConfigs = room.config.questions || [{ difficulty: 'Medium' }];
                for (let i = 0; i < qConfigs.length; i++) {
                    const qConfig = qConfigs[i];
                    const genRes = await fetch('/api/battle/generate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            source: room.config.source,
                            difficulty: qConfig.difficulty,
                            excludeTitles: usedTitles
                        })
                    })
                    const q = await genRes.json();
                    generated.push(q);
                    usedTitles.push(q.title); // Track for uniqueness
                }
                finalQuestions = generated;
                
                // SAVE questions to room persistence (also triggers SSE broadcast)
                await fetch('/api/battle/rooms', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        roomId: roomConfig.id, 
                        questions: finalQuestions 
                    })
                })
            }

            setQuestions(finalQuestions)
            setRoomState(room)
            setCurrentQuestionIndex(0)
            
            // Initialize code map with boilerplates
            const initialMap = {};
            finalQuestions.forEach(q => {
                initialMap[q.id] = q.boilerplates?.[language.id] || language.default;
            });
            setCodeMap(initialMap);

            setGameState('active')
            toast.success("Synchronization complete. Battle live.")
        } catch (err) {
            toast.error("Warp gate failure.")
        } finally {
            setLoading(false)
        }
    }

    const handleRunTests = async () => {
        const currentQ = questions[currentQuestionIndex];
        const currentCode = codeMap[currentQ?.id] || "";
        if (!currentCode.trim() || loading) return
        setLoading(true)
        setResultTab('testcase')
        setConsoleOutput([`> Compilation successful...`, `> Executing test cases...`]);
        try {
            const res = await fetch('/api/battle/referee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: currentCode, question: currentQ, language: language.id, mode: 'test' })
            })
            const data = await res.json()
            setResult(data)
            const passMsg = data.passCount !== undefined ? `> Passed ${data.passCount}/${data.totalCount} Test Cases` : `> Result: ${data.isCorrect ? 'PASSED' : 'FAILED'}`;
            setConsoleOutput(prev => [...prev, passMsg, `> Feedback: ${data.feedback}`]);
            if (data.isCorrect) toast.success("All simulated cases passed!");
            else toast.error(`Accuracy: ${((data.passCount/data.totalCount)*100).toFixed(1)}%`);
        } catch (err) {
            toast.error("Test execution failed")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        const currentQ = questions[currentQuestionIndex];
        const currentCode = codeMap[currentQ?.id] || "";
        if (!currentQ || !currentCode.trim() || loading) return
        
        // Prevent re-submitting solved items
        if (submittedQuestions.includes(currentQ.id)) {
            toast.info("This challenge is already verified in the matrix.")
            return
        }

        setLoading(true)
        setResultTab('result')
        setConsoleOutput([`> Submitting solution for evaluation...`, `> Analyzing execution patterns...`])
        try {
            const res = await fetch('/api/battle/referee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: currentCode, question: currentQ, language: language.id, mode: 'submit', timeTaken: timer })
            })
            const data = await res.json()
            setResult(data)
            
            if (data.isCorrect) {
                const pointsAwarded = data.score + (timer < 300 ? 50 : 25);
                const newTotal = totalPoints + pointsAwarded;
                setTotalPoints(newTotal);
                setSubmittedQuestions(prev => [...prev, currentQ.id]);
                
                // Sync progress to room
                await fetch('/api/battle/rooms', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        roomId: roomConfig.id, 
                        userId: authUser?.id, 
                        points: newTotal,
                        progress: Math.floor((submittedQuestions.length + 1) / questions.length * 100)
                    })
                })
                toast.success(`Challenge Decrypted! +${pointsAwarded} Rank Points.`)
            } else {
                toast.error("Execution failed accuracy requirements.")
            }
        } catch (err) {
            toast.error("Referee connection lost")
        } finally {
            setLoading(false)
        }
    }

    const handleConcludeMission = async () => {
        setGameState('finished')
        toast.success("Mission Concluded. Extracting final data.")
    }

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    return (
        <AppShell title="Elite Arena">
            <TooltipProvider>
                <div className="min-h-screen bg-[#1a1a1a] text-[#eff1f6]">
                    {gameState === 'lobby' && (
                        <div className="max-w-5xl mx-auto min-h-[85vh] flex flex-col items-center justify-center relative px-6" style={{ perspective: '1200px' }}>
                            {/* Layered ambient background */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 blur-[160px] rounded-full animate-pulse" />
                                <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-rose-500/6 blur-[140px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/4 blur-[200px] rounded-full" />
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, y: 30, rotateX: 8 }}
                                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="text-center space-y-14 relative z-10 w-full"
                            >
                                {/* Floating 3D Icon */}
                                <div className="space-y-6">
                                    <motion.div 
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                        className="mx-auto w-28 h-28 rounded-[2.5rem] flex items-center justify-center relative"
                                        style={{ 
                                            background: 'linear-gradient(135deg, rgba(var(--primary-rgb, 124,58,237), 0.15), rgba(var(--primary-rgb, 124,58,237), 0.05))',
                                            border: '2px solid rgba(var(--primary-rgb, 124,58,237), 0.25)',
                                            boxShadow: '0 25px 60px -12px rgba(var(--primary-rgb, 124,58,237), 0.35), inset 0 1px 1px rgba(255,255,255,0.05)',
                                            transform: 'perspective(600px) rotateY(-5deg)'
                                        }}
                                    >
                                        <Swords className="h-14 w-14 text-primary drop-shadow-lg" />
                                        {/* Glowing ring */}
                                        <div className="absolute inset-0 rounded-[2.5rem] border border-primary/10 animate-ping opacity-20" />
                                    </motion.div>

                                    <div>
                                        <h1 className="text-7xl md:text-9xl font-black tracking-[-0.06em] uppercase leading-[0.85]">
                                            <span className="bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-transparent">ASTRA</span>
                                            <br/>
                                            <span className="bg-gradient-to-r from-primary via-primary to-violet-400 bg-clip-text text-transparent italic">ARENA</span>
                                        </h1>
                                        <p className="text-slate-500 text-base font-medium max-w-md mx-auto mt-4 tracking-wide">
                                            Establish your dominance in the global algorithmic matrix.
                                        </p>
                                    </div>
                                </div>

                                {/* 3D Tilted Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto w-full">
                                    <motion.div
                                        whileHover={{ rotateY: -3, rotateX: 3, scale: 1.02, z: 20 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        <Button 
                                            onClick={handleCreateArena} 
                                            className="group relative h-56 w-full rounded-[2.5rem] bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] hover:border-primary/40 transition-all duration-500 overflow-hidden flex flex-col items-center justify-center gap-5 cursor-pointer"
                                            style={{ boxShadow: '0 8px 40px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)' }}
                                        >
                                            {/* Animated gradient border top */}
                                            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
                                            {/* Hover glow */}
                                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-all duration-500 rounded-[2.5rem]" />
                                            
                                            <div className="relative p-5 rounded-[1.2rem] bg-primary/15 text-primary group-hover:scale-110 group-hover:bg-primary/25 transition-all duration-300" style={{ boxShadow: '0 0 30px rgba(var(--primary-rgb, 124,58,237), 0.2)' }}>
                                                <Zap className="h-9 w-9 fill-current" />
                                            </div>
                                            <div className="text-center relative">
                                                <span className="block text-2xl font-black text-white uppercase italic tracking-tight">Host Mission</span>
                                                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1.5">Configure & Deploy</span>
                                            </div>
                                        </Button>
                                    </motion.div>

                                    <motion.div
                                        whileHover={{ rotateY: 3, rotateX: 3, scale: 1.02, z: 20 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        <Button 
                                            onClick={handleJoinArena} 
                                            className="group relative h-56 w-full rounded-[2.5rem] bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] hover:border-rose-500/40 transition-all duration-500 overflow-hidden flex flex-col items-center justify-center gap-5 cursor-pointer"
                                            style={{ boxShadow: '0 8px 40px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)' }}
                                        >
                                            {/* Animated gradient border top */}
                                            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-60" />
                                            {/* Hover glow */}
                                            <div className="absolute inset-0 bg-rose-500/0 group-hover:bg-rose-500/5 transition-all duration-500 rounded-[2.5rem]" />

                                            <div className="relative p-5 rounded-[1.2rem] bg-rose-500/15 text-rose-500 group-hover:scale-110 group-hover:bg-rose-500/25 transition-all duration-300" style={{ boxShadow: '0 0 30px rgba(244,63,94,0.15)' }}>
                                                <Globe className="h-9 w-9" />
                                            </div>
                                            <div className="text-center relative">
                                                <span className="block text-2xl font-black text-white uppercase italic tracking-tight">Infiltrate</span>
                                                <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-1.5">Join Existing Room</span>
                                            </div>
                                        </Button>
                                    </motion.div>
                                </div>

                                {/* Subtle bottom stats */}
                                <div className="flex items-center justify-center gap-8 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-600">
                                    <span>SSE Live</span>
                                    <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                                    <span>Multi-Platform</span>
                                    <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                                    <span>AI Referee</span>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {gameState === 'create' && (
                        <div className="max-w-xl mx-auto py-20 space-y-10 px-6">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" onClick={() => setGameState('lobby')} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white">
                                    <ChevronRight className="h-5 w-5 rotate-180" />
                                </Button>
                                <div className="space-y-0.5">
                                    <Badge className="bg-primary/20 text-primary border-none text-[8px] font-black uppercase tracking-[0.2em]">HOSTING PROTOCOL</Badge>
                                    <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Configure Arena</h2>
                                </div>
                            </div>
                            <Card className="border-white/10 bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Settings className="h-32 w-32 animate-[spin_20s_linear_infinite]" />
                                </div>
                                <div className="space-y-6 relative z-10">
                                    <div className="grid gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-primary px-1">Arena Signature</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                                <Input 
                                                    value={roomConfig.id}
                                                    readOnly
                                                    className="h-14 pl-12 bg-black/40 border-white/10 rounded-2xl font-black tracking-wider text-white"
                                                />
                                            </div>
                                            <Button variant="outline" onClick={generateRoomId} className="h-14 w-14 rounded-2xl border-white/10 bg-white/5"><RotateCcw className="h-5 w-5" /></Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary">Mission Deck</label>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => setRoomConfig(prev => ({ ...prev, questions: [...prev.questions, { difficulty: 'Medium' }] }))}
                                                className="h-6 text-[9px] font-black uppercase tracking-wider text-primary hover:text-white hover:bg-primary/20 rounded-full"
                                                disabled={roomConfig.questions.length >= 5}
                                            >
                                                + Add Objective
                                            </Button>
                                        </div>
                                        <ScrollArea className="max-h-[220px] pr-4">
                                            <div className="space-y-3">
                                                {roomConfig.questions.map((q, idx) => (
                                                    <div key={idx} className="flex gap-3 items-center group">
                                                        <div className="h-14 w-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center font-black text-xs text-slate-500 group-hover:text-primary transition-colors shrink-0">
                                                            OBJ{idx + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <Select 
                                                                value={q.difficulty} 
                                                                onValueChange={(v) => {
                                                                    const newQs = [...roomConfig.questions];
                                                                    newQs[idx].difficulty = v;
                                                                    setRoomConfig(prev => ({ ...prev, questions: newQs }));
                                                                }}
                                                            >
                                                                <SelectTrigger className="h-14 bg-black/40 border-white/10 rounded-2xl text-white"><SelectValue /></SelectTrigger>
                                                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                                                    <SelectItem value="Easy">Novice (Easy)</SelectItem>
                                                                    <SelectItem value="Medium">Tactical (Medium)</SelectItem>
                                                                    <SelectItem value="Hard">Elite (Hard)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        {roomConfig.questions.length > 1 && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => {
                                                                    const newQs = [...roomConfig.questions];
                                                                    newQs.splice(idx, 1);
                                                                    setRoomConfig(prev => ({ ...prev, questions: newQs }));
                                                                }}
                                                                className="h-14 w-14 rounded-2xl border border-white/5 hover:bg-rose-500/10 hover:text-rose-500 text-slate-500 shrink-0"
                                                            >
                                                                <RotateCcw className="h-4 w-4 rotate-45" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary px-1">Source</label>
                                            <Select value={roomConfig.source} onValueChange={(v) => setRoomConfig(prev => ({ ...prev, source: v }))}>
                                                <SelectTrigger className="h-14 bg-black/40 border-white/10 rounded-2xl text-white"><SelectValue /></SelectTrigger>
                                                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                                                    <SelectItem value="ai">Astra AI</SelectItem>
                                                    <SelectItem value="leetcode">LeetCode</SelectItem>
                                                    <SelectItem value="gfg">GeeksForGeeks</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-primary px-1">Assignment</label>
                                            <div className="flex bg-black/40 rounded-2xl p-1 border border-white/10 h-14">
                                                <button onClick={() => setRoomConfig(prev => ({ ...prev, team: 'Shadow' }))} className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${roomConfig.team === 'Shadow' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500'}`}>Shadow</button>
                                                <button onClick={() => setRoomConfig(prev => ({ ...prev, team: 'Crimson' }))} className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${roomConfig.team === 'Crimson' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-slate-500'}`}>Crimson</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={handleJoinBattle} disabled={loading} className="w-full h-20 rounded-[2rem] text-xl font-black gap-4 shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 border-none group">
                                    {loading ? <RotateCcw className="h-6 w-6 animate-spin" /> : <Play className="h-6 w-6 fill-current group-hover:scale-110 transition-transform" />}
                                    INITIATE MISSION
                                </Button>
                            </Card>
                        </div>
                    )}

                    {gameState === 'join' && (
                        <div className="max-w-xl mx-auto py-20 space-y-10 px-6">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" onClick={() => setGameState('lobby')} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white">
                                    <ChevronRight className="h-5 w-5 rotate-180" />
                                </Button>
                                <div className="space-y-0.5">
                                    <Badge className="bg-rose-500/20 text-rose-500 border-none text-[8px] font-black uppercase tracking-[0.2em]">INFILTRATION PROTOCOL</Badge>
                                    <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">Infiltrate Arena</h2>
                                </div>
                            </div>
                            <Card className="border-white/10 bg-white/5 backdrop-blur-2xl rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Users className="h-32 w-32" />
                                </div>
                                <div className="space-y-8 relative z-10">
                                    <div className="grid gap-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-rose-500 px-1">Target Signature (Room ID)</label>
                                        <div className="relative">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-500" />
                                            <Input 
                                                value={roomConfig.id}
                                                onChange={(e) => setRoomConfig(prev => ({ ...prev, id: e.target.value.toUpperCase() }))}
                                                placeholder="ENTER SIGNATURE..." 
                                                className="h-16 pl-14 bg-black/60 border-rose-500/20 focus:border-rose-500 focus:ring-rose-500/10 rounded-2xl font-black tracking-[0.3em] text-white uppercase"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-rose-500 px-1">Operational Team</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button 
                                                onClick={() => setRoomConfig(prev => ({ ...prev, team: 'Shadow' }))} 
                                                className={`h-20 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
                                                    roomConfig.team === 'Shadow' 
                                                    ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10' 
                                                    : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/10'
                                                }`}
                                            >
                                                <span className="text-xs font-black uppercase italic">Shadow</span>
                                                <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Stealth Ops</span>
                                            </button>
                                            <button 
                                                onClick={() => setRoomConfig(prev => ({ ...prev, team: 'Crimson' }))} 
                                                className={`h-20 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 ${
                                                    roomConfig.team === 'Crimson' 
                                                    ? 'bg-rose-500/20 border-rose-500 text-rose-500 shadow-lg shadow-rose-500/10' 
                                                    : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/10'
                                                }`}
                                            >
                                                <span className="text-xs font-black uppercase italic">Crimson</span>
                                                <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest">Direct Strike</span>
                                            </button>
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={handleJoinBattle} 
                                        disabled={loading || !roomConfig.id} 
                                        className="w-full h-20 rounded-[2rem] text-xl font-black gap-4 shadow-2xl shadow-rose-500/20 bg-rose-500 hover:bg-rose-500/90 border-none group mt-4"
                                    >
                                        {loading ? <RotateCcw className="h-6 w-6 animate-spin" /> : <Zap className="h-6 w-6 fill-current group-hover:scale-110 transition-transform" />}
                                        COMMENCE OPERATION
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {gameState === 'active' && (
                        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                            {/* Left Panel */}
                            <div className="w-[45%] flex flex-col border-r border-white/5 bg-[#282828]">
                                <Tabs defaultValue="description" className="flex-1 flex flex-col overflow-hidden">
                                    <div className="h-10 px-2 flex items-center bg-[#333] shrink-0 border-b border-white/5 justify-between">
                                        <TabsList className="bg-transparent h-full p-0 gap-1">
                                            {['description', 'editorial', 'submissions'].map(tab => (
                                                <TabsTrigger key={tab} value={tab} className="h-full px-4 text-[11px] font-medium capitalize data-[state=active]:bg-[#282828] data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-none">
                                                    {tab === 'description' && <BookOpen className="h-3 w-3 mr-2 text-slate-400" />}
                                                    {tab === 'editorial' && <Zap className="h-3 w-3 mr-2 text-primary" />}
                                                    {tab}
                                                </TabsTrigger>
                                            ))}
                                        </TabsList>
                                        
                                        {questions.length > 1 && (
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                                                    {questions.map((q, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setCurrentQuestionIndex(idx)}
                                                            className={`h-6 px-3 rounded md text-[10px] font-black transition-all flex items-center gap-1.5 ${
                                                                currentQuestionIndex === idx 
                                                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                                                : 'text-slate-500 hover:text-white hover:bg-white/5'
                                                            }`}
                                                        >
                                                            Q{idx + 1}
                                                            {submittedQuestions.includes(q.id) && <Check className="h-2.5 w-2.5 text-emerald-400" />}
                                                        </button>
                                                    ))}
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => setShowExitDialog(true)}
                                                    className="h-8 px-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white text-[10px] font-black uppercase tracking-tighter border border-rose-500/20 rounded-lg transition-all"
                                                >
                                                    Conclude Mission
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    <TabsContent value="description" className="flex-1 overflow-y-auto custom-scrollbar m-0 p-6 space-y-6">
                                        <div className="space-y-4">
                                            <h1 className="text-2xl font-semibold flex items-center gap-2 text-white">
                                                <span className="text-slate-400 font-mono text-lg">{questions[currentQuestionIndex]?.id}.</span> {questions[currentQuestionIndex]?.title}
                                            </h1>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                <Badge className={`rounded-full px-3 py-1 text-[11px] font-medium border-none ${
                                                    questions[currentQuestionIndex]?.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                    questions[currentQuestionIndex]?.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-rose-500/10 text-rose-500'
                                                }`}>
                                                    {questions[currentQuestionIndex]?.difficulty}
                                                </Badge>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge variant="outline" className="rounded-full bg-white/5 border-white/10 text-slate-400 text-[10px] gap-1 px-3 cursor-help">
                                                            <Zap className="h-3 w-3" /> Topics
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 border-white/10 text-[10px] max-w-[200px] flex flex-wrap gap-1">
                                                        {questions[currentQuestionIndex]?.topics?.map(t => <span key={t} className="px-1.5 py-0.5 bg-white/5 rounded">{t}</span>)}
                                                    </TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge variant="outline" className="rounded-full bg-white/5 border-white/10 text-slate-400 text-[10px] gap-1 px-3 cursor-help">
                                                            <Lock className="h-3 w-3" /> Companies
                                                        </Badge>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="bg-slate-900 border-white/10 text-[10px]">
                                                        {questions[currentQuestionIndex]?.companies?.join(", ") || "Locked"}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <div className="flex items-center gap-6 pt-2 border-b border-white/5 pb-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest text-[#8a8a8a]">Accepted</p>
                                                    <p className="text-sm font-bold text-slate-200">20.7M</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest text-[#8a8a8a]">Acceptance Rate</p>
                                                    <p className="text-sm font-bold text-slate-200">{questions[currentQuestionIndex]?.acceptanceRate || "57.0%"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-sm leading-relaxed text-slate-300 space-y-4 whitespace-pre-wrap">
                                            {questions[currentQuestionIndex]?.description}
                                        </div>

                                        {questions[currentQuestionIndex]?.examples?.map((ex, i) => (
                                            <div key={i} className="space-y-3">
                                                <p className="text-sm font-semibold text-white">Example {i + 1}:</p>
                                                <div className="bg-[#333] border border-white/5 p-4 font-mono text-xs rounded-lg space-y-2 text-[#eff1f6]">
                                                    <p><span className="font-bold text-white">Input:</span> {ex.input}</p>
                                                    <p><span className="font-bold text-white">Output:</span> {ex.output}</p>
                                                    {ex.explanation && <p><span className="font-bold text-white">Explanation:</span> {ex.explanation}</p>}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="space-y-3">
                                            <p className="text-sm font-semibold text-white">Constraints:</p>
                                            <ul className="list-disc list-inside space-y-2 text-xs text-slate-400 font-mono bg-white/5 p-4 rounded-lg">
                                                {questions[currentQuestionIndex]?.constraints?.map((c, i) => <li key={i}>{c}</li>)}
                                            </ul>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="editorial" className="flex-1 overflow-y-auto custom-scrollbar m-0 p-6 space-y-10">
                                        {!questions[currentQuestionIndex]?.editorial ? (
                                            <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-2">
                                                <Bot className="h-8 w-8 opacity-20" />
                                                <p className="text-xs">Generating deep analysis...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <section className="space-y-4">
                                                    <div className="flex items-center gap-2 text-emerald-500">
                                                        <Zap className="h-4 w-4" />
                                                        <h3 className="text-sm font-black uppercase tracking-widest">Master Approach</h3>
                                                    </div>
                                                    <p className="text-sm leading-relaxed text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/5 whitespace-pre-wrap font-inter">
                                                        {questions[currentQuestionIndex]?.editorial?.approach}
                                                    </p>
                                                </section>

                                                <section className="space-y-4">
                                                    <div className="flex items-center gap-2 text-primary">
                                                        <RotateCcw className="h-4 w-4" />
                                                        <h3 className="text-sm font-black uppercase tracking-widest">Detailed Trace</h3>
                                                    </div>
                                                    <div className="bg-[#1a1a1a] p-5 rounded-2xl border border-white/10 font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre-wrap break-words">
                                                        {questions[currentQuestionIndex]?.editorial?.dryRun}
                                                    </div>
                                                </section>

                                                <section className="space-y-4">
                                                    <div className="flex items-center gap-2 text-amber-500">
                                                        <Clock className="h-4 w-4" />
                                                        <h3 className="text-sm font-black uppercase tracking-widest">Complexity Analysis</h3>
                                                    </div>
                                                    <div className="flex flex-col gap-3">
                                                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                                                            <p className="text-[10px] uppercase font-black text-slate-500">Time Complexity</p>
                                                            <p className="font-mono text-emerald-500 text-xs font-bold">{questions[currentQuestionIndex]?.editorial?.complexity?.split('\n')[0] || "O(N^2)"}</p>
                                                        </div>
                                                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center group hover:bg-white/10 transition-all">
                                                            <p className="text-[10px] uppercase font-black text-slate-500">Space Complexity</p>
                                                            <p className="font-mono text-primary text-xs font-bold">{questions[currentQuestionIndex]?.editorial?.complexity?.split('\n')[1] || "O(1)"}</p>
                                                        </div>
                                                    </div>
                                                </section>

                                                <section className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-blue-500">
                                                            <Terminal className="h-4 w-4" />
                                                            <h3 className="text-sm font-black uppercase tracking-widest">C++ Reference Implementation</h3>
                                                        </div>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="sm" 
                                                            className="h-8 px-3 text-[10px] font-bold text-slate-400 hover:text-white bg-white/5 border border-white/5 rounded-full gap-2"
                                                            onClick={() => {
                                                                const sanitized = (questions[currentQuestionIndex]?.editorial?.solution || "")
                                                                    .replace(/^```[a-z]*\n/i, '')
                                                                    .replace(/\n```$/i, '')
                                                                    .trim();
                                                                navigator.clipboard.writeText(sanitized);
                                                                toast.success("Code synced to matrix clipboard.");
                                                            }}
                                                        >
                                                            <Copy className="h-3 w-3" /> Copy
                                                        </Button>
                                                    </div>
                                                    <div className="relative group">
                                                        <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                                        <div className="relative p-6 rounded-[2rem] bg-[#0d0d0d] border border-white/10 font-mono text-[12px] text-emerald-400/90 leading-relaxed overflow-x-auto custom-scrollbar whitespace-pre">
                                                            {(questions[currentQuestionIndex]?.editorial?.solution || "")
                                                                .replace(/^```[a-z]*\n/i, '')
                                                                .replace(/\n```$/i, '')
                                                                .trim()}
                                                        </div>
                                                    </div>
                                                </section>
                                            </>
                                        )}
                                        <div className="h-20" />
                                    </TabsContent>
                                </Tabs>
                            </div>

                            {/* Right Panel */}
                            <div className="flex-1 flex flex-col overflow-hidden bg-[#282828] relative">
                                <div className="h-10 border-b border-white/5 flex items-center justify-between px-2 bg-[#333] shrink-0">
                                    <div className="flex items-center gap-1">
                                        <Select value={language.id} onValueChange={(lid) => {
                                            const lang = LANGUAGES.find(l => l.id === lid);
                                            setLanguage(lang);
                                            const qId = questions[currentQuestionIndex]?.id;
                                            if (qId) {
                                                setCodeMap(prev => ({
                                                    ...prev,
                                                    [qId]: questions[currentQuestionIndex]?.boilerplates?.[lang.id] || lang.default
                                                }));
                                            }
                                        }}>
                                            <SelectTrigger className="w-[120px] h-7 bg-transparent border-none text-[12px] font-medium text-white hover:bg-white/5 focus:ring-0">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                                                {LANGUAGES.map(lang => <SelectItem key={lang.id} value={lang.id}>{lang.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Separator orientation="vertical" className="h-4 bg-white/10 mx-1" />
                                        <div className="flex items-center gap-1 opacity-40">
                                            <RotateCcw className="h-3.5 w-3.5" />
                                            <span className="text-[10px] font-medium">Auto</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400"><Settings className="h-4 w-4" /></Button>
                                    </div>
                                </div>

                                <div className="flex-1 relative bg-[#1e1e1e] overflow-hidden">
                                    <CodeEditor
                                        value={codeMap[questions[currentQuestionIndex]?.id] || ""}
                                        onChange={(newCode) => {
                                            setCodeMap(prev => ({
                                                ...prev,
                                                [questions[currentQuestionIndex].id]: newCode
                                            }));
                                        }}
                                        language={language.id}
                                    />
                                </div>

                                <div className="h-48 flex flex-col bg-[#282828] border-t border-white/10 shrink-0">
                                    <Tabs value={resultTab} onValueChange={setResultTab} className="flex-1 flex flex-col overflow-hidden">
                                        <div className="h-10 px-2 flex items-center bg-[#333] shrink-0 border-b border-white/5 justify-between">
                                            <TabsList className="bg-transparent h-full p-0 gap-1">
                                                <TabsTrigger value="testcase" className="h-full px-4 text-[11px] font-medium data-[state=active]:bg-[#282828] text-slate-400 data-[state=active]:text-white">
                                                    <Terminal className="h-3 w-3 mr-2 text-emerald-500" /> Testcase
                                                </TabsTrigger>
                                                <TabsTrigger value="result" className="h-full px-4 text-[11px] font-medium data-[state=active]:bg-[#282828] text-slate-400 data-[state=active]:text-white">
                                                    <Medal className="h-3 w-3 mr-2 text-primary" /> Test Result
                                                </TabsTrigger>
                                                <TabsTrigger value="leaderboard" className="h-full px-4 text-[11px] font-medium data-[state=active]:bg-[#282828] text-slate-400 data-[state=active]:text-white">
                                                    <Users className="h-3 w-3 mr-2 text-primary" /> Competition
                                                </TabsTrigger>
                                            </TabsList>
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="sm" onClick={handleRunTests} className="h-7 px-4 bg-white/5 border-white/10 text-[10px] font-bold text-white hover:bg-white/10">Run</Button>
                                                <Button size="sm" onClick={handleSubmit} className="h-7 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold">Submit</Button>
                                            </div>
                                        </div>
                                        <TabsContent value="testcase" className="flex-1 p-4 m-0 overflow-y-auto custom-scrollbar">
                                            {questions[currentQuestionIndex]?.examples?.slice(0, 1).map((ex, i) => (
                                                <div key={i} className="space-y-2">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Input</p>
                                                    <div className="p-3 bg-white/5 border border-white/10 rounded-lg font-mono text-xs text-slate-300">{ex.input}</div>
                                                </div>
                                            ))}
                                        </TabsContent>
                                        <TabsContent value="result" className="flex-1 p-6 m-0 overflow-y-auto custom-scrollbar bg-black/40">
                                            {consoleOutput.length === 0 ? (
                                                <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-500">
                                                    <Cpu className="h-8 w-8 opacity-20" />
                                                    <p className="text-xs font-medium uppercase tracking-widest opacity-50">Observation Node Idle</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {result && (
                                                        <div className="space-y-4">
                                                            <div className="flex justify-between items-end">
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Validation Status</p>
                                                                    <p className={`text-xl font-black uppercase tracking-tighter ${result.isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                        {result.isCorrect ? 'Accepted' : (result.errorType || 'Wrong Answer')}
                                                                    </p>
                                                                </div>
                                                                {result.totalCount > 0 && (
                                                                    <div className="text-right">
                                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Pass Rate</p>
                                                                        <p className="font-mono text-lg text-white font-bold">{result.passCount}/{result.totalCount}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {result.totalCount > 0 && (
                                                                <div className="space-y-2">
                                                                    <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-[inner_0_2px_4px_rgba(0,0,0,0.5)]">
                                                                        <motion.div 
                                                                            initial={{ width: 0 }} 
                                                                            animate={{ width: `${(result.passCount / result.totalCount) * 100}%` }} 
                                                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                                                            className={`h-full rounded-full ${result.isCorrect ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]'}`} 
                                                                        />
                                                                    </div>
                                                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                                                        {result.passCount} of {result.totalCount} test cases passed ({((result.passCount / result.totalCount) * 100).toFixed(1)}%)
                                                                        {result.failedTestNumber && ` · First failure at test #${result.failedTestNumber}`}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {!result.isCorrect && result.failedTests?.length > 0 && (
                                                                <div className="space-y-3 pt-2">
                                                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Failed Test Cases</p>
                                                                    <div className="space-y-3">
                                                                        {result.failedTests.map((ft, i) => (
                                                                            <div key={i} className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 space-y-3">
                                                                                <div className="flex items-center justify-between">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <div className="h-6 w-6 rounded-lg bg-rose-500/20 flex items-center justify-center">
                                                                                            <span className="text-[9px] font-black text-rose-500">#{ft.testNumber || (i + 1)}</span>
                                                                                        </div>
                                                                                        <Badge className="bg-rose-500/10 text-rose-400 border-none text-[9px] font-black uppercase">{ft.reason || 'WA'}</Badge>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="space-y-2">
                                                                                    <div className="space-y-1">
                                                                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Input</p>
                                                                                        <code className="text-[11px] text-slate-300 block bg-black/60 p-3 rounded-xl font-mono leading-relaxed whitespace-pre-wrap break-all">{ft.input}</code>
                                                                                    </div>
                                                                                    <div className="grid grid-cols-2 gap-3">
                                                                                        <div className="space-y-1">
                                                                                            <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Expected Output</p>
                                                                                            <code className="text-[11px] text-emerald-400/80 block bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl font-mono whitespace-pre-wrap break-all">{ft.expected}</code>
                                                                                        </div>
                                                                                        <div className="space-y-1">
                                                                                            <p className="text-[8px] font-bold text-rose-500 uppercase tracking-widest">Your Output</p>
                                                                                            <code className="text-[11px] text-rose-400/80 block bg-rose-500/5 border border-rose-500/10 p-3 rounded-xl font-mono whitespace-pre-wrap break-all">{ft.actual}</code>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="font-mono text-[11px] leading-relaxed space-y-2 bg-black/20 p-4 rounded-xl border border-white/5">
                                                        {consoleOutput.map((line, i) => (
                                                            <div key={i} className={line.startsWith('>') ? 'text-primary font-bold' : 'text-slate-400'}>{line}</div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </TabsContent>
                                        <TabsContent value="leaderboard" className="flex-1 p-4 m-0 overflow-y-auto custom-scrollbar bg-black/40">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center px-2">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Competitors</p>
                                                    <div className="flex gap-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase">Shadow</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                            <span className="text-[8px] font-bold text-slate-400 uppercase">Crimson</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="grid gap-2">
                                                    {roomState?.members && Object.values(roomState.members)
                                                        .sort((a, b) => (b.points || 0) - (a.points || 0))
                                                        .map((m, idx) => (
                                                        <div key={m.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-[10px] ${
                                                                    m.team === 'Shadow' ? 'bg-primary/20 text-primary' : 'bg-rose-500/20 text-rose-500'
                                                                }`}>
                                                                    {idx + 1}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[11px] font-black text-white uppercase tracking-tight">{m.name}</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-16 h-1 bg-black/40 rounded-full overflow-hidden">
                                                                            <div className={`h-full ${m.team === 'Shadow' ? 'bg-primary' : 'bg-rose-500'}`} style={{ width: `${m.progress}%` }} />
                                                                        </div>
                                                                        <span className="text-[8px] font-mono text-slate-500">{m.progress}%</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[11px] font-black font-mono text-white leading-none">{m.points || 0}</p>
                                                                <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Points</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>

                            </div>
                        </div>
                    )}

                    <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                        <DialogContent className="bg-[#1a1a1a] border-white/10 text-white max-w-md rounded-[2rem]">
                            <DialogHeader className="space-y-3">
                                <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                                    <ShieldAlert className="h-8 w-8 text-rose-500" />
                                </div>
                                <DialogTitle className="text-2xl font-black text-center uppercase italic text-white">Terminate Session?</DialogTitle>
                                <DialogDescription className="text-center text-slate-400 text-sm">
                                    You are about to conclude your mission. Your current total of <span className="text-primary font-bold">{totalPoints} Rank Points</span> will be finalized. This action is irreversible.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="flex gap-3 sm:justify-center pt-4">
                                <Button variant="ghost" onClick={() => setShowExitDialog(false)} className="flex-1 h-12 rounded-xl font-bold hover:bg-white/5 transition-all text-slate-400">Abort</Button>
                                <Button onClick={handleConcludeMission} className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-black uppercase italic shadow-lg shadow-primary/20 border-none">Finalize Extraction</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {gameState === 'finished' && (
                        <div className="min-h-screen bg-black text-white p-8 overflow-y-auto custom-scrollbar">
                            <header className="mb-20 flex justify-between items-end">
                                <div className="space-y-4">
                                    <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">MISSION CONCLUDED</Badge>
                                    <h1 className="text-8xl font-black italic tracking-tighter leading-none uppercase">ASTRA<br/><span className="text-primary">JUDGMENT</span></h1>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Arena Protocol</p>
                                    <p className="text-xl font-bold font-mono">BATTLE-X-{roomConfig.id}</p>
                                </div>
                            </header>

                            <main className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card className="bg-[#111] border-white/5 rounded-[2rem] p-8 flex flex-col justify-between border-t-2 border-t-primary relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Trophy className="h-20 w-20 text-primary" />
                                            </div>
                                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Astra Cumulative</h2>
                                            <div className="space-y-1">
                                                <span className="text-7xl font-black font-mono italic text-white">{totalPoints}</span>
                                                <p className="text-sm font-bold text-slate-400">Aggregated Rank Points</p>
                                            </div>
                                        </Card>
                                        <Card className="bg-[#111] border-white/5 rounded-[2rem] p-8 flex flex-col justify-between">
                                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Mission Progress</h2>
                                            <div className="space-y-1">
                                                <span className="text-5xl font-black italic uppercase text-white">
                                                    {submittedQuestions.length}<span className="text-slate-500">/{questions.length}</span>
                                                </span>
                                                <p className="text-sm font-bold text-slate-400">Challenges Verified</p>
                                            </div>
                                        </Card>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-8 rounded-[2rem] border border-white/5 bg-[#111]">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Efficiency Rank</h3>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Time</span>
                                                    <Badge variant="outline" className="text-emerald-400 border-emerald-400/20 font-mono">{result?.timeComplexity || 'O(N)'}</Badge>
                                                </div>
                                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Space</span>
                                                    <Badge variant="outline" className="text-primary border-primary/20 font-mono">{result?.spaceComplexity || 'O(1)'}</Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8 rounded-[2rem] border border-white/5 bg-[#111] flex flex-col">
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center justify-between">Referee Voice <Cpu className="h-3 w-3" /></h3>
                                            <p className="text-sm font-medium leading-relaxed italic text-slate-300">&quot;{result?.feedback}&quot;</p>
                                        </div>
                                    </div>

                                    <div className="p-8 rounded-[2rem] border border-white/5 bg-[#111]">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Global Rankings</h3>
                                        <div className="space-y-2">
                                            {roomState?.members && Object.values(roomState.members)
                                                .sort((a, b) => (b.points || 0) - (a.points || 0))
                                                .map((m, idx) => (
                                                <div key={m.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-[10px] ${
                                                            m.team === 'Shadow' ? 'bg-primary/20 text-primary' : 'bg-rose-500/20 text-rose-500'
                                                        }`}>
                                                            #{idx + 1}
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-black text-white uppercase tracking-tight">{m.name}</p>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-16 h-1 bg-black/40 rounded-full overflow-hidden">
                                                                    <div className={`h-full ${m.team === 'Shadow' ? 'bg-primary' : 'bg-rose-500'}`} style={{ width: `${m.progress}%` }} />
                                                                </div>
                                                                <span className="text-[8px] font-mono text-slate-500">{m.progress}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[11px] font-black font-mono text-white leading-none">{m.points || 0}</p>
                                                        <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Points</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <Card className="border-emerald-500/10 bg-black/40 backdrop-blur-2xl rounded-[3rem] p-10">
                                        <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-8 flex items-center gap-2"><Zap className="h-4 w-4 fill-current" /> Elite Reference Solution</h3>
                                        <div className="p-5 rounded-2xl bg-black/60 border border-white/10 font-mono text-[10px] text-emerald-500/80 whitespace-pre overflow-x-auto custom-scrollbar max-h-60 leading-relaxed">
                                            {result?.idealSolution || "// Ideal solution pending..."}
                                        </div>
                                    </Card>
                                    <Button className="w-full h-20 rounded-[2.5rem] font-black text-xl gap-3 shadow-2xl shadow-primary/30 group bg-primary hover:bg-primary/90" onClick={() => setGameState('lobby')}>
                                        <RotateCcw className="h-6 w-6 transition-transform group-hover:rotate-180 duration-500" /> RE-ENTER LOBBY
                                    </Button>
                                </div>
                            </main>
                        </div>
                    )}
                </div>
            </TooltipProvider>
        </AppShell>
    )
}
