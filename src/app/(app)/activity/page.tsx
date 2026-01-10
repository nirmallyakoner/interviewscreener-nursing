'use client'

import { useState } from 'react'
import { CreditHistoryTable } from '../../../components/CreditHistoryTable'
import { Activity, TrendingUp, Clock } from 'lucide-react'

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 p-8">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Activity</h1>
          </div>
          <p className="text-teal-50 text-lg">Track your credit usage and platform interactions</p>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Credit Transaction History</h2>
            <p className="text-sm text-slate-400 mt-1">
              View all your credit purchases, usage, and refunds
            </p>
          </div>
        </div>

        {/* Credit History Table */}
        <CreditHistoryTable />
      </div>

      {/* Future Activities Placeholder */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <h3 className="text-white font-bold">Coming Soon</h3>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          We're working on adding more activity tracking features:
        </p>
        <ul className="space-y-2 text-sm text-slate-500">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Profile updates and changes
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Login and security events
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Settings modifications
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Export and download history
          </li>
        </ul>
      </div>
    </div>
  )
}
