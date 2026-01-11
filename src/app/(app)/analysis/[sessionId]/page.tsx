'use client'

import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { 
  CheckCircle, AlertCircle, XCircle, ArrowLeft, 
  TrendingUp, Award, Target, Lightbulb, AlertTriangle, RefreshCw
} from 'lucide-react'

interface AnalysisResult {
  question_id: string
  question_text: string
  user_answer: string
  correct_answer: string
  performance_category: string
  score: number
  feedback: string
  missing_points: string[]
  incorrect_points: string[]
}

export default function SessionAnalysisPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params) // Unwrap params Promise
  const [loading, setLoading] = useState(true)
  const [evaluating, setEvaluating] = useState(false)
  const [session, setSession] = useState<any>(null)
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [stats, setStats] = useState({ perfect: 0, moderate: 0, wrong: 0, average: 0 })
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadAnalysis()
  }, [sessionId])

  const loadAnalysis = async () => {
    try {
      // Get session details
      const { data: sessionData, error: sessionError } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError

      setSession(sessionData)

      // Get answer analysis with question text
      const { data: analysisData, error: analysisError } = await supabase
        .from('interview_answer_analysis')
        .select(`
          *,
          question:interview_questions(text)
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (analysisError) throw analysisError

      // Transform data to match AnalysisResult interface
      const formattedResults = (analysisData || []).map((item: any) => ({
        ...item,
        question_text: item.question?.text || 'Question text not available'
      }))

      setResults(formattedResults)

      // Calculate stats
      if (analysisData && analysisData.length > 0) {
        const perfect = analysisData.filter(r => r.performance_category === 'perfect').length
        const moderate = analysisData.filter(r => r.performance_category === 'moderate').length
        const wrong = analysisData.filter(r => r.performance_category === 'wrong').length
        const average = analysisData.reduce((sum, r) => sum + r.score, 0) / analysisData.length

        setStats({ perfect, moderate, wrong, average: parseFloat(average.toFixed(1)) })
      }
    } catch (error: any) {
      console.error('Error loading analysis:', error)
      toast.error('Failed to load analysis')
    } finally {
      setLoading(false)
    }
  }

  const handleEvaluate = async () => {
    if (!session?.transcript) {
      toast.error('No transcript available for this interview')
      return
    }

    setEvaluating(true)
    try {
      const response = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          transcript: session.transcript
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Evaluation failed')
      }

      toast.success('Evaluation completed! Reloading...')
      setTimeout(() => loadAnalysis(), 1500)
    } catch (error: any) {
      console.error('Evaluation error:', error)
      toast.error(error.message || 'Failed to evaluate')
    } finally {
      setEvaluating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  if (!session || results.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">
          {!session ? 'Interview Not Found' : 'No Analysis Available'}
        </h3>
        <p className="text-slate-400 mb-6">
          {!session 
            ? 'This interview session could not be found.' 
            : session.transcript
              ? 'This interview hasn\'t been analyzed yet. Click below to evaluate your answers.'
              : 'No transcript available for this interview.'}
        </p>
        {session?.transcript && (
          <button
            onClick={handleEvaluate}
            disabled={evaluating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${evaluating ? 'animate-spin' : ''}`} />
            {evaluating ? 'Evaluating...' : 'Evaluate Now'}
          </button>
        )}
        <Link 
          href="/analysis" 
          className="block mt-4 text-teal-400 hover:text-teal-300"
        >
          ← Back to Analysis
        </Link>
      </div>
    )
  }

  const focusAreas = results
    .filter(r => r.performance_category === 'wrong' || r.performance_category === 'moderate')
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Back Button */}
      <Link 
        href="/analysis"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Analysis
      </Link>

      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">Interview Analysis</h1>
        <p className="text-teal-50">
          {new Date(session.created_at).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Performance Summary */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Performance Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-slate-400 text-sm">Perfect</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.perfect}</div>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-slate-400 text-sm">Moderate</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.moderate}</div>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-slate-400 text-sm">Wrong</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.wrong}</div>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-teal-500" />
              <span className="text-slate-400 text-sm">Average</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.average}<span className="text-lg text-slate-400">/100</span></div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-400">
            <span>Overall Performance</span>
            <span>{stats.average}%</span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${
                stats.average >= 90 ? 'bg-green-500' :
                stats.average >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${stats.average}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Breakdown */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Question-by-Question Breakdown</h2>

        <div className="space-y-4">
          {/* Perfect Answers */}
          {results.filter(r => r.performance_category === 'perfect').length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-green-500 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Perfect Answers ({results.filter(r => r.performance_category === 'perfect').length})
              </h3>
              <div className="space-y-3">
                {results.filter(r => r.performance_category === 'perfect').map((result, index) => (
                  <div key={index} className="bg-green-900/10 border border-green-500/20 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-white font-medium flex-1">{result.question_text}</p>
                      <span className="px-3 py-1 bg-green-900 text-green-200 rounded-full text-sm font-bold ml-4">
                        {result.score}/100
                      </span>
                    </div>
                    <p className="text-sm text-green-400 mb-2">✓ {result.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Moderate Answers */}
          {results.filter(r => r.performance_category === 'moderate').length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-yellow-500 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Needs Improvement ({results.filter(r => r.performance_category === 'moderate').length})
              </h3>
              <div className="space-y-3">
                {results.filter(r => r.performance_category === 'moderate').map((result, index) => (
                  <div key={index} className="bg-yellow-900/10 border border-yellow-500/20 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-white font-medium flex-1">{result.question_text}</p>
                      <span className="px-3 py-1 bg-yellow-900 text-yellow-200 rounded-full text-sm font-bold ml-4">
                        {result.score}/100
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-slate-400 mb-1">Your Answer:</p>
                        <p className="text-slate-300 bg-slate-900 rounded p-2">{result.user_answer}</p>
                      </div>
                      
                      <p className="text-yellow-400">⚠ {result.feedback}</p>
                      
                      {result.missing_points && result.missing_points.length > 0 && (
                        <div>
                          <p className="text-slate-400 mb-1">Missing Points:</p>
                          <ul className="list-disc list-inside text-slate-300 space-y-1">
                            {result.missing_points.map((point, i) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Wrong Answers */}
          {results.filter(r => r.performance_category === 'wrong').length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-red-500 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Needs Focus ({results.filter(r => r.performance_category === 'wrong').length})
              </h3>
              <div className="space-y-3">
                {results.filter(r => r.performance_category === 'wrong').map((result, index) => (
                  <div key={index} className="bg-red-900/10 border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-white font-medium flex-1">{result.question_text}</p>
                      <span className="px-3 py-1 bg-red-900 text-red-200 rounded-full text-sm font-bold ml-4">
                        {result.score}/100
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-slate-400 mb-1">Your Answer:</p>
                        <p className="text-slate-300 bg-slate-900 rounded p-2">{result.user_answer}</p>
                      </div>
                      
                      <div>
                        <p className="text-slate-400 mb-1">Correct Answer:</p>
                        <p className="text-green-300 bg-slate-900 rounded p-2">{result.correct_answer}</p>
                      </div>
                      
                      <p className="text-red-400">✗ {result.feedback}</p>
                      
                      {result.incorrect_points && result.incorrect_points.length > 0 && (
                        <div>
                          <p className="text-slate-400 mb-1">Incorrect Points:</p>
                          <ul className="list-disc list-inside text-red-300 space-y-1">
                            {result.incorrect_points.map((point, i) => (
                              <li key={i}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Focus Areas */}
      {focusAreas.length > 0 && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-6 h-6 text-teal-400" />
            <h2 className="text-xl font-bold text-white">Focus Areas for Next Practice</h2>
          </div>
          <p className="text-slate-400 mb-4">Practice these questions to improve your performance:</p>
          <div className="space-y-2">
            {focusAreas.map((result, index) => (
              <div key={index} className="flex items-center gap-3 bg-slate-900 rounded-lg p-3 border border-slate-700">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <span className="text-white">{result.question_text}</span>
                <span className="ml-auto px-2 py-1 bg-slate-800 text-slate-300 rounded text-sm">
                  {result.score}/100
                </span>
              </div>
            ))}
          </div>
          <Link 
            href="/question-bank"
            className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl transition-colors"
          >
            <Lightbulb className="w-5 h-5" />
            Practice in Question Bank
          </Link>
        </div>
      )}
    </div>
  )
}
