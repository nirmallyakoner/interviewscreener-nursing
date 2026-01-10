'use client'

import { Navbar } from '../../components/Navbar'
import { Footer } from '../../components/Footer'
import { Mail, MessageCircle, MapPin, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 selection:bg-teal-500/30 overflow-hidden">
       <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/10 via-[#0B0F17] to-[#0B0F17] pointer-events-none" />
      <Navbar />

      <main className="relative pt-32 pb-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
               <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 tracking-tight">
                 We're Here to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Help</span>.
               </h1>
               <p className="text-xl text-slate-400 leading-relaxed">
                 Have questions about the platform or need technical support? <br className="hidden sm:block" />
                 We're just an email away.
               </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="group bg-slate-900/50 border border-slate-800 p-8 rounded-3xl text-center hover:border-teal-500/50 transition-all hover:-translate-y-1 backdrop-blur-sm"
             >
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300 shadow-lg shadow-teal-500/10">
                   <Mail className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Email Support</h3>
                <p className="text-slate-400 mb-6 h-10">For general inquiries, account help, and technical assistance.</p>
                <a href="mailto:support@nursingprep.ai" className="inline-flex items-center gap-2 text-teal-400 font-bold hover:text-teal-300 transition-colors">
                  support@nursingprep.ai <ArrowRight className="w-4 h-4" />
                </a>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="group bg-slate-900/50 border border-slate-800 p-8 rounded-3xl text-center hover:border-teal-500/50 transition-all hover:-translate-y-1 backdrop-blur-sm"
             >
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300 shadow-lg shadow-teal-500/10">
                   <MessageCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Sales & Partnerships</h3>
                <p className="text-slate-400 mb-6 h-10">For nursing colleges and hospital bulk license inquiries.</p>
                <a href="mailto:sales@nursingprep.ai" className="inline-flex items-center gap-2 text-teal-400 font-bold hover:text-teal-300 transition-colors">
                  sales@nursingprep.ai <ArrowRight className="w-4 h-4" />
                </a>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="group bg-slate-900/50 border border-slate-800 p-8 rounded-3xl text-center hover:border-teal-500/50 transition-all hover:-translate-y-1 backdrop-blur-sm"
             >
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors duration-300 shadow-lg shadow-teal-500/10">
                   <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Office</h3>
                <p className="text-slate-400 mb-6 h-10">Bangalore, India</p>
                <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-medium">Visits by appointment only</span>
             </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

