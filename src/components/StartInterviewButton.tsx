'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

interface StartInterviewButtonProps {
  hasCredits: boolean
}

export function StartInterviewButton({ hasCredits }: StartInterviewButtonProps) {
  const router = useRouter()

  const handleStartInterview = () => {
    if (!hasCredits) {
      return
    }
    
    // Navigate to interview page
    router.push('/interview')
  }

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base
        transition-all transform
        ${hasCredits 
          ? 'bg-white text-teal-600 hover:bg-teal-50 hover:scale-105 active:scale-95 shadow-lg shadow-white/20' 
          : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
        }
      `}
      onClick={handleStartInterview}
      disabled={!hasCredits}
    >
      {hasCredits ? (
        <>
          Start Interview
          <ArrowRight className="w-5 h-5" />
        </>
      ) : (
        'No Credits Available'
      )}
    </button>
  )
}
