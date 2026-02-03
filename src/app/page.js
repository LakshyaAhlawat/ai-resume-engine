
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Bot, CheckCircle2, Zap, Sparkles, ShieldCheck, MessageSquare, BarChart3, Globe, Lock } from "lucide-react"
import { motion } from "framer-motion"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-slate-50 selection:bg-primary/30 selection:text-white overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <header className="px-6 h-20 flex items-center border-b border-white/5 backdrop-blur-xl bg-black/40 fixed w-full z-50 transition-all">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 font-bold text-xl tracking-tight"
        >
          <div className="p-1.5 bg-primary/20 rounded-lg border border-primary/30">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <span className="bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent italic">ResumeAI</span>
        </motion.div>
        
        <nav className="ml-auto hidden md:flex gap-8 items-center mr-8">
          {['Features', 'Intelligence', 'Security'].map((item) => (
            <Link key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4"
        >
            <Link href="/login">
                <Button variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5">Log In</Button>
            </Link>
            <Link href="/login">
                <Button className="shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] transition-all">Get Started</Button>
            </Link>
        </motion.div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative w-full min-h-screen pt-40 pb-20 grid place-items-center">
          <div className="container px-4 md:px-6 relative">
            <div className="flex flex-col items-center space-y-10 text-center">
              <motion.div 
                {...fadeInUp}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold tracking-wider uppercase animate-bounce"
              >
                <Sparkles className="h-3.5 w-3.5" /> Next Gen Recruitment
              </motion.div>

              <div className="space-y-6 max-w-4xl">
                <motion.h1 
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 1 }}
                  className="text-5xl md:text-8xl font-black tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent leading-[1.1]"
                >
                  Hire Smarter with <br /> 
                  <span className="text-primary italic">Precision AI</span>
                </motion.h1>
                <motion.p 
                  {...fadeInUp}
                  transition={{ delay: 0.2 }}
                  className="mx-auto max-w-[800px] text-slate-400 md:text-xl lg:text-2xl font-light leading-relaxed"
                >
                  Automate your talent pipeline with LLM-driven forensic analysis. <br className="hidden md:block" />
                  No bias, just raw engineering evaluation and cultural fit projection.
                </motion.p>
              </div>

              <motion.div 
                {...fadeInUp}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center justify-center gap-6"
              >
                <Link href="/login">
                    <Button size="lg" className="h-14 px-10 text-lg rounded-2xl group shadow-2xl">
                    Get Started <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                </Link>
                <Link href="/dashboard">
                    <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-2xl border-white/10 hover:bg-white/5 backdrop-blur-sm">
                    View Enterprise Demo
                    </Button>
                </Link>
              </motion.div>

              {/* Cinematic Image Frame */}
              <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
                className="w-full max-w-6xl mt-16 p-2 rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                <div className="rounded-[2rem] overflow-hidden border border-white/5">
                  <img src="/hero_bg.png" alt="Futuristic AI Dashboard" className="w-full aspect-[21/9] object-cover hover:scale-105 transition-transform duration-1000" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full py-24 md:py-32 relative">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-20 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Powerful Core Features</h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">Built on the 'gemini-1.5-pro' backbone for unprecedented reasoning depth.</p>
            </div>
            
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {[
                { 
                  icon: Zap, 
                  title: "Instant Scoring", 
                  desc: "Semantic match scoring that understands project complexity and team impact.",
                  color: "text-blue-500",
                  bg: "bg-blue-500/10"
                },
                { 
                  icon: ShieldCheck, 
                  title: "Bias Suppression", 
                  desc: "Automated auditing for gender, age, and ethnic bias in every shortlisting round.",
                  color: "text-green-500",
                  bg: "bg-green-500/10"
                },
                { 
                  icon: MessageSquare, 
                  title: "Interview Gen", 
                  desc: "15+ tailored questions per round with expected answer key insights.",
                  color: "text-purple-500",
                  bg: "bg-purple-500/10"
                }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  variants={fadeInUp}
                  className="group relative p-8 rounded-3xl border border-white/5 bg-white/5 hover:bg-white/[0.08] transition-all hover:-translate-y-2 cursor-pointer overflow-hidden"
                >
                  <div className={`p-3 rounded-xl w-fit mb-6 ${feature.bg}`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-light">{feature.desc}</p>
                   {/* Gradient Decorative element */}
                   <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl transition-all group-hover:bg-primary/20" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Intelligence Visualization */}
        <section id="intelligence" className="w-full py-24 bg-gradient-to-b from-transparent to-primary/5">
           <div className="container px-4 md:px-6 mx-auto">
              <div className="grid lg:grid-cols-2 gap-20 items-center">
                 <motion.div 
                   initial={{ opacity: 0, x: -50 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   viewport={{ once: true }}
                   className="space-y-8"
                 >
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                       <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black leading-tight tracking-tighter">
                       Predictive Talent <br /> <span className="text-primary italic">Forecasting</span>
                    </h2>
                    <p className="text-slate-400 text-lg leading-relaxed font-light">
                       Our intelligence layer doesn't just read the past; it predicts the future. We analyze career growth patterns and project technical trajectory to help you find candidates who will lead, not just perform.
                    </p>
                    <ul className="space-y-4">
                       {[
                         { icon: CheckCircle2, text: "99.1% Bias Neutrality" },
                         { icon: Globe, text: "Multi-modal resume support" },
                         { icon: Lock, text: "Enterprise Grade Security" }
                       ].map((item, i) => (
                         <li key={i} className="flex items-center gap-3 text-slate-300">
                            <item.icon className="h-5 w-5 text-primary" /> {item.text}
                         </li>
                       ))}
                    </ul>
                 </motion.div>
                 
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                   whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                   viewport={{ once: true }}
                   className="relative"
                 >
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
                    <div className="relative rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-2xl p-4 overflow-hidden">
                       <img src="/feat_analytics.png" alt="Forecasting" className="rounded-[2.5rem] w-full" />
                    </div>
                 </motion.div>
              </div>
           </div>
        </section>

        {/* Security Section */}
        <section id="security" className="w-full py-24 relative overflow-hidden">
           <div className="container px-4 md:px-6 mx-auto">
              <div className="max-w-4xl mx-auto rounded-[3rem] border border-white/5 bg-white/5 p-8 md:p-16 text-center space-y-8 relative overflow-hidden group">
                 <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <div className="h-16 w-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto">
                    <Lock className="h-8 w-8 text-green-500" />
                 </div>
                 <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Enterprise Grade <span className="text-green-500">Security</span></h2>
                 <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto font-light">
                    Your candidate data is encrypted and stored in isolated instances. We use standard-compliant auth protocols and never use your private resumes for training our global models.
                 </p>
                 <div className="flex flex-wrap justify-center gap-4">
                    <div className="px-6 py-2 rounded-full border border-white/10 text-xs font-mono uppercase tracking-widest text-slate-500">GDPR Compliant</div>
                    <div className="px-6 py-2 rounded-full border border-white/10 text-xs font-mono uppercase tracking-widest text-slate-500">AES-256 Encryption</div>
                    <div className="px-6 py-2 rounded-full border border-white/10 text-xs font-mono uppercase tracking-widest text-slate-500">SOC2 Prepared</div>
                 </div>
              </div>
           </div>
        </section>

        {/* Call to Action */}
        <section className="w-full py-32 relative overflow-hidden">
           <div className="absolute inset-0 bg-primary rounded-full blur-[300px] opacity-10 -translate-y-1/2" />
           <div className="container px-4 md:px-6 mx-auto relative z-10 text-center space-y-10">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter">
                 Ready to eliminate <br /> <span className="text-primary italic">manual screening?</span>
              </h2>
              <p className="max-w-2xl mx-auto text-slate-400 text-xl font-light">
                 Join 500+ talent acquisition teams using ResumeAI to automate their technical hiring.
              </p>
              <div className="pt-6">
                <Link href="/login">
                  <Button size="lg" className="h-16 px-12 text-xl rounded-2xl shadow-primary/30 shadow-2xl">
                    Get Started Now
                  </Button>
                </Link>
              </div>
           </div>
        </section>
      </main>

      <footer className="w-full py-12 border-t border-white/5 bg-black/40 backdrop-blur-xl relative z-10">
        <div className="container px-4 md:px-6 mx-auto grid md:grid-cols-4 gap-12">
           <div className="space-y-4 col-span-2">
              <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                <div className="p-1 bg-primary/20 rounded-lg border border-primary/30">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <span className="italic">ResumeAI</span>
              </div>
              <p className="text-slate-500 text-sm max-w-xs font-light">
                 The world's first AI-native talent screening platform. Building the future of equitable recruitment.
              </p>
           </div>
           
           <div className="space-y-4">
              <h4 className="font-bold text-slate-200">Legal</h4>
              <nav className="flex flex-col gap-2">
                 <Link href="/privacy" className="text-slate-500 hover:text-primary transition-colors text-sm">Privacy Policy</Link>
                 <Link href="/terms" className="text-slate-500 hover:text-primary transition-colors text-sm">Terms of Service</Link>
                 <Link href="/docs" className="text-slate-500 hover:text-primary transition-colors text-sm">User Guide</Link>
              </nav>
           </div>

           <div className="space-y-4 text-right md:text-left">
              <h4 className="font-bold text-slate-200">Contact</h4>
              <p className="text-slate-500 text-sm">hello@resumeai.engine</p>
              <div className="flex gap-4 justify-end md:justify-start pt-2">
                 <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary/20 cursor-pointer transition-colors"><Globe className="h-4 w-4" /></div>
                 <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary/20 cursor-pointer transition-colors"><ShieldCheck className="h-4 w-4" /></div>
              </div>
           </div>
        </div>
        <div className="container px-4 md:px-6 mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-slate-600 text-xs">© 2026 ResumeAI Engine. Designed by Antigravity.</p>
           <p className="text-slate-600 text-xs flex items-center gap-1">Powered by <Bot className="h-3 w-3" /> Gemini 1.5 Pro</p>
        </div>
      </footer>
    </div>
  )
}
