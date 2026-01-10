'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, User, Mic, FileText, CreditCard, LogOut, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { RazorpayCheckout } from './RazorpayCheckout'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error signing out')
    } else {
      router.push('/login')
    }
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Start Interview', href: '/interview', icon: Mic },
    { name: 'Analysis Reports', href: '/analysis', icon: FileText },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      onClose()
    }
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen
        w-64 bg-[#0B0F17] border-r border-slate-800 
        flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-white flex items-center gap-2" onClick={handleNavClick}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
            NursingPrep
          </Link>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-400 hover:text-white cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}

          {/* Catchy Purchase Banner */}
          <div className="mt-4 relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 p-4 group cursor-pointer hover:scale-[1.02] transition-transform">
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <div className="relative z-10">
              {/* Pulsing badge */}
              <div className="flex items-center gap-2 mb-2">
                <div className="relative">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-ping absolute"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
                <span className="text-xs font-bold text-yellow-300 uppercase tracking-wide">Limited Offer</span>
              </div>
              
              {/* Main message */}
              <h3 className="text-white font-bold text-base mb-1">
                Get 160 Credits
              </h3>
              <p className="text-teal-50 text-xs mb-3">
                Just ₹149 • 2 Full Interviews
              </p>
              
              {/* CTA Button - Direct Razorpay */}
              <RazorpayCheckout 
                amount={14900}
                buttonText="Buy Now →"
                className="w-full bg-white text-teal-700 text-center py-2 px-3 rounded-lg font-bold text-sm hover:bg-yellow-300 transition-colors shadow-lg cursor-pointer"
                onSuccess={() => {
                  toast.success('Credits added! Refresh to see updated balance.')
                  window.location.reload()
                }} 
              />
            </div>
          </div>
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-medium cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
