'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { RetellWebClient } from 'retell-client-js-sdk'
import { Mic, MicOff, Phone, User, Bot, Clock } from 'lucide-react'

interface VoiceInterviewProps {
  durationMinutes: number
  onComplete: (transcript?: string) => void
}

export function VoiceInterview({ durationMinutes, onComplete }: VoiceInterviewProps) {
  const [callStatus, setCallStatus] = useState<'connecting' | 'active' | 'ended'>('connecting')
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60)
  const [isMuted, setIsMuted] = useState(false)
  const [callId, setCallId] = useState<string | null>(null)
  const [currentAgentMessage, setCurrentAgentMessage] = useState('')
  const [currentUserMessage, setCurrentUserMessage] = useState('')
  
  const retellWebClientRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isInitializedRef = useRef(false)
  const router = useRouter()

  useEffect(() => {
    if (isInitializedRef.current) return
    isInitializedRef.current = true
    
    initializeCall()

    return () => {
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
      const response = await fetch('/api/retell/create-call', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create call')
      }

      const data = await response.json()
      setCallId(data.call_id)

      const retellWebClient = new RetellWebClient()
      retellWebClientRef.current = retellWebClient

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
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 sm:p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${callStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
            <span className="text-sm font-semibold text-white">
              {callStatus === 'connecting' ? 'Connecting...' : 'Interview in Progress'}
            </span>
          </div>
          
          {callStatus === 'active' && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
                <Clock className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-mono font-bold text-white">{formatTime(timeRemaining)}</span>
              </div>
              
              <button
                onClick={toggleMute}
                className={`p-2 rounded-lg transition-all ${
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
                className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-rose-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                <span className="hidden sm:inline">End Interview</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Two Panel Layout - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* AI Interviewer Card */}
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-blue-500/20">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Bot className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Interviewer</h3>
              <p className="text-xs text-blue-300">Nursing Expert</p>
            </div>
          </div>
          
          {/* Current Message */}
          <div className="bg-slate-900/50 rounded-lg p-4 h-[250px] sm:h-[300px] overflow-y-auto custom-scrollbar">
            {currentAgentMessage ? (
              <p className="text-sm text-slate-200 leading-relaxed">{currentAgentMessage}</p>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-slate-500 text-center">Waiting for interviewer...</p>
              </div>
            )}
          </div>
        </div>

        {/* User Card */}
        <div className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border border-teal-500/30 rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-teal-500/20">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center">
              <User className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">You</h3>
              <p className="text-xs text-teal-300">Candidate</p>
            </div>
          </div>
          
          {/* Current Message */}
          <div className="bg-slate-900/50 rounded-lg p-4 h-[250px] sm:h-[300px] overflow-y-auto custom-scrollbar">
            {currentUserMessage ? (
              <p className="text-sm text-slate-200 leading-relaxed">{currentUserMessage}</p>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-slate-500 text-center">Your responses will appear here...</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
