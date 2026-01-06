'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AudioTest } from '../components/AudioTest'
import { VoiceInterview } from '../components/VoiceInterview'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'

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
        .select('interviews_remaining, interview_duration, subscription_type')
        .eq('id', user.id)
        .single()

      if (error || !profileData) {
        toast.error('Failed to load your profile')
        router.push('/dashboard')
        return
      }

      if (profileData.interviews_remaining <= 0) {
        toast.error('No interviews remaining. Please upgrade!')
        router.push('/dashboard')
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
      router.push('/dashboard')
    }, 2000)
  }

  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
              NursingPrep
            </Link>
            <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
              ← Back to Dashboard
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 ${step === 'audio-test' ? 'text-blue-600' : step === 'interview' || step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step === 'audio-test' ? 'bg-blue-100' : step === 'interview' || step === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {step === 'interview' || step === 'complete' ? '✓' : '1'}
                </div>
                <span className="text-sm font-medium">Audio Test</span>
              </div>
              
              <div className="w-12 h-0.5 bg-gray-300"></div>
              
              <div className={`flex items-center gap-2 ${step === 'interview' ? 'text-blue-600' : step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step === 'interview' ? 'bg-blue-100' : step === 'complete' ? 'bg-green-100' : 'bg-gray-100'}`}>
                  {step === 'complete' ? '✓' : '2'}
                </div>
                <span className="text-sm font-medium">Interview</span>
              </div>
            </div>
          </div>

          {/* Step Content */}
          {step === 'audio-test' && (
            <AudioTest onTestComplete={handleAudioTestComplete} />
          )}

          {step === 'interview' && profile && (
            <VoiceInterview
              durationMinutes={profile.interview_duration}
              onComplete={handleInterviewComplete}
            />
          )}

          {step === 'complete' && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Great Job!</h2>
              <p className="text-gray-600 mb-4">Your interview has been completed successfully.</p>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
          )}
        </main>
      </div>
    </>
  )
}
