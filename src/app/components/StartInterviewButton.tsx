'use client'

import { useRouter } from 'next/navigation'

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
      className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      onClick={handleStartInterview}
      disabled={!hasCredits}
    >
      {hasCredits ? 'Start Interview' : 'No Credits Available'}
    </button>
  )
}
