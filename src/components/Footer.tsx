import Link from 'next/link'
import { Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
              <Shield className="w-4 h-4 text-teal-500" />
           </div>
           <span className="text-white font-bold text-lg tracking-tight">NursingPrep</span>
         </div>
         
         <p className="text-slate-500 text-sm">© 2026 NursingPrep AI. Built for heroes.</p>
         
         <div className="flex gap-8 text-slate-400 text-sm font-medium">
            <Link href="/privacy" className="hover:text-teal-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-teal-400 transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-teal-400 transition-colors">Contact</Link>
         </div>
      </div>
    </footer>
  )
}
