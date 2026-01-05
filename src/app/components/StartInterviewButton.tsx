'use client'

interface StartInterviewButtonProps {
  hasCredits: boolean
}

export function StartInterviewButton({ hasCredits }: StartInterviewButtonProps) {
  const handleStartInterview = async () => {
    if (!hasCredits) {
      alert('You have no credits remaining. Please purchase more credits.')
      return
    }

    // TODO: Integrate with Retell AI SDK
    alert('Interview feature coming soon! Integrate Retell AI SDK.')
    
    // Example of how to call the interview API:
    // try {
    //   const response = await fetch('/api/interview', {
    //     method: 'POST',
    //   })
    //   const data = await response.json()
    //   if (data.success) {
    //     // Start Retell AI session
    //   }
    // } catch (error) {
    //   console.error('Failed to start interview:', error)
    // }
  }

  return (
    <button
      className="w-full bg-white text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleStartInterview}
      disabled={!hasCredits}
    >
      {hasCredits ? 'Start Interview' : 'No Credits Available'}
    </button>
  )
}
