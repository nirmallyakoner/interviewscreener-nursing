'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search, Sparkles } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Floating Particles */}
      {typeof window !== 'undefined' && [...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-teal-400/30 rounded-full"
          initial={{
            x: Math.random() * 1000,
            y: Math.random() * 800,
          }}
          animate={{
            y: [null, Math.random() * 800],
            x: [null, Math.random() * 1000],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 mb-8"
        >
          <Image 
            src="/app-logo.png" 
            alt="NursingPrep" 
            width={48} 
            height={48} 
            className="rounded-xl" 
          />
          <span className="text-2xl font-bold text-white">
            Nursing<span className="text-teal-400">Prep</span>
          </span>
        </motion.div>

        {/* 404 Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
          className="mb-8"
        >
          <div className="relative inline-block">
            {/* Glowing effect behind 404 */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-purple-500 blur-3xl opacity-30 animate-pulse" />
            
            <h1 className="relative text-[120px] sm:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-purple-400 to-pink-400 leading-none tracking-tighter">
              404
            </h1>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4 mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Page Not Found
            </h2>
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          
          <p className="text-lg text-slate-300 max-w-md mx-auto leading-relaxed">
            Oops! Looks like you've wandered into uncharted territory. 
            The page you're looking for doesn't exist or you don't have access to it.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Go Home Button */}
          <Link
            href="/"
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 rounded-xl font-bold text-lg transition-all transform hover:scale-105 hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Home className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Go Home</span>
          </Link>

          {/* Go Back Button */}
          <button
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-2 px-8 py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-white rounded-xl font-bold text-lg transition-all hover:bg-slate-800 hover:border-teal-500/50"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Go Back</span>
          </button>
        </motion.div>

        {/* Helpful Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 pt-8 border-t border-slate-800"
        >
          <p className="text-sm text-slate-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link 
              href="/dashboard" 
              className="text-teal-400 hover:text-teal-300 transition-colors font-medium"
            >
              Dashboard
            </Link>
            <span className="text-slate-700">•</span>
            <Link 
              href="/interview" 
              className="text-teal-400 hover:text-teal-300 transition-colors font-medium"
            >
              Start Interview
            </Link>
            <span className="text-slate-700">•</span>
            <Link 
              href="/pricing" 
              className="text-teal-400 hover:text-teal-300 transition-colors font-medium"
            >
              Pricing
            </Link>
            <span className="text-slate-700">•</span>
            <Link 
              href="/contact" 
              className="text-teal-400 hover:text-teal-300 transition-colors font-medium"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>

        {/* Fun Easter Egg */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8"
        >
          <p className="text-xs text-slate-600 italic">
            💡 Pro tip: Even the best nurses sometimes take a wrong turn. It's all part of the journey!
          </p>
        </motion.div>
      </div>
    </div>
  )
}
