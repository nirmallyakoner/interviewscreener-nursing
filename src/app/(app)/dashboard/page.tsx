import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StartInterviewButton } from '../../../components/StartInterviewButton'
import { CallAnalysisCard } from '../../../components/CallAnalysisCard'
import Link from 'next/link'
import { Sparkles, TrendingUp, Clock, Zap, FileText, Award, Target, Calendar, History, BookOpen, ArrowRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile with subscription fields
  // Try to fetch new credit columns, fall back to old system if they don't exist
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_type, credits, blocked_credits, interviews_remaining, interview_duration, course_type, name, email')
    .eq('id', user.id)
    .single()

  // Calculate available credits (backward compatible)
  // If credits column exists, use it; otherwise fall back to interviews_remaining
  const hasNewCreditSystem = profile?.credits !== undefined && profile?.credits !== null
  const availableCredits = hasNewCreditSystem 
    ? (profile.credits || 0) - (profile.blocked_credits || 0)
    : (profile?.interviews_remaining || 0)

  // Fetch latest completed interview session with analysis
  const { data: latestSession } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .not('analysis', 'is', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Calculate stats
  const { data: allSessions } = await supabase
    .from('interview_sessions')
    .select('analysis')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .not('analysis', 'is', null)

  const avgScore = allSessions && allSessions.length > 0
    ? Math.round(allSessions.reduce((acc, s) => acc + (s.analysis?.overall_score || 0), 0) / allSessions.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Welcome back, <span className="text-teal-400">{profile?.name?.split(' ')[0] || 'Student'}</span> 👋
        </h1>
        <p className="text-slate-400 text-sm sm:text-base">Ready to ace your nursing interview? Let's practice!</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {/* Credits */}
            <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-teal-400" />
                <span className="text-xs text-slate-400 font-medium">Available</span>
              </div>
              <p className="text-2xl font-bold text-white">{availableCredits}</p>
              {hasNewCreditSystem && (profile?.blocked_credits || 0) > 0 && (
                <p className="text-xs text-amber-400 mt-1">({profile?.blocked_credits} blocked)</p>
              )}
            </div>

            {/* Course */}
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-slate-400 font-medium">Course</span>
              </div>
              <p className="text-sm font-bold text-white truncate">{profile?.course_type || 'N/A'}</p>
            </div>

            {/* Duration */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-slate-400 font-medium">Duration</span>
              </div>
              <p className="text-2xl font-bold text-white">{profile?.interview_duration || 5}<span className="text-sm text-slate-400 ml-1">min</span></p>
            </div>

            {/* Avg Score */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span className="text-xs text-slate-400 font-medium">Avg Score</span>
              </div>
              <p className="text-2xl font-bold text-white">{avgScore}<span className="text-sm text-slate-400 ml-1">%</span></p>
            </div>
          </div>

          {/* Start Interview Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-600 p-6 sm:p-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl -ml-24 -mb-24"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-teal-100" />
                    <span className="text-xs font-bold text-teal-100 uppercase tracking-wider">Ready to Practice</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Start Your Interview</h2>
                  <p className="text-teal-50 text-sm sm:text-base max-w-lg">
                    Practice with our AI interviewer and get instant feedback on your performance.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
                <StartInterviewButton hasCredits={availableCredits > 0} />
                <div className="flex items-center gap-2 text-teal-50">
                  <div className="w-2 h-2 rounded-full bg-teal-200 animate-pulse"></div>
                  <span className="text-sm font-medium">{availableCredits} credits available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Analysis */}
          {latestSession && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Latest Performance</h3>
                    <p className="text-xs text-slate-400">Your most recent interview analysis</p>
                  </div>
                </div>
                <Link
                  href="/analysis"
                  className="flex items-center gap-1 text-sm text-teal-400 hover:text-teal-300 font-medium group"
                >
                  View All
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <CallAnalysisCard session={latestSession} showTranscript={false} />
            </div>
          )}

          {/* No Analysis State */}
          {!latestSession && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-8 sm:p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Interviews Yet</h3>
              <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
                Start your first practice interview to see detailed analysis and feedback here.
              </p>
              <Link
                href="/interview"
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-400 transition-colors"
              >
                Start First Interview
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Subscription Card */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white">Your Plan</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                profile?.subscription_type === 'paid'
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {profile?.subscription_type === 'paid' ? 'Premium' : 'Free'}
              </span>
            </div>

            <div className="space-y-4">
              {hasNewCreditSystem ? (
                <>
                  <div className="flex justify-between items-center py-3 border-b border-slate-800">
                    <span className="text-sm text-slate-400">Total Credits</span>
                    <span className="text-lg font-bold text-white">{profile?.credits || 0}</span>
                  </div>
                  {(profile?.blocked_credits || 0) > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-sm text-slate-400">Blocked</span>
                      <span className="font-medium text-amber-400">-{profile?.blocked_credits}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-b border-slate-800">
                    <span className="text-sm text-slate-400">Available</span>
                    <span className="text-lg font-bold text-teal-400">{availableCredits}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                  <span className="text-sm text-slate-400">Interviews Remaining</span>
                  <span className="text-lg font-bold text-white">{availableCredits}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-sm text-slate-400">Session Length</span>
                <span className="font-medium text-white">{profile?.interview_duration || 5} min</span>
              </div>
            </div>

            {availableCredits <= 30 && (
              <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-400 font-medium mb-3">⚠️ Running low on credits</p>
                <p className="text-xs text-slate-400 mb-3">You have {availableCredits} credits ({Math.floor(availableCredits / 10)} minutes)</p>
                <Link
                  href="/billing"
                  className="block w-full py-2.5 text-center rounded-lg bg-amber-500 text-slate-950 font-bold text-sm hover:bg-amber-400 transition-colors"
                >
                  Buy More Credits
                </Link>
              </div>
            )}

            {availableCredits > 30 && (
              <Link
                href="/billing"
                className="block w-full mt-6 py-3 text-center rounded-xl border border-slate-700 text-slate-300 font-medium text-sm hover:bg-slate-800 transition-colors"
              >
                Manage Billing
              </Link>
            )}
          </div>

          {/* Pro Tip Card */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white">Pro Tip</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Use the STAR method (Situation, Task, Action, Result) to structure your answers for better scores.
            </p>
            <Link
              href="/how-it-works"
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 group"
            >
              Learn More
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Quick Links */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link
                href="/analysis"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-colors group"
              >
                <span className="text-sm text-slate-300 group-hover:text-white">View Reports</span>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/pricing"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-colors group"
              >
                <span className="text-sm text-slate-300 group-hover:text-white">View Pricing</span>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/contact"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-colors group"
              >
                <span className="text-sm text-slate-300 group-hover:text-white">Get Support</span>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
