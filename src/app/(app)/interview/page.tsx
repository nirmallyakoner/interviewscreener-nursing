'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AudioTest } from '../../../components/AudioTest'
import { VoiceInterview } from '../../../components/VoiceInterview'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { Mic, Volume2, CheckCircle2, Sparkles, ArrowRight, AlertCircle, Zap, Clock, BookOpen } from 'lucide-react'

type InterviewStep = 'loading' | 'audio-test' | 'interview' | 'complete'

export default function InterviewPage() {
  const [step, setStep] = useState<InterviewStep>('loading')
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkCredits()
  }, [])

  const checkCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('interviews_remaining, interview_duration, subscription_type, course_type')
        .eq('id', user.id)
        .single()

      if (error || !profileData) {
        toast.error('Failed to load your profile')
        router.push('/dashboard')
        return
      }

      if (profileData.interviews_remaining <= 0) {
        toast.error('No interviews remaining. Please upgrade!')
        router.push('/billing')
        return
      }

      setProfile(profileData)
      setStep('audio-test')
    } catch (error) {
      console.error('Check credits error:', error)
      toast.error('An error occurred')
      router.push('/dashboard')
    }
  }

  const handleAudioTestComplete = () => {
    setStep('interview')
  }

  const handleInterviewComplete = () => {
    setStep('complete')
    setTimeout(() => {
      router.push('/analysis')
    }, 2000)
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F17]">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin mx-auto" style={{ animationDuration: '1.5s' }}></div>
          </div>
          <p className="text-slate-400 text-lg">Preparing your interview...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="space-y-6">
        
        {/* Hero Header */}
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
              <h1 className="text-3xl sm:text-4xl font-bold text-white">Practice Interview</h1>
            </div>
            <p className="text-teal-50 text-lg mb-6">
              {step === 'audio-test' && 'First, let\'s make sure your audio is working perfectly'}
              {step === 'interview' && 'You\'re all set! Let\'s begin your practice interview'}
              {step === 'complete' && 'Congratulations! Interview completed successfully'}
            </p>

            {/* Interview Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-teal-100" />
                  <span className="text-xs text-teal-100 font-medium">Course</span>
                </div>
                <p className="text-white font-bold text-sm">{profile?.course_type}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-teal-100" />
                  <span className="text-xs text-teal-100 font-medium">Duration</span>
                </div>
                <p className="text-white font-bold text-sm">{profile?.interview_duration} minutes</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-teal-100" />
                  <span className="text-xs text-teal-100 font-medium">Credits Left</span>
                </div>
                <p className="text-white font-bold text-sm">{profile?.interviews_remaining}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-center gap-4">
            {/* Step 1: Audio Test */}
            <div className="flex items-center gap-3">
              <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                step === 'audio-test' 
                  ? 'bg-teal-500/10 border-teal-500 shadow-lg shadow-teal-500/25' 
                  : step === 'interview' || step === 'complete'
                  ? 'bg-emerald-500/10 border-emerald-500'
                  : 'bg-slate-900 border-slate-700'
              }`}>
                {step === 'interview' || step === 'complete' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Mic className="w-6 h-6 text-teal-400" />
                )}
                {step === 'audio-test' && (
                  <div className="absolute inset-0 rounded-full border-2 border-teal-500 animate-ping"></div>
                )}
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm font-bold ${
                  step === 'audio-test' ? 'text-teal-400' : 
                  step === 'interview' || step === 'complete' ? 'text-emerald-400' : 
                  'text-slate-600'
                }`}>
                  Audio Test
                </p>
                <p className="text-xs text-slate-500">Check mic & speaker</p>
              </div>
            </div>
            
            {/* Connector Line */}
            <div className={`w-16 sm:w-24 h-1 rounded-full transition-all ${
              step === 'interview' || step === 'complete' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                : 'bg-slate-800'
            }`}></div>
            
            {/* Step 2: Interview */}
            <div className="flex items-center gap-3">
              <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                step === 'interview' 
                  ? 'bg-teal-500/10 border-teal-500 shadow-lg shadow-teal-500/25' 
                  : step === 'complete'
                  ? 'bg-emerald-500/10 border-emerald-500'
                  : 'bg-slate-900 border-slate-700'
              }`}>
                {step === 'complete' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <Volume2 className="w-6 h-6 text-slate-600" />
                )}
                {step === 'interview' && (
                  <div className="absolute inset-0 rounded-full border-2 border-teal-500 animate-ping"></div>
                )}
              </div>
              <div className="hidden sm:block">
                <p className={`text-sm font-bold ${
                  step === 'interview' ? 'text-teal-400' : 
                  step === 'complete' ? 'text-emerald-400' : 
                  'text-slate-600'
                }`}>
                  Interview
                </p>
                <p className="text-xs text-slate-500">Practice session</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8">
          {step === 'audio-test' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                  <AlertCircle className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-blue-400 font-medium">Step 1 of 2</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Audio Equipment Check</h2>
                <p className="text-slate-400">
                  We need to test your microphone and speakers to ensure the best interview experience
                </p>
              </div>
              <AudioTest onTestComplete={handleAudioTestComplete} />
            </div>
          )}

          {step === 'interview' && profile && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-4">
                  <Sparkles className="w-4 h-4 text-teal-400" />
                  <span className="text-sm text-teal-400 font-medium">Step 2 of 2 - You're Ready!</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Begin Your Interview</h2>
                <p className="text-slate-400 mb-4">
                  Speak clearly and confidently. The AI interviewer will ask you questions about {profile.course_type}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-amber-400 font-medium">
                    Interview Duration: {profile.interview_duration} minutes
                  </span>
                </div>
              </div>
              <VoiceInterview
                durationMinutes={profile.interview_duration}
                onComplete={handleInterviewComplete}
              />
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/20 relative">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping"></div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Excellent Work! 🎉</h2>
              <p className="text-slate-400 mb-2 text-lg">Your interview has been completed successfully.</p>
              <p className="text-sm text-slate-500 mb-8">We're analyzing your performance and generating detailed feedback...</p>
              
              <div className="inline-flex items-center gap-2 text-teal-400">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></div>
                <span className="text-sm font-medium">Redirecting to analysis reports</span>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        {(step === 'audio-test' || step === 'interview') && (
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-indigo-500/20">
                <AlertCircle className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold mb-2">Need Help?</h3>
                <p className="text-slate-300 text-sm mb-3">
                  {step === 'audio-test' 
                    ? 'Make sure your microphone and speakers are properly connected. Allow browser permissions when prompted.'
                    : 'Answer each question thoughtfully. Use the STAR method (Situation, Task, Action, Result) for better responses.'
                  }
                </p>
                <Link 
                  href="/how-it-works" 
                  className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 font-medium group"
                >
                  View Interview Guide
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
