'use client'

import { Navbar } from '../../components/Navbar'
import { Footer } from '../../components/Footer'
import { Check, Shield, Zap, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useState } from 'react'

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-800 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left focus:outline-none group cursor-pointer"
      >
        <span className="text-lg font-medium text-slate-300 group-hover:text-teal-400 transition-colors">{question}</span>
        <span className={`text-teal-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'}`}
      >
         <p className="text-slate-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

export default function PricingPage() {
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
                Invest in Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Career</span>.
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed">
                A small price for a lifetime of confidence. No monthly subscriptions. <br className="hidden sm:block" />
                <span className="text-teal-400 font-medium">Pay only when you need practice.</span>
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
            {/* Free Tier */}
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.2 }}
               className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-slate-700 transition-colors"
            >
               <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
               <div className="flex items-baseline gap-2 mb-6">
                 <span className="text-5xl font-bold text-white tracking-tight">Free</span>
                 <span className="text-slate-500 font-medium">/ forever</span>
               </div>
               <p className="text-slate-400 mb-8 h-12">Perfect for getting a feel of the AI interviewer and testing your baseline.</p>
               
               <ul className="space-y-4 mb-8">
                 <li className="flex items-center gap-3 text-slate-300">
                    <div className="p-1 rounded-full bg-slate-800"><Check className="w-4 h-4 text-teal-500" /></div>
                    <span>3 Mock Interviews</span>
                 </li>
                 <li className="flex items-center gap-3 text-slate-300">
                    <div className="p-1 rounded-full bg-slate-800"><Check className="w-4 h-4 text-teal-500" /></div>
                    <span>Standard 5-min Duration</span>
                 </li>
                 <li className="flex items-center gap-3 text-slate-300">
                    <div className="p-1 rounded-full bg-slate-800"><Check className="w-4 h-4 text-teal-500" /></div>
                    <span>Basic Scorecard Analysis</span>
                 </li>
                 <li className="flex items-center gap-3 text-slate-300">
                    <div className="p-1 rounded-full bg-slate-800"><Check className="w-4 h-4 text-teal-500" /></div>
                    <span>Access to all Clinical Tracks</span>
                 </li>
               </ul>

               <Link href="/login" className="block w-full py-4 text-center rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Start Free
               </Link>
            </motion.div>

            {/* Premium Tier */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.3 }}
               className="group p-1 rounded-3xl bg-gradient-to-b from-teal-500 to-emerald-600 relative"
            >
               <div className="absolute top-0 right-0 left-0 flex justify-center -mt-3">
                  <span className="px-4 py-1 bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-bold uppercase tracking-wide rounded-full shadow-lg shadow-teal-500/20">
                    Most Popular
                  </span>
               </div>
               
               <div className="h-full p-8 rounded-[22px] bg-slate-900 relative overflow-hidden">
                   <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-teal-500/20 transition-colors duration-500"></div>

                   <h3 className="text-2xl font-bold text-white mb-2">Premium Pack</h3>
                   <div className="flex items-baseline gap-2 mb-6">
                     <span className="text-5xl font-bold text-white tracking-tight">₹149</span>
                     <span className="text-slate-500 font-medium">/ pack</span>
                   </div>
                   <p className="text-slate-400 mb-8 h-12">Deep dive practice with extended analysis to master your interview skills.</p>
                   
                   <ul className="space-y-4 mb-8">
                     <li className="flex items-center gap-3 text-white font-medium">
                        <div className="p-1 bg-teal-500/20 rounded-full"><Zap className="w-4 h-4 text-teal-400" /></div>
                        <span>2 Premium Interviews</span>
                     </li>
                     <li className="flex items-center gap-3 text-white font-medium">
                        <div className="p-1 bg-teal-500/20 rounded-full"><Zap className="w-4 h-4 text-teal-400" /></div>
                        <span>Extended 8-min Duration</span>
                     </li>
                     <li className="flex items-center gap-3 text-white font-medium">
                        <div className="p-1 bg-teal-500/20 rounded-full"><Zap className="w-4 h-4 text-teal-400" /></div>
                        <span>Detailed Feedback & actionable tips</span>
                     </li>
                     <li className="flex items-center gap-3 text-white font-medium">
                        <div className="p-1 bg-teal-500/20 rounded-full"><Zap className="w-4 h-4 text-teal-400" /></div>
                        <span>Priority Audio Processing</span>
                     </li>
                   </ul>

                   <Link href="/login" className="block w-full py-4 text-center rounded-xl font-bold bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-teal-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]">
                      Get Premium
                   </Link>
               </div>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
             <div className="text-center mb-12">
               <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
               <p className="text-slate-400">Everything you need to know about our pricing and credits.</p>
             </div>
             
             <div className="space-y-2">
                <FaqItem 
                   question="What happens when I run out of interviews?" 
                   answer="You can simply purchase another Premium Pack. There is no limit to how many packs you can buy. Each pack adds 2 more premium interviews to your account instantly."
                />
                <FaqItem 
                   question="Do my interview credits expire?" 
                   answer="No, your purchased interview credits never expire. You can buy them now and use them whenever you're ready to practice, whether it's next week or next month."
                />
                <FaqItem 
                   question="Can I upgrade from the Free tier?" 
                   answer="Absolutely. Everyone starts with the Free tier. Once you've used your free interviews, or if you want the extended features immediately, you can purchase a Premium Pack."
                />
                <FaqItem 
                   question="What payment methods do you accept?" 
                   answer="We use Razorpay, India's leading payment gateway. We accept all major UPI apps (GPay, PhonePe, Paytm), Credit/Debit Cards, and Netbanking."
                />
                 <FaqItem 
                   question="Is there a refund policy?" 
                   answer="Due to the high collecting cost of AI processing, we generally do not offer refunds once an interview has been initiated. However, if you face technical issues, our support team will ensure you get your credits back."
                />
             </div>
          </div>
          
          <div className="mt-20 text-center border-t border-slate-800 pt-10">
             <div className="flex justify-center items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-slate-500" />
                <span className="text-slate-500 font-medium">Secure Payment Processing</span>
             </div>
             <p className="text-slate-600 text-sm">
                Transactions are encrypted and secured by Razorpay. We do not store your card details.
             </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
