'use client'

import { useState, useEffect, useRef } from 'react'
import { Mic, Volume2, CheckCircle2, AlertCircle, Waves, Play } from 'lucide-react'
import { analytics } from '@/lib/analytics'

interface AudioTestProps {
  onTestComplete: () => void
}

export function AudioTest({ onTestComplete }: AudioTestProps) {
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending')
  const [micLevel, setMicLevel] = useState(0)
  const [micTested, setMicTested] = useState(false)
  const [speakerTested, setSpeakerTested] = useState(false)
  const [isTestingMic, setIsTestingMic] = useState(false)
  const [isPlayingSound, setIsPlayingSound] = useState(false)
  const [barLevels, setBarLevels] = useState<number[]>(Array(30).fill(0))
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const testMicrophone = async () => {
    setIsTestingMic(true)
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setMicPermission('granted')

      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.8
      microphone.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      let animationId: number
      
      const checkLevel = () => {
        if (!analyserRef.current) return
        
        analyserRef.current.getByteFrequencyData(dataArray)
        
        // Calculate overall level
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        const level = Math.min(100, (average / 128) * 100)
        setMicLevel(level)
        
        // Create bar levels from frequency data
        const barCount = 30
        const newBarLevels = []
        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * dataArray.length)
          const value = dataArray[dataIndex]
          newBarLevels.push(Math.min(100, (value / 255) * 100))
        }
        setBarLevels(newBarLevels)
        
        if (level > 15) {
          setMicTested(true)
        }
        
        animationId = requestAnimationFrame(checkLevel)
      }
      
      checkLevel()
      
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
      }
    } catch (error: any) {
      console.error('Microphone error:', error)
      
      if (error.name === 'NotAllowedError') {
        setMicPermission('denied')
      }
      
      setIsTestingMic(false)
    }
  }

  const playSpeakerTest = () => {
    setIsPlayingSound(true)
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 440
    gainNode.gain.value = 0.3
    
    oscillator.start()
    setTimeout(() => {
      oscillator.stop()
      audioContext.close()
      setIsPlayingSound(false)
    }, 1000)
    
    setSpeakerTested(true)
  }

  const canContinue = micPermission === 'granted' && speakerTested && micTested

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Microphone Test Card */}
      <div className={`relative overflow-hidden rounded-xl border transition-all ${
        micTested 
          ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30' 
          : micPermission === 'granted'
          ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/30'
          : 'bg-slate-900 border-slate-700'
      }`}>
        {/* Animated Background */}
        {micPermission === 'granted' && !micTested && (
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          </div>
        )}

        <div className="relative z-10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                micTested 
                  ? 'bg-emerald-500/20' 
                  : micPermission === 'granted'
                  ? 'bg-blue-500/20'
                  : 'bg-slate-800'
              }`}>
                {micTested ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Mic className={`w-5 h-5 ${
                    micPermission === 'granted' ? 'text-blue-400' : 'text-slate-500'
                  }`} />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Microphone Test</h3>
                <p className="text-xs text-slate-400">Test your audio input</p>
              </div>
            </div>

            {micTested && (
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <span className="text-xs font-bold text-emerald-400">✓ Verified</span>
              </div>
            )}
          </div>

          {micPermission === 'pending' && (
            <button
              onClick={testMicrophone}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Mic className="w-4 h-4" />
              Test Microphone
            </button>
          )}

          {micPermission === 'denied' && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-rose-400 mb-0.5">Microphone Access Denied</p>
                  <p className="text-xs text-slate-400">Please enable microphone permissions in your browser settings.</p>
                </div>
              </div>
            </div>
          )}

          {micPermission === 'granted' && (
            <div className="space-y-3">
              {/* Sound Visualizer - Animated Bars */}
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Waves className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-semibold text-white">Input Level</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-400">{Math.round(micLevel)}%</span>
                </div>
                
                {/* Animated Frequency Bars */}
                <div className="flex items-end justify-between gap-[2px] h-20 mb-2">
                  {barLevels.map((level, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t transition-all duration-100 ease-out"
                      style={{
                        height: `${Math.max(5, level)}%`,
                        backgroundColor: 
                          level > 70 ? '#10b981' : 
                          level > 40 ? '#3b82f6' : 
                          level > 10 ? '#6366f1' : 
                          '#475569',
                        opacity: level > 5 ? 1 : 0.3,
                        boxShadow: level > 70 ? '0 0 8px rgba(16, 185, 129, 0.5)' : 
                                   level > 40 ? '0 0 6px rgba(59, 130, 246, 0.4)' : 'none'
                      }}
                    ></div>
                  ))}
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ${
                      micLevel > 60 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                      micLevel > 30 ? 'bg-gradient-to-r from-blue-500 to-indigo-400' :
                      'bg-gradient-to-r from-slate-500 to-slate-600'
                    }`}
                    style={{ width: `${micLevel}%` }}
                  ></div>
                </div>
              </div>

              {!micTested && (
                <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-400">
                    <span className="font-semibold">Speak into your microphone</span> to verify it's working
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Speaker Test Card */}
      <div className={`relative overflow-hidden rounded-xl border transition-all ${
        speakerTested 
          ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30' 
          : 'bg-slate-900 border-slate-700'
      }`}>
        <div className="relative z-10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                speakerTested 
                  ? 'bg-emerald-500/20' 
                  : isPlayingSound
                  ? 'bg-purple-500/20'
                  : 'bg-slate-800'
              }`}>
                {speakerTested ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Volume2 className={`w-5 h-5 ${
                    isPlayingSound ? 'text-purple-400' : 'text-slate-500'
                  }`} />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Speaker Test</h3>
                <p className="text-xs text-slate-400">Test your audio output</p>
              </div>
            </div>

            {speakerTested && (
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <span className="text-xs font-bold text-emerald-400">✓ Verified</span>
              </div>
            )}
          </div>

          <button
            onClick={playSpeakerTest}
            disabled={micPermission !== 'granted' || isPlayingSound}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              micPermission !== 'granted'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isPlayingSound
                ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400'
                : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <Play className="w-4 h-4" />
            {isPlayingSound ? 'Playing...' : 'Play Test Tone'}
          </button>

          {micPermission !== 'granted' && (
            <p className="text-xs text-slate-500 text-center mt-2">
              Complete microphone test first
            </p>
          )}
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={() => {
          analytics.trackAudioTestCompleted()
          onTestComplete()
        }}
        disabled={!canContinue}
        className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
          canContinue
            ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:shadow-xl hover:shadow-teal-500/25 hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        {canContinue ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Continue to Interview
          </>
        ) : (
          'Complete Both Tests to Continue'
        )}
      </button>

      {!canContinue && micPermission === 'granted' && (
        <p className="text-center text-xs text-slate-400">
          {!micTested && !speakerTested && 'Please speak into your microphone and test your speakers'}
          {micTested && !speakerTested && 'Great! Now test your speakers'}
          {!micTested && speakerTested && 'Please speak into your microphone to verify it works'}
        </p>
      )}
    </div>
  )
}
