'use client'

import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Mic, BarChart3, Medal } from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500/30">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center max-w-3xl mx-auto mb-20">
             <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6">From Nervous to <span className="text-teal-400">Natural</span>.</h1>
             <p className="text-xl text-slate-400">
               Our 3-step loop is designed to desensitize you to interview pressure using exposure therapy principles.
             </p>
          </div>

          <div className="space-y-24">
             {/* Step 1 */}
             <div className="flex flex-col md:flex-row items-center gap-12">
                <motion.div 
                   initial={{ opacity: 0, x: -50 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   className="flex-1"
                >
                   <div className="w-16 h-16 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-6 text-teal-400 border border-teal-500/20">
                      <Mic className="w-8 h-8" />
                   </div>
                   <h2 className="text-3xl font-bold text-white mb-4">1. The Voice Drill</h2>
                   <p className="text-slate-400 text-lg leading-relaxed mb-6">
                      You choose a topic (e.g. "Basic Life Support"). Our AI interviewer calls you. It asks dynamic questions based on your answers, just like a real human.
                   </p>
                   <div className="bg-slate-900 border-l-4 border-teal-500 p-4 rounded-r-xl">
                      <p className="text-slate-300 italic">"AI: Can you explain the compression-to-breath ratio in adult CPR?"</p>
                   </div>
                </motion.div>
                <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   className="flex-1 w-full bg-slate-900 aspect-video rounded-3xl border border-slate-800 flex items-center justify-center"
                >
                   {/* Placeholder for visual */}
                   <div className="text-teal-500 font-mono text-sm opacity-50">Visual: Dashboard Active Call</div>
                </motion.div>
             </div>

             {/* Step 2 */}
             <div className="flex flex-col md:flex-row-reverse items-center gap-12">
                <motion.div 
                   initial={{ opacity: 0, x: 50 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   className="flex-1"
                >
                   <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 text-purple-400 border border-purple-500/20">
                      <BarChart3 className="w-8 h-8" />
                   </div>
                   <h2 className="text-3xl font-bold text-white mb-4">2. The Analysis</h2>
                   <p className="text-slate-400 text-lg leading-relaxed mb-6">
                      Instantly after the call, you get a detailed breakdown. We analyze your **Confidence**, **Medical Accuracy**, and **Communication Style**.
                   </p>
                   <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-slate-300"><span className="w-2 h-2 bg-purple-500 rounded-full"></span>Did you say 'umm' too much?</li>
                      <li className="flex items-center gap-3 text-slate-300"><span className="w-2 h-2 bg-purple-500 rounded-full"></span>Did you miss a critical protocol step?</li>
                   </ul>
                </motion.div>
                <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   className="flex-1 w-full bg-slate-900 aspect-video rounded-3xl border border-slate-800 flex items-center justify-center"
                >
                   <div className="text-purple-500 font-mono text-sm opacity-50">Visual: Analysis Scorecard</div>
                </motion.div>
             </div>

             {/* Step 3 */}
             <div className="flex flex-col md:flex-row items-center gap-12">
                <motion.div 
                   initial={{ opacity: 0, x: -50 }}
                   whileInView={{ opacity: 1, x: 0 }}
                   className="flex-1"
                >
                   <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6 text-amber-400 border border-amber-500/20">
                      <Medal className="w-8 h-8" />
                   </div>
                   <h2 className="text-3xl font-bold text-white mb-4">3. The Mastery</h2>
                   <p className="text-slate-400 text-lg leading-relaxed mb-6">
                      You review the feedback, and try again. Each attempt builds muscle memory. By the time you sit for the real interview, you've already answered these questions 10 times.
                   </p>
                   <Link href="/login" className="inline-block px-8 py-4 rounded-xl bg-white text-slate-950 font-bold hover:bg-teal-50 transition-colors">
                      Start Practicing
                   </Link>
                </motion.div>
                <motion.div 
                   initial={{ opacity: 0, scale: 0.9 }}
                   whileInView={{ opacity: 1, scale: 1 }}
                   className="flex-1 w-full bg-slate-900 aspect-video rounded-3xl border border-slate-800 flex items-center justify-center"
                >
                   <div className="text-amber-500 font-mono text-sm opacity-50">Visual: Progress Graph</div>
                </motion.div>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
