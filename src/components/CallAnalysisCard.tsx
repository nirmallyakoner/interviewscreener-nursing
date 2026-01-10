'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, CheckCircle2, XCircle, TrendingUp, Lightbulb, AlertCircle, Mic2, ChevronDown, Play } from 'lucide-react'

// Retell's actual analysis structure
interface CallAnalysis {
  summary?: string              // Retell's call summary
  successful?: boolean          // Whether the call was successful
  call_summary?: string         // Detailed call summary
  user_sentiment?: string       // User sentiment (Positive/Neutral/Negative)
  in_voicemail?: boolean        // Whether call went to voicemail
  custom_analysis_data?: any    // Any custom extraction data
  
  // Legacy fields (for backward compatibility)
  overall_score?: number
  overall_feedback?: string
  strengths?: string[]
  improvements?: string[]
  recommendations?: string[]
  communication_score?: number
  knowledge_score?: number
  confidence_score?: number
}

interface InterviewSession {
  id: string
  started_at: string
  ended_at?: string
  actual_duration_seconds?: number
  transcript?: string
  analysis?: CallAnalysis
  status: string
  recording_url?: string  // URL to the call recording
}

interface CallAnalysisCardProps {
  session: InterviewSession
  showTranscript?: boolean
}

export function CallAnalysisCard({ session, showTranscript = true }: CallAnalysisCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    console.log('[CallAnalysisCard] Rendering with session:', {
      id: session.id,
      started_at: session.started_at,
      has_analysis: !!session.analysis,
      has_transcript: !!session.transcript,
      status: session.status,
      analysis_data: session.analysis
    })
  }, [session])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-slate-400'
    if (score >= 80) return 'text-emerald-400'
    if (score >= 60) return 'text-amber-400'
    return 'text-rose-400'
  }

  const getScoreGradient = (score?: number) => {
    if (!score) return 'from-slate-500/10 to-slate-600/10'
    if (score >= 80) return 'from-emerald-500/10 to-teal-500/10'
    if (score >= 60) return 'from-amber-500/10 to-orange-500/10'
    return 'from-rose-500/10 to-red-500/10'
  }

  const getScoreBorder = (score?: number) => {
    if (!score) return 'border-slate-700'
    if (score >= 80) return 'border-emerald-500/20'
    if (score >= 60) return 'border-amber-500/20'
    return 'border-rose-500/20'
  }

  const analysis = session.analysis

  if (!analysis) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <p className="text-sm text-slate-400">{formatDate(session.started_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <p className="text-sm text-slate-400">{formatDuration(session.actual_duration_seconds)}</p>
            </div>
          </div>
          <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-full animate-pulse">
            Processing...
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Analysis is being processed. Please check back in a few minutes.
        </p>
      </div>
    )
  }

  const getSentimentColor = (sentiment?: string) => {
    if (!sentiment) return 'text-slate-400'
    if (sentiment.toLowerCase() === 'positive') return 'text-emerald-400'
    if (sentiment.toLowerCase() === 'negative') return 'text-rose-400'
    return 'text-amber-400'
  }

  const getSentimentBg = (sentiment?: string) => {
    if (!sentiment) return 'bg-slate-500/10 border-slate-500/20'
    if (sentiment.toLowerCase() === 'positive') return 'bg-emerald-500/10 border-emerald-500/20'
    if (sentiment.toLowerCase() === 'negative') return 'bg-rose-500/10 border-rose-500/20'
    return 'bg-amber-500/10 border-amber-500/20'
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 hover:border-slate-600 transition-all">
      {/* Subtle animated background */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <p className="text-sm text-slate-400">{formatDate(session.started_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <p className="text-sm text-slate-400">Duration: {formatDuration(session.actual_duration_seconds)}</p>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2 justify-end">
            {analysis.successful !== undefined && (
              <div className={`px-3 py-1.5 rounded-full border ${
                analysis.successful 
                  ? 'bg-emerald-500/10 border-emerald-500/20' 
                  : 'bg-rose-500/10 border-rose-500/20'
              }`}>
                <div className="flex items-center gap-1.5">
                  {analysis.successful ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  <p className={`text-xs font-bold ${
                    analysis.successful ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {analysis.successful ? 'Successful' : 'Needs Work'}
                  </p>
                </div>
              </div>
            )}
            
            {analysis.user_sentiment && (
              <div className={`px-3 py-1.5 rounded-full border ${getSentimentBg(analysis.user_sentiment)}`}>
                <p className={`text-xs font-bold ${getSentimentColor(analysis.user_sentiment)}`}>
                  {analysis.user_sentiment}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Overall Score - Large Display */}
        {analysis.overall_score !== undefined && (
          <div className={`mb-6 p-6 rounded-2xl bg-gradient-to-br ${getScoreGradient(analysis.overall_score)} border ${getScoreBorder(analysis.overall_score)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Overall Performance</p>
                <p className={`text-5xl font-bold ${getScoreColor(analysis.overall_score)}`}>
                  {analysis.overall_score}<span className="text-2xl">%</span>
                </p>
              </div>
              <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center">
                <TrendingUp className={`w-10 h-10 ${getScoreColor(analysis.overall_score)}`} />
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-4 w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${
                  analysis.overall_score >= 80 ? 'from-emerald-500 to-teal-400' :
                  analysis.overall_score >= 60 ? 'from-amber-500 to-orange-400' :
                  'from-rose-500 to-red-400'
                } transition-all duration-1000`}
                style={{ width: `${analysis.overall_score}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Call Summary */}
        {(analysis.summary || analysis.call_summary) && (
          <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10">
                <Mic2 className="w-4 h-4 text-teal-400" />
              </div>
              Interview Summary
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {analysis.summary || analysis.call_summary}
            </p>
          </div>
        )}

        {/* Legacy Overall Feedback */}
        {analysis.overall_feedback && (
          <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
            <h4 className="text-sm font-bold text-white mb-3">Detailed Feedback</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {analysis.overall_feedback}
            </p>
          </div>
        )}

        {/* Score Breakdown */}
        {(analysis.communication_score !== undefined || 
          analysis.knowledge_score !== undefined || 
          analysis.confidence_score !== undefined) && (
          <div className="mb-6">
            <h4 className="text-sm font-bold text-white mb-4">Performance Breakdown</h4>
            <div className="grid grid-cols-3 gap-3">
              {analysis.communication_score !== undefined && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-center">
                  <p className="text-xs text-slate-400 mb-2">Communication</p>
                  <p className={`text-2xl font-bold ${getScoreColor(analysis.communication_score)}`}>
                    {analysis.communication_score}%
                  </p>
                </div>
              )}
              {analysis.knowledge_score !== undefined && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 text-center">
                  <p className="text-xs text-slate-400 mb-2">Knowledge</p>
                  <p className={`text-2xl font-bold ${getScoreColor(analysis.knowledge_score)}`}>
                    {analysis.knowledge_score}%
                  </p>
                </div>
              )}
              {analysis.confidence_score !== undefined && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-center">
                  <p className="text-xs text-slate-400 mb-2">Confidence</p>
                  <p className={`text-2xl font-bold ${getScoreColor(analysis.confidence_score)}`}>
                    {analysis.confidence_score}%
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Strengths */}
        {analysis.strengths && analysis.strengths.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Strengths
            </h4>
            <ul className="space-y-2">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Improvement */}
        {analysis.improvements && analysis.improvements.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {analysis.improvements.map((improvement, index) => (
                <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-amber-400 mt-1">•</span>
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="mb-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-400" />
              Recommendations
            </h4>
            <ul className="space-y-2">
              {analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-slate-300 flex items-start gap-2">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Call Recording */}
        {session.recording_url && (
          <div className="mb-6 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-purple-400" />
              Call Recording
            </h4>
            <audio 
              controls 
              className="w-full"
              preload="metadata"
              style={{ height: '40px', filter: 'invert(1) hue-rotate(180deg)' }}
            >
              <source src={session.recording_url} type="audio/wav" />
              <source src={session.recording_url} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <p className="text-xs text-slate-500 mt-3">
              💡 Tip: Use this recording to review your responses and improve your interview skills
            </p>
          </div>
        )}

        {/* Transcript Toggle */}
        {showTranscript && session.transcript && (
          <div className="border-t border-slate-700 pt-6">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center justify-between w-full text-left p-3 sm:p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 hover:border-indigo-500/40 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors">
                  <Mic2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Interview Transcript</h4>
                  <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">Full conversation recording</p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-indigo-400 transition-transform duration-300 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isExpanded && (
              <div className="mt-4 p-3 sm:p-6 bg-slate-900/50 rounded-xl border border-slate-700 max-h-[500px] sm:max-h-96 overflow-y-auto">
                <div className="space-y-3 sm:space-y-4">
                  {session.transcript.split('\n').map((line, index) => {
                    const isAgent = line.toLowerCase().startsWith('agent:')
                    const isUser = line.toLowerCase().startsWith('user:')
                    
                    if (!line.trim()) return null
                    
                    return (
                      <div key={index} className={`flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                          isAgent ? 'bg-teal-500/20 border border-teal-500/30' : 
                          isUser ? 'bg-blue-500/20 border border-blue-500/30' : 
                          'bg-slate-700'
                        }`}>
                          {isAgent ? (
                            <span className="text-teal-400 text-[10px] sm:text-xs font-bold">AI</span>
                          ) : isUser ? (
                            <span className="text-blue-400 text-[10px] sm:text-xs font-bold">You</span>
                          ) : (
                            <span className="text-slate-400 text-xs">•</span>
                          )}
                        </div>
                        
                        {/* Message Bubble */}
                        <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
                          <div className={`inline-block w-full sm:max-w-[85%] p-2.5 sm:p-3 rounded-2xl ${
                            isAgent ? 'bg-teal-500/10 border border-teal-500/20 rounded-tl-sm' :
                            isUser ? 'bg-blue-500/10 border border-blue-500/20 rounded-tr-sm' :
                            'bg-slate-800/50 border border-slate-700'
                          }`}>
                            <p className="text-[13px] sm:text-sm text-slate-200 leading-relaxed break-words">
                              {line.replace(/^(Agent:|User:)\s*/i, '')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Scroll indicator */}
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700 text-center">
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    💡 Scroll to view full conversation
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
