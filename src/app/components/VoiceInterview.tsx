'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { RetellWebClient } from 'retell-client-js-sdk'

interface VoiceInterviewProps {
  durationMinutes: number
  onComplete: (transcript?: string) => void
}

export function VoiceInterview({ durationMinutes, onComplete }: VoiceInterviewProps) {
  const [callStatus, setCallStatus] = useState<'connecting' | 'active' | 'ended'>('connecting')
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60) // in seconds
  const [isMuted, setIsMuted] = useState(false)
  const [callId, setCallId] = useState<string | null>(null)
  const [lastInterviewerResponse, setLastInterviewerResponse] = useState('')
  const [lastUserResponse, setLastUserResponse] = useState('')
  
  const retellWebClientRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false) // Prevent double initialization
  const router = useRouter()

  useEffect(() => {
    // Prevent duplicate calls in React Strict Mode
    if (isInitializedRef.current) return
    isInitializedRef.current = true
    
    // Real API call enabled
    initializeCall()

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
      const retellWebClient = new RetellWebClient()
      retellWebClientRef.current = retellWebClient

      // Set up event listeners
      retellWebClient.on('call_started', () => {
        console.log('Call started')
        setCallStatus('active')
        startTimer()
        toast.success('Interview started')
      })

      retellWebClient.on('call_ended', () => {
        console.log('Call ended')
        handleCallEnd()
      })

      retellWebClient.on('error', (error: any) => {
        console.error('Retell error:', error)
        toast.error('Connection error')
        setCallStatus('ended')
      })

      retellWebClient.on('update', (update: any) => {
        // Handle conversation updates from Retell
        if (update.transcript && Array.isArray(update.transcript)) {
          const transcripts = update.transcript
          const roleContents: { [key: string]: string } = {}

          transcripts.forEach((transcript: any) => {
            if (transcript?.role && transcript?.content) {
              roleContents[transcript.role] = transcript.content
            }
          })

          if (roleContents['agent']) {
            setLastInterviewerResponse(roleContents['agent'])
          }
          if (roleContents['user']) {
            setLastUserResponse(roleContents['user'])
          }
        }
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
    toast.success('Interview completed')
    
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
      <div className="max-w-xl mx-auto mt-12">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Interview Complete</h2>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with Timer */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${callStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm font-medium text-gray-700">
              {callStatus === 'connecting' ? 'Connecting...' : 'Interview in Progress'}
            </span>
          </div>
          
          {callStatus === 'active' && (
            <div className="flex items-center gap-4">
              <div className="text-sm font-mono text-gray-900">{formatTime(timeRemaining)}</div>
              
              <div className="flex gap-2">
                <button
                  onClick={toggleMute}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    isMuted
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
                
                <button
                  onClick={endCall}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                >
                  End Interview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two Panel Layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Interviewer Panel */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900">AI Interviewer</h3>
            <p className="text-xs text-gray-500 mt-1">Nursing Expert</p>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {lastInterviewerResponse ? (
              <div className="bg-blue-50 rounded p-3">
                <p className="text-sm text-gray-700">{lastInterviewerResponse}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">Waiting for interviewer...</p>
            )}
          </div>
        </div>

        {/* User Panel */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center mb-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900">You</h3>
            <p className="text-xs text-gray-500 mt-1">Candidate</p>
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {lastUserResponse ? (
              <div className="bg-gray-50 rounded p-3">
                <p className="text-sm text-gray-700">{lastUserResponse}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-8">Your responses will appear here...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
