'use client'

import { useState, useEffect, useRef } from 'react'

interface AudioTestProps {
  onTestComplete: () => void
}

export function AudioTest({ onTestComplete }: AudioTestProps) {
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending')
  const [micLevel, setMicLevel] = useState(0)
  const [micTested, setMicTested] = useState(false) // Track if mic test passed
  const [speakerTested, setSpeakerTested] = useState(false)
  const [isTestingMic, setIsTestingMic] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      // Cleanup
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

      // Create audio context and analyser
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      
      analyser.fftSize = 256
      microphone.connect(analyser)
      
      audioContextRef.current = audioContext
      analyserRef.current = analyser

      // Monitor audio level
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      let animationId: number
      
      const checkLevel = () => {
        if (!analyserRef.current) return
        
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        const level = Math.min(100, (average / 128) * 100)
        setMicLevel(level)
        
        // Once level crosses 15%, mark as tested
        if (level > 15) {
          setMicTested(true)
        }
        
        // Continue animation loop
        animationId = requestAnimationFrame(checkLevel)
      }
      
      checkLevel()
      
      // Store animation ID for cleanup
      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId)
        }
      }
    } catch (error: any) {
      console.error('Microphone error:', error)
      
      if (error.name === 'NotAllowedError') {
        setMicPermission('denied')
      } else if (error.name === 'NotFoundError') {
        alert('No microphone detected. Please connect a microphone.')
      } else {
        alert('Failed to access microphone. Please check your settings.')
      }
      
      setIsTestingMic(false)
    }
  }

  const playSpeakerTest = () => {
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.value = 440 // A4 note
    gainNode.gain.value = 0.3
    
    oscillator.start()
    setTimeout(() => {
      oscillator.stop()
      audioContext.close()
    }, 1000)
    
    setSpeakerTested(true)
  }

  const canContinue = micPermission === 'granted' && speakerTested && micTested

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-light text-gray-900 mb-2">Audio Setup</h1>
        <p className="text-gray-500 text-sm">Ensure your equipment is ready for the interview</p>
      </div>

      {/* Test Cards */}
      <div className="space-y-4">
        {/* Microphone Test Card */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">Microphone</h3>
                  <p className="text-xs text-gray-500">Test your audio input</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {micTested && (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                )}
                
                {micPermission === 'pending' && (
                  <button
                    onClick={testMicrophone}
                    className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors"
                  >
                    Test Microphone
                  </button>
                )}
              </div>
            </div>

            {micPermission === 'denied' && (
              <div className="mt-4 bg-red-50 border border-red-100 rounded p-3">
                <div className="flex gap-2">
                  <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-red-900">Access Denied</p>
                    <p className="text-xs text-red-700 mt-0.5">Enable microphone access in browser settings</p>
                  </div>
                </div>
              </div>
            )}

            {micPermission === 'granted' && (
              <div className="mt-4 space-y-3">
                {/* Audio Level Visualizer */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Input Level</span>
                    <span className="text-xs font-mono text-gray-900">{Math.round(micLevel)}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gray-500 via-gray-700 to-gray-900 transition-all duration-150 ease-out"
                      style={{ width: `${micLevel}%` }}
                    />
                  </div>
                </div>

                {/* Status Message */}
                {!micTested && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs">Speak naturally to verify your microphone</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Speaker Test Card */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900">Speaker</h3>
                  <p className="text-xs text-gray-500">Test your audio output</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {speakerTested && (
                  <div className="flex items-center gap-1.5 text-green-600">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium">Verified</span>
                  </div>
                )}

                <button
                  onClick={playSpeakerTest}
                  disabled={micPermission !== 'granted'}
                  className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Play Test Tone
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="mt-6">
        <button
          onClick={onTestComplete}
          disabled={!canContinue}
          className="w-full py-3 px-6 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {canContinue ? 'Continue to Interview' : 'Complete Audio Tests'}
        </button>
        
        {!canContinue && micPermission === 'granted' && (
          <p className="text-center text-xs text-gray-500 mt-2">
            Please complete both microphone and speaker tests
          </p>
        )}
      </div>
    </div>
  )
}
