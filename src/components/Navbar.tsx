'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Shield } from 'lucide-react'

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="fixed w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white group-hover:text-teal-400 transition-colors">
              Nursing<span className="text-teal-400 group-hover:text-white transition-colors">Prep</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</Link>
            <Link href="/how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How it Works</Link>
            <Link href="/pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</Link>
            <Link href="/contact" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Contact</Link>
            <Link 
              href="/login"
              className="px-5 py-2.5 bg-white text-slate-950 rounded-lg font-bold text-sm hover:bg-teal-50 transition-all transform hover:scale-105 shadow-lg shadow-white/5 border border-transparent hover:border-teal-500"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-300 hover:text-white p-2 cursor-pointer"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950 border-b border-slate-800 overflow-hidden"
          >
            <div className="px-4 pt-4 pb-8 space-y-4">
              <Link href="/features" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md">Features</Link>
              <Link href="/how-it-works" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md">How it Works</Link>
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md">Pricing</Link>
              <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-lg font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md">Contact</Link>
              <Link href="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-lg font-bold text-center bg-teal-500 text-slate-950 rounded-lg hover:bg-teal-400">Sign In</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
