'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { CallAnalysisList } from '../../../components/CallAnalysisList'
import { FileText, TrendingUp, Clock, Award, Target, Sparkles, Calendar, Filter } from 'lucide-react'

export default function AnalysisPage() {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, avgScore: 0, totalMinutes: 0, bestScore: 0 })
  const [filter, setFilter] = useState<'all' | 'recent' | 'top'>('all')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .not('analysis', 'is', null)
        .order('started_at', { ascending: false })

      if (error) throw error
      
      setSessions(data || [])
      
      // Calculate stats
      if (data && data.length > 0) {
        const total = data.length
        const scores = data.map(s => s.analysis?.overall_score || 0)
        const avgScore = Math.round(scores.reduce((acc, s) => acc + s, 0) / total)
        const bestScore = Math.max(...scores)
        const totalMinutes = data.reduce((acc, s) => acc + ((s.actual_duration_seconds || 0) / 60), 0)
        setStats({ total, avgScore, totalMinutes: Math.round(totalMinutes), bestScore })
      }
    } catch (error: any) {
      console.error('Error loading sessions:', error)
      toast.error('Failed to load analysis reports')
    } finally {
      setLoading(false)
    }
  }

  const getFilteredSessions = () => {
    switch (filter) {
      case 'recent':
        return sessions.slice(0, 5)
      case 'top':
        return [...sessions].sort((a, b) => 
          (b.analysis?.overall_score || 0) - (a.analysis?.overall_score || 0)
        ).slice(0, 5)
      default:
        return sessions
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
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
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Performance Analytics</h1>
          </div>
          <p className="text-teal-50 text-lg">Track your progress and master your interview skills</p>
        </div>
      </div>

      {/* Stats Grid - Glassmorphism Cards */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Interviews */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 p-6 hover:border-blue-500/40 transition-all hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-blue-500/20 backdrop-blur-sm">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
                <div className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                  ALL TIME
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">Total Interviews</p>
              <p className="text-4xl font-bold text-white mb-1">{stats.total}</p>
              <div className="flex items-center gap-1 text-xs text-blue-400">
                <TrendingUp className="w-3 h-3" />
                <span>Keep going!</span>
              </div>
            </div>
          </div>

          {/* Average Score */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-6 hover:border-emerald-500/40 transition-all hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-emerald-500/20 backdrop-blur-sm">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  AVG
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">Average Score</p>
              <p className="text-4xl font-bold text-white mb-1">{stats.avgScore}<span className="text-xl text-slate-400">%</span></p>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                  style={{ width: `${stats.avgScore}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Best Score */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6 hover:border-amber-500/40 transition-all hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-amber-500/20 backdrop-blur-sm">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>
                <div className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                  BEST
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">Best Score</p>
              <p className="text-4xl font-bold text-white mb-1">{stats.bestScore}<span className="text-xl text-slate-400">%</span></p>
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <Target className="w-3 h-3" />
                <span>Personal best!</span>
              </div>
            </div>
          </div>

          {/* Practice Time */}
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 p-6 hover:border-purple-500/40 transition-all hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 rounded-xl bg-purple-500/20 backdrop-blur-sm">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <div className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">
                  TIME
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-1">Practice Time</p>
              <p className="text-4xl font-bold text-white mb-1">{stats.totalMinutes}<span className="text-xl text-slate-400">m</span></p>
              <div className="flex items-center gap-1 text-xs text-purple-400">
                <Calendar className="w-3 h-3" />
                <span>{Math.round(stats.totalMinutes / 60)}h total</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {sessions.length > 0 && (
        <div className="flex items-center gap-3 p-1 bg-[#111827] border border-slate-800 rounded-xl w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
            }`}
          >
            All Interviews
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
              filter === 'recent'
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setFilter('top')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer ${
              filter === 'top'
                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
            }`}
          >
            Top Performers
          </button>
        </div>
      )}

      {/* Interview History */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
          <div className="p-2 rounded-lg bg-teal-500/10">
            <FileText className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Interview History</h2>
            <p className="text-sm text-slate-400">
              {filter === 'all' && `Showing all ${sessions.length} interviews`}
              {filter === 'recent' && 'Showing your 5 most recent interviews'}
              {filter === 'top' && 'Showing your top 5 performing interviews'}
            </p>
          </div>
        </div>
        <CallAnalysisList sessions={getFilteredSessions()} showTranscript={true} />
      </div>

      {/* Empty State */}
      {sessions.length === 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-12 text-center">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-6 border-2 border-slate-700">
              <FileText className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No Analysis Reports Yet</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Complete your first practice interview to see detailed performance analytics and feedback here.
            </p>
            <a
              href="/interview"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-teal-500/25 transition-all hover:scale-105"
            >
              <Sparkles className="w-5 h-5" />
              Start Your First Interview
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
