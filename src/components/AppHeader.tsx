'use client'

import { useState, useEffect } from 'react'
import { Menu, X, Zap, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

interface AppHeaderProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
}

export function AppHeader({ onToggleSidebar, isSidebarOpen }: AppHeaderProps) {
  const [credits, setCredits] = useState<number>(0)
  const [userName, setUserName] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('credits, blocked_credits, interviews_remaining, name')
        .eq('id', user.id)
        .single()

      if (profile) {
        // Calculate available credits (backward compatible)
        const hasNewCreditSystem = profile.credits !== undefined && profile.credits !== null
        const availableCredits = hasNewCreditSystem
          ? (profile.credits || 0) - (profile.blocked_credits || 0)
          : (profile.interviews_remaining || 0)
        
        setCredits(availableCredits)
        setUserName(profile.name || 'User')
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-[#0B0F17] border-b border-slate-800 lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Menu Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
          aria-label="Toggle menu"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Center: Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/app-logo.png" alt="NursingPrep" width={32} height={32} className="rounded-lg" />
          <span className="font-bold text-white text-lg">NursingPrep</span>
        </Link>

        {/* Right: Quick Stats */}
        <div className="flex items-center gap-3">
          {/* Credits Badge */}
          <Link 
            href="/billing"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-colors"
          >
            <Zap className="w-4 h-4 text-teal-400" />
            <span className="text-sm font-bold text-teal-400">{credits}</span>
          </Link>

          {/* Profile Icon */}
          <Link 
            href="/profile"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            aria-label="Profile"
          >
            <User className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>
    </header>
  )
}
