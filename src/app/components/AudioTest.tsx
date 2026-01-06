'use client'

import { useState, useEffect, useRef } from 'react'

interface AudioTestProps {
  onTestComplete: () => void
}

export function AudioTest({ onTestComplete }: AudioTestProps) {
  const [micPermission, setMicPermission] = useState<'pending' | 'granted' | 'denied'>('pending')
  const [micLevel, setMicLevel] = useState(0)
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
      
      const checkLevel = () => {
        if (!analyserRef.current) return
        
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setMicLevel(Math.min(100, (average / 128) * 100))
        
        if (isTestingMic) {
          requestAnimationFrame(checkLevel)
        }
      }
      
      checkLevel()
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

  const canContinue = micPermission === 'granted' && speakerTested && micLevel > 10

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">🎤 Audio Setup</h2>
      
      {/* Microphone Test */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Microphone Test</h3>
        
        {micPermission === 'pending' && (
          <button
            onClick={testMicrophone}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all cursor-pointer"
          >
            Test Microphone
          </button>
        )}
        
        {micPermission === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">
              ❌ Microphone access denied. Please allow microphone access in your browser settings and try again.
            </p>
          </div>
        )}
        
        {micPermission === 'granted' && (
          <div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Audio Level</span>
                <span className="text-sm font-semibold text-gray-900">{Math.round(micLevel)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ${
                    micLevel > 50 ? 'bg-green-500' : micLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${micLevel}%` }}
                />
              </div>
            </div>
            
            {micLevel > 10 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-700 text-sm">✓ Microphone working! Speak to see the level change.</p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-yellow-700 text-sm">💡 Try speaking to test your microphone</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Speaker Test */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Speaker Test</h3>
        
        <button
          onClick={playSpeakerTest}
          disabled={micPermission !== 'granted'}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mb-3"
        >
          🔊 Play Test Sound
        </button>
        
        {speakerTested && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-700 text-sm">✓ Speaker test completed</p>
          </div>
        )}
      </div>
      
      {/* Continue Button */}
      <button
        onClick={onTestComplete}
        disabled={!canContinue}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl cursor-pointer"
      >
        {canContinue ? 'Continue to Interview →' : 'Complete Audio Tests First'}
      </button>
      
      {!canContinue && micPermission === 'granted' && (
        <p className="text-center text-sm text-gray-500 mt-3">
          💡 Make sure to test both microphone and speaker before continuing
        </p>
      )}
    </div>
  )
}
