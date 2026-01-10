'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  CheckCircle2, 
  Shield, 
  Mic, 
  Activity, 
  Star, 
  ChevronRight, 
  Play, 
  Users,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500/30 overflow-x-hidden">
      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-4">
          {/* Background Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-teal-500/10 rounded-[100%] blur-[120px] -z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              
              {/* Left Column: Copy */}
              <motion.div 
                className="flex-1 text-center lg:text-left"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-teal-500/30 text-teal-400 text-sm font-medium mb-8 shadow-[0_0_20px_rgba(45,212,191,0.1)]">
                  <Sparkles className="w-4 h-4" />
                  <span>Trusted by 300+ Hospitals</span>
                </motion.div>
                
                <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-8">
                  Your Personal <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">AI Interview Coach.</span>
                </motion.h1>
                
                <motion.p variants={itemVariants} className="text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Practicing with a human is awkward. Practicing with AI is safe. 
                  We simulate the real hospital interview environment to help you <span className="text-rose-400 font-medium line-through decoration-rose-400/50">fail here</span>, so you succeed there.
                </motion.p>
                
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link 
                    href="/dashboard" 
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold text-lg transition-all transform hover:-translate-y-1 shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)]"
                  >
                    Start Mock Interview <ChevronRight className="w-5 h-5" />
                  </Link>
                  <div className="flex items-center justify-center gap-2 px-6 py-4 text-slate-400 text-sm font-medium">
                    <Shield className="w-4 h-4 text-teal-500" /> No credit card required
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="mt-12 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500">
                   <div className="flex -space-x-3">
                     {[1,2,3,4].map((i) => (
                       <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-xs text-white overflow-hidden">
                         <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                           <Users className="w-5 h-5 opacity-50" />
                         </div>
                       </div>
                     ))}
                   </div>
                   <p className="flex items-center gap-2">
                     <span className="text-white font-bold">1,200+</span> students joined
                   </p>
                </motion.div>
              </motion.div>

              {/* Right Column: Dashboard Mockup Visual */}
              <motion.div 
                className="flex-1 w-full max-w-xl lg:max-w-none perspective-1000"
                initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              >
                {/* MacBook Mockup Container */}
                <div className="relative rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden aspect-[16/10] group">
                   <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/5 to-purple-500/5 group-hover:opacity-50 transition-opacity duration-700"></div>

                   {/* Top Bar */}
                   <div className="h-8 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2 relative z-10">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                      <div className="mx-auto w-1/3 h-5 bg-slate-900 rounded-md text-[10px] flex items-center justify-center text-slate-500 font-mono border border-slate-800">
                        nursingprep.ai/interview
                      </div>
                   </div>

                   {/* Screen Content - Dashboard UI */}
                   <div className="p-6 h-full flex flex-col gap-6 bg-slate-950">
                      {/* Timer Header */}
                      <div className="flex justify-between items-center bg-slate-900/50 backdrop-blur-md p-4 rounded-xl border border-slate-800">
                         <div className="flex items-center gap-3">
                            <span className="relative flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                            <span className="text-emerald-400 font-mono font-medium tracking-tight">Interview Active</span>
                         </div>
                         <div className="flex items-center gap-2 text-slate-300 font-mono bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                            <Clock className="w-4 h-4 text-slate-400" /> 14:32
                         </div>
                      </div>

                      {/* Split Grid */}
                      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                         {/* AI Agent Panel */}
                         <div className="bg-slate-900 rounded-2xl border border-teal-500/20 p-5 flex flex-col relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                                   <Activity className="w-5 h-5 text-teal-400" />
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-500 bg-teal-500/10 px-2 py-1 rounded">AI Lead</span>
                            </div>
                            
                            <h3 className="text-white font-semibold mb-1">AI Interviewer</h3>
                            <p className="text-xs text-teal-400 mb-6">Speaking...</p>
                            
                            {/* Waveform Animation */}
                            <div className="flex items-end gap-1 h-8 mt-auto mx-auto">
                               {[...Array(8)].map((_,i) => (
                                 <motion.div 
                                    key={i}
                                    animate={{ height: ["30%", "100%", "30%"] }}
                                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                                    className="w-1.5 bg-gradient-to-t from-teal-600 to-teal-400 rounded-full"
                                 />
                               ))}
                            </div>
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-teal-500/5 to-transparent pointer-events-none"></div>
                         </div>

                         {/* User Panel */}
                         <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
                            <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center mb-4 relative">
                               <Mic className="w-8 h-8 text-slate-500" />
                               <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20"></div>
                            </div>
                            <h3 className="text-slate-300 font-medium text-sm">You</h3>
                            <p className="text-xs text-slate-500 mt-1">Listening...</p>
                         </div>
                      </div>

                      {/* Transcript Bubble */}
                      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 backdrop-blur-sm self-end w-full">
                         <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-teal-500/20 flex-shrink-0 flex items-center justify-center text-teal-400 text-xs font-bold">AI</div>
                            <p className="text-sm text-slate-300 italic leading-relaxed">
                              "That's a solid start. Now, can you explain the specific protocol you would follow if the patient's vitals suddenly dropped during that procedure?"
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -z-10"></div>
                <div className="absolute -left-12 -top-12 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -z-10"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <motion.section 
          id="features" 
          className="py-24 bg-slate-950 relative"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Target Your Weaknesses</h2>
              <p className="text-slate-400 text-lg">Hospitals don't hire generic nurses. They hire specialists. We help you demonstrate competence.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
               {/* Feature 1 */}
               <motion.div 
                 whileHover={{ y: -5 }}
                 className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-teal-500/50 transition-colors group"
               >
                 <div className="w-14 h-14 bg-teal-900/20 rounded-2xl flex items-center justify-center mb-6 border border-teal-500/10 group-hover:bg-teal-500/20 group-hover:border-teal-500/30 transition-all">
                   <Shield className="w-7 h-7 text-teal-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3">Safe Space to Fail</h3>
                 <p className="text-slate-400 leading-relaxed text-sm">
                   Make mistakes here, not in the hospital. Our AI provides a judgment-free zone to practice critical scenarios until you're ready.
                 </p>
               </motion.div>

               {/* Feature 2 */}
               <motion.div 
                 whileHover={{ y: -5 }}
                 className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition-colors group"
               >
                 <div className="w-14 h-14 bg-emerald-900/20 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/10 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-all">
                   <Mic className="w-7 h-7 text-emerald-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3">Voice-First Practice</h3>
                 <p className="text-slate-400 leading-relaxed text-sm">
                   Stop typing answers. Speak them. We use advanced voice recognition to test your verbal confidence and clarity.
                 </p>
               </motion.div>

               {/* Feature 3 */}
               <motion.div 
                 whileHover={{ y: -5 }}
                 className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-rose-500/50 transition-colors group"
               >
                 <div className="w-14 h-14 bg-rose-900/20 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/10 group-hover:bg-rose-500/20 group-hover:border-rose-500/30 transition-all">
                   <Activity className="w-7 h-7 text-rose-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white mb-3">Clinical Precision</h3>
                 <p className="text-slate-400 leading-relaxed text-sm">
                   Our scenarios are built by medical professionals. Code Blue, Triage, Patient Safety - we cover the protocols that matter.
                 </p>
               </motion.div>
            </div>
          </div>
        </motion.section>

        {/* REVIEWS SECTION (Trusted by Scholars) */}
        <motion.section 
          id="reviews" 
          className="py-24 bg-slate-900/30 border-y border-slate-800"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
                 <div className="max-w-xl">
                   <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Trusted by Future Nurses</h2>
                   <p className="text-slate-400">Join thousands of students from top nursing colleges.</p>
                 </div>
                 <div className="flex items-center gap-4 bg-slate-900 px-6 py-3 rounded-2xl border border-slate-800">
                    <div className="flex -space-x-3">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center overflow-hidden">
                           <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-600"></div>
                        </div>
                      ))}
                    </div>
                    <div className="text-left">
                       <div className="flex text-yellow-500 mb-0.5"><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /></div>
                       <p className="text-xs text-white font-bold">4.9/5 Average Rating</p>
                    </div>
                 </div>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Review 1 */}
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-teal-900/30 flex items-center justify-center text-teal-400 font-bold text-sm border border-teal-500/20">P</div>
                      <div>
                         <h4 className="text-white font-bold text-sm">Priya Sharma</h4>
                         <p className="text-slate-500 text-xs">BSc Nursing, AIIMS</p>
                      </div>
                   </div>
                   <p className="text-slate-300 text-sm leading-relaxed">
                     "I was terrified of the clinical scenario questions. The AI grilled me on Triage protocols until I could answer in my sleep. Landed the job!"
                   </p>
                </div>

                {/* Review 2 */}
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center text-emerald-400 font-bold text-sm border border-emerald-500/20">R</div>
                      <div>
                         <h4 className="text-white font-bold text-sm">Rahul Verma</h4>
                         <p className="text-slate-500 text-xs">Post Basic, Apollo</p>
                      </div>
                   </div>
                   <p className="text-slate-300 text-sm leading-relaxed">
                     "The feedback is brutal but honest. It told me I was saying 'um' too much and hesitating on dosages. Fixed it in 2 days."
                   </p>
                </div>

                 {/* Review 3 */}
                 <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-rose-900/30 flex items-center justify-center text-rose-400 font-bold text-sm border border-rose-500/20">S</div>
                      <div>
                         <h4 className="text-white font-bold text-sm">Sneha Gupta</h4>
                         <p className="text-slate-500 text-xs">GNM Nursing</p>
                      </div>
                   </div>
                   <p className="text-slate-300 text-sm leading-relaxed">
                     "It feels like real senior nurses are interviewing you. The voice interaction is so natural. Highly recommend!"
                   </p>
                </div>
             </div>
           </div>
        </motion.section>

        {/* FINAL CTA */}
        <motion.section 
           className="py-24 relative overflow-hidden px-4"
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.8 }}
        >
           <div className="max-w-5xl mx-auto">
              <div className="relative rounded-[2.5rem] bg-gradient-to-b from-teal-900/30 to-slate-900 border border-teal-500/20 p-12 md:p-24 text-center overflow-hidden shadow-2xl">
                 <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center"></div>
                 <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                 
                 <div className="relative z-10">
                    <h2 className="text-4xl sm:text-6xl font-black text-white mb-8 tracking-tight">
                       Ready to go <br/>
                       <span className="text-teal-400">Pro?</span>
                    </h2>
                    <p className="text-xl text-slate-400 mb-10 max-w-xl mx-auto">
                       Start your first AI mock interview in 60 seconds. No credit cards. No fluff. Just results.
                    </p>
                    <Link 
                      href="/login"
                      className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-slate-950 rounded-2xl font-bold text-lg hover:bg-teal-50 transition-all transform hover:scale-105 shadow-2xl shadow-white/10"
                    >
                      Start Free Practice <Zap className="w-5 h-5 fill-slate-950" />
                    </Link>
                    <p className="mt-6 text-sm text-slate-500">3 free sessions included with every account</p>
                 </div>
              </div>
           </div>
        </motion.section>
      </main>
      
      <Footer />
    </div>
  )
}
