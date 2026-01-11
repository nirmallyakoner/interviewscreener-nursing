import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="flex items-center gap-2">
           <Image src="/app-logo.png" alt="NursingPrep" width={32} height={32} className="rounded-lg" />
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
