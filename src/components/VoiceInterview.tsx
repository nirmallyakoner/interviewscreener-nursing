'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { RetellWebClient } from 'retell-client-js-sdk'
import { Mic, MicOff, Phone, User, Bot, Clock, Play, Smartphone } from 'lucide-react'
import { analytics } from '@/lib/analytics'

interface VoiceInterviewProps {
  durationMinutes: number
  onComplete: (transcript?: string) => void
}

export function VoiceInterview({ durationMinutes, onComplete }: VoiceInterviewProps) {
  const [callStatus, setCallStatus] = useState<'ready' | 'connecting' | 'active' | 'ended'>('ready')
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60)
  const [isMuted, setIsMuted] = useState(false)
  const [callId, setCallId] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [currentAgentMessage, setCurrentAgentMessage] = useState('')
  const [currentUserMessage, setCurrentUserMessage] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [countdown, setCountdown] = useState(12) // 12 second warning timer
  const [showWarning, setShowWarning] = useState(false)
  const [creditError, setCreditError] = useState<{
    available: number
    needed: number
    suggested: number[]
    maxDuration: number
    message: string
  } | null>(null)
  
  const retellWebClientRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)
  const router = useRouter()

  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true
    
    // Detect mobile
    const checkMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    setIsMobile(checkMobile)
    
    // Only prepare the call, don't start it
    prepareCall()

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current)
      }
      if (retellWebClientRef.current) {
        retellWebClientRef.current.stopCall()
      }
    }
  }, [])

  // Start countdown timer when ready (warning only, no auto-start)
  useEffect(() => {
    if (isReady && callStatus === 'ready' && countdown > 0) {
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Show warning when countdown reaches 0
            setShowWarning(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current)
        }
      }
    }
  }, [isReady, callStatus, countdown])

  const prepareCall = async () => {
    try {
      const response = await fetch('/api/retell/create-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duration: durationMinutes }),
      })

      if (!response.ok) {
        const error = await response.json()
        
        // Handle insufficient credits specially
        if (response.status === 403 && error.suggested_durations) {
          setCreditError({
            available: error.available_credits,
            needed: error.credits_needed,
            suggested: error.suggested_durations,
            maxDuration: error.max_duration,
            message: error.message
          })
          return
        }
        
        throw new Error(error.error || 'Failed to create call')
      }

      const data = await response.json()
      setCallId(data.call_id)
      setAccessToken(data.access_token)
      setIsReady(true)
    } catch (error) {
      console.error('Prepare call error:', error)
      toast.error('Failed to prepare interview')
      router.push('/dashboard')
    }
  }

  const handleStartInterview = async () => {
    if (!accessToken) {
      toast.error('Interview not ready. Please try again.')
      return
    }

    // Clear countdown timer if user clicks manually
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
    }

    setShowWarning(false) // Hide warning
    setIsStarting(true)
    setCallStatus('connecting')

    try {
      // Mobile-specific: Create and resume audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContext) {
        const audioContext = new AudioContext()
        if (audioContext.state === 'suspended') {
          await audioContext.resume()
          console.log('Audio context resumed for mobile')
        }
      }

      // Request microphone permission explicitly (helps with mobile)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach(track => track.stop()) // Stop immediately, Retell will handle it
        console.log('Microphone permission granted')
      } catch (err) {
        console.error('Microphone permission error:', err)
        toast.error('Microphone permission denied. Please enable it in browser settings.')
        setCallStatus('ready')
        setIsStarting(false)
        return
      }

      // Initialize Retell client
      const retellWebClient = new RetellWebClient()
      retellWebClientRef.current = retellWebClient

      retellWebClient.on('call_started', () => {
        console.log('Call started')
        setCallStatus('active')
        setIsStarting(false)
        startTimer()
        toast.success('Interview started')
        
        // Track interview started
        analytics.trackInterviewStarted('Nursing', durationMinutes)
      })

      retellWebClient.on('call_ended', () => {
        console.log('Call ended')
        handleCallEnd()
      })

      retellWebClient.on('error', (error: any) => {
        console.error('Retell error:', error)
        
        // Better error messages for mobile
        if (error.message?.includes('permission')) {
          toast.error('Microphone permission denied. Please enable it in browser settings.')
        } else if (error.message?.includes('secure') || error.message?.includes('https')) {
          toast.error('HTTPS required for mobile browsers')
        } else {
          toast.error('Connection error. Please try again.')
        }
        
        setCallStatus('ended')
        setIsStarting(false)
      })

      retellWebClient.on('update', (update: any) => {
        if (update.transcript && Array.isArray(update.transcript)) {
          const transcripts = update.transcript
          const roleContents: { [key: string]: string } = {}

          transcripts.forEach((transcript: any) => {
            if (transcript?.role && transcript?.content) {
              roleContents[transcript.role] = transcript.content
            }
          })

          if (roleContents['agent']) {
            setCurrentAgentMessage(roleContents['agent'])
          }
          if (roleContents['user']) {
            setCurrentUserMessage(roleContents['user'])
          }
        }
      })

      // Start the call (triggered by user gesture)
      try {
        // Add timeout wrapper for startCall
        const startCallPromise = retellWebClient.startCall({
          accessToken: accessToken,
        })

        // Set a timeout of 15 seconds for the call to start
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout')), 15000)
        })

        await Promise.race([startCallPromise, timeoutPromise])
      } catch (startError: any) {
        console.error('Start call error:', startError)
        
        // Handle specific error types
        if (startError.message?.includes('timeout') || startError.message?.includes('timed out')) {
          toast.error('Connection timeout. Please check your internet and try again.')
        } else if (startError.message?.includes('token') || startError.message?.includes('expired')) {
          toast.error('Session expired. Refreshing...')
          // Refresh the page to get a new token
          setTimeout(() => window.location.reload(), 2000)
          return
        } else {
          toast.error('Failed to start call. Please try again.')
        }
        
        setCallStatus('ready')
        setIsStarting(false)
        setCountdown(12) // Reset countdown
        setShowWarning(false) // Hide warning
        return
      }
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
    
    // Track interview completion
    analytics.trackInterviewCompleted('Nursing', durationMinutes)
    
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500/20 relative">
            <Phone className="w-10 h-10 text-emerald-400" />
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Interview Complete!</h2>
          <p className="text-slate-400">Redirecting to analysis...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Insufficient Credits UI */}
      {creditError && (
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 rounded-2xl p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-500/30">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Not Enough Credits</h3>
            <p className="text-amber-300/90 text-sm mb-4">{creditError.message}</p>
            
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 mb-1">Available Credits</p>
                  <p className="text-2xl font-bold text-teal-400">{creditError.available}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Credits Needed</p>
                  <p className="text-2xl font-bold text-amber-400">{creditError.needed}</p>
                </div>
              </div>
            </div>
          </div>

          {creditError.suggested.length > 0 ? (
            <>
              <h4 className="text-white font-bold mb-3 text-center">✨ Try These Durations Instead:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {creditError.suggested.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => {
                      toast.success(`Redirecting to ${duration}-minute interview...`)
                      setTimeout(() => window.location.href = `/interview?duration=${duration}`, 1000)
                    }}
                    className="p-4 bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border-2 border-teal-500/30 rounded-xl hover:border-teal-400 hover:shadow-lg hover:shadow-teal-500/20 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-white font-bold text-lg">{duration} Minutes</p>
                        <p className="text-teal-300 text-xs">~{duration * 10} credits</p>
                      </div>
                      <svg className="w-5 h-5 text-teal-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          <div className="border-t border-amber-500/20 pt-4">
            <p className="text-amber-300/70 text-sm text-center mb-4">Or purchase more credits to continue</p>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/billing')}
                className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold hover:from-teal-600 hover:to-emerald-700 transition-all cursor-pointer shadow-lg shadow-teal-500/20"
              >
                Buy Credits
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 border border-slate-700 text-slate-300 hover:text-white rounded-xl font-semibold hover:bg-slate-800 transition-all cursor-pointer"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Warning */}
      {isMobile && callStatus === 'ready' && !creditError && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 text-sm font-semibold mb-1">Mobile Device Detected</p>
              <p className="text-amber-300/70 text-xs">
                Make sure you're on HTTPS and grant microphone permissions when prompted
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Start Interview Button (shown when ready) */}
      {callStatus === 'ready' && !creditError && (
        <div className="text-center py-12">
          {/* Warning Message - Shows after 12 seconds */}
          {showWarning && (
            <div className="bg-rose-500/10 border-2 border-rose-500/30 rounded-xl p-4 mb-6 animate-pulse">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-rose-400" />
                </div>
                <div className="text-left">
                  <p className="text-rose-400 font-bold text-lg mb-1">⚠️ Time Limit Exceeded!</p>
                  <p className="text-rose-300/90 text-sm">
                    The session may not start properly now. Please click the button below immediately to start your interview.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className={`w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-teal-500/20 relative ${
              countdown <= 3 && countdown > 0 ? 'animate-pulse' : ''
            }`}>
              <Play className="w-10 h-10 text-teal-400" />
              {countdown <= 3 && countdown > 0 && (
                <div className="absolute inset-0 rounded-full border-2 border-amber-500 animate-ping"></div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Ready to Begin?</h3>
            <p className="text-slate-400 mb-2">
              Click the button below to start your interview
            </p>
            
            {/* Countdown Timer - Warning Only */}
            {countdown > 0 && !showWarning && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
                countdown <= 5 
                  ? 'bg-amber-500/20 border border-amber-500/30' 
                  : 'bg-blue-500/20 border border-blue-500/30'
              }`}>
                <Clock className={`w-4 h-4 ${countdown <= 5 ? 'text-amber-400' : 'text-blue-400'}`} />
                <span className={`text-sm font-bold ${countdown <= 5 ? 'text-amber-400' : 'text-blue-400'}`}>
                  {countdown <= 5 ? '⚠️ Hurry! ' : ''}Click within {countdown}s for best results
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={handleStartInterview}
            disabled={!isReady || isStarting}
            className={`px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold hover:from-teal-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-teal-500/20 inline-flex items-center gap-2 ${
              showWarning ? 'animate-bounce' : countdown <= 3 && countdown > 0 ? 'animate-pulse' : ''
            }`}
          >
            {isStarting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Starting Interview...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Click to Start
              </>
            )}
          </button>
          
          {!isReady && !isStarting && (
            <p className="text-slate-500 text-sm mt-4">Preparing interview...</p>
          )}
        </div>
      )}

      {/* Connecting State */}
      {callStatus === 'connecting' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-teal-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
          </div>
          <p className="text-slate-400">Connecting to interviewer...</p>
        </div>
      )}

      {/* Active Interview UI */}
      {callStatus === 'active' && (
        <div className="space-y-4">
          {/* Status Bar */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 sm:p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-sm font-semibold text-white">Interview in Progress</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-mono font-bold text-white">{formatTime(timeRemaining)}</span>
                </div>
                
                <button
                  onClick={toggleMute}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    isMuted
                      ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30'
                      : 'bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={endCall}
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">End Interview</span>
                </button>
              </div>
            </div>
          </div>

          {/* Conversation Panels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* AI Interviewer Panel */}
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm font-bold text-blue-300">AI Interviewer</span>
              </div>
              <div className="h-[250px] sm:h-[300px] overflow-y-auto custom-scrollbar">
                {currentAgentMessage ? (
                  <p className="text-sm text-slate-300 leading-relaxed">{currentAgentMessage}</p>
                ) : (
                  <p className="text-sm text-slate-500 italic">Listening...</p>
                )}
              </div>
            </div>

            {/* User Panel */}
            <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-teal-400" />
                </div>
                <span className="text-sm font-bold text-teal-300">You</span>
              </div>
              <div className="h-[250px] sm:h-[300px] overflow-y-auto custom-scrollbar">
                {currentUserMessage ? (
                  <p className="text-sm text-slate-300 leading-relaxed">{currentUserMessage}</p>
                ) : (
                  <p className="text-sm text-slate-500 italic">Speak your answer...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }
      `}</style>
    </div>
  )
}
