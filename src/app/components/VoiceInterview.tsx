'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface VoiceInterviewProps {
  durationMinutes: number
  onComplete: (transcript?: string) => void
}

export function VoiceInterview({ durationMinutes, onComplete }: VoiceInterviewProps) {
  const [callStatus, setCallStatus] = useState<'connecting' | 'active' | 'ended'>('connecting')
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60) // in seconds
  const [isMuted, setIsMuted] = useState(false)
  const [callId, setCallId] = useState<string | null>(null)
  
  const retellWebClientRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Load Retell Web SDK
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/retell-client-js-sdk@latest/dist/web/index.js'
    script.async = true
    script.onload = () => {
      initializeCall()
    }
    document.body.appendChild(script)

    return () => {
      // Cleanup
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (retellWebClientRef.current) {
        retellWebClientRef.current.stopCall()
      }
    }
  }, [])

  const initializeCall = async () => {
    try {
      // Create call via API
      const response = await fetch('/api/retell/create-call', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create call')
      }

      const data = await response.json()
      setCallId(data.call_id)

      // Initialize Retell Web Client
      const RetellWebClient = (window as any).RetellWebClient
      const retellWebClient = new RetellWebClient()
      retellWebClientRef.current = retellWebClient

      // Set up event listeners
      retellWebClient.on('call_started', () => {
        console.log('Call started')
        setCallStatus('active')
        startTimer()
        toast.success('Interview started!')
      })

      retellWebClient.on('call_ended', () => {
        console.log('Call ended')
        handleCallEnd()
      })

      retellWebClient.on('error', (error: any) => {
        console.error('Retell error:', error)
        toast.error('Connection error. Please try again.')
        setCallStatus('ended')
      })

      retellWebClient.on('update', (update: any) => {
        // Handle real-time updates if needed
        console.log('Call update:', update)
      })

      // Start the call
      await retellWebClient.startCall({
        accessToken: data.access_token,
      })
    } catch (error: any) {
      console.error('Initialize call error:', error)
      toast.error(error.message || 'Failed to start interview')
      router.push('/dashboard')
    }
  }

  const startTimer = () => {
    const endTime = Date.now() + (durationMinutes * 60 * 1000)
    
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
      setTimeRemaining(remaining)
      
      if (remaining <= 0) {
        // Auto-end call
        endCall()
      }
    }, 1000)
  }

  const endCall = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    if (retellWebClientRef.current) {
      retellWebClientRef.current.stopCall()
    }

    if (callId) {
      try {
        await fetch('/api/retell/end-call', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ call_id: callId }),
        })
      } catch (error) {
        console.error('End call API error:', error)
      }
    }

    handleCallEnd()
  }

  const handleCallEnd = () => {
    setCallStatus('ended')
    toast.success('Interview completed!')
    
    setTimeout(() => {
      onComplete()
    }, 1500)
  }

  const toggleMute = () => {
    if (retellWebClientRef.current) {
      if (isMuted) {
        retellWebClientRef.current.unmute()
      } else {
        retellWebClientRef.current.mute()
      }
      setIsMuted(!isMuted)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (callStatus === 'ended') {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-2xl mx-auto text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Complete!</h2>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎙️ Interview {callStatus === 'connecting' ? 'Connecting...' : 'in Progress'}
        </h2>
        
        {callStatus === 'active' && (
          <div className="mt-4">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {formatTime(timeRemaining)}
            </div>
            <p className="text-sm text-gray-500">Time Remaining</p>
          </div>
        )}
        
        {callStatus === 'connecting' && (
          <div className="flex items-center justify-center mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {callStatus === 'active' && (
        <>
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Active</span>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={toggleMute}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all cursor-pointer ${
                isMuted
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isMuted ? '🔇 Unmute' : '🔊 Mute'}
            </button>
            
            <button
              onClick={endCall}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-all cursor-pointer"
            >
              📞 End Interview
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Speak clearly and take your time to answer. The AI interviewer will wait for you to finish.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
