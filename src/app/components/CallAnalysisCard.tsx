'use client'

import { useState } from 'react'

interface CallAnalysis {
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
}

interface CallAnalysisCardProps {
  session: InterviewSession
  showTranscript?: boolean
}

export function CallAnalysisCard({ session, showTranscript = true }: CallAnalysisCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

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
    if (!score) return 'text-gray-500'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score?: number) => {
    if (!score) return 'bg-gray-100'
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const analysis = session.analysis

  if (!analysis) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm text-gray-500">
              {formatDate(session.started_at)}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Duration: {formatDuration(session.actual_duration_seconds)}
            </p>
          </div>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
            Processing...
          </span>
        </div>
        <p className="text-gray-500 text-sm">
          Analysis is being processed. Please check back in a few minutes.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-sm text-gray-500">
            {formatDate(session.started_at)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Duration: {formatDuration(session.actual_duration_seconds)}
          </p>
        </div>
        {analysis.overall_score !== undefined && (
          <div className={`px-4 py-2 ${getScoreBgColor(analysis.overall_score)} rounded-lg`}>
            <p className="text-xs text-gray-600 font-medium">Overall Score</p>
            <p className={`text-2xl font-bold ${getScoreColor(analysis.overall_score)}`}>
              {analysis.overall_score}%
            </p>
          </div>
        )}
      </div>

      {/* Overall Feedback */}
      {analysis.overall_feedback && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
          <p className="text-gray-600 text-sm leading-relaxed">
            {analysis.overall_feedback}
          </p>
        </div>
      )}

      {/* Score Breakdown */}
      {(analysis.communication_score !== undefined || 
        analysis.knowledge_score !== undefined || 
        analysis.confidence_score !== undefined) && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Performance Breakdown</h4>
          <div className="grid grid-cols-3 gap-3">
            {analysis.communication_score !== undefined && (
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Communication</p>
                <p className={`text-lg font-bold ${getScoreColor(analysis.communication_score)}`}>
                  {analysis.communication_score}%
                </p>
              </div>
            )}
            {analysis.knowledge_score !== undefined && (
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Knowledge</p>
                <p className={`text-lg font-bold ${getScoreColor(analysis.knowledge_score)}`}>
                  {analysis.knowledge_score}%
                </p>
              </div>
            )}
            {analysis.confidence_score !== undefined && (
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Confidence</p>
                <p className={`text-lg font-bold ${getScoreColor(analysis.confidence_score)}`}>
                  {analysis.confidence_score}%
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Strengths */}
      {analysis.strengths && analysis.strengths.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            Strengths
          </h4>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="text-green-500 mr-2 mt-0.5">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {analysis.improvements && analysis.improvements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <span className="text-yellow-600 mr-2">⚠</span>
            Areas for Improvement
          </h4>
          <ul className="space-y-2">
            {analysis.improvements.map((improvement, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="text-yellow-500 mr-2 mt-0.5">•</span>
                <span>{improvement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <span className="text-blue-600 mr-2">💡</span>
            Recommendations
          </h4>
          <ul className="space-y-2">
            {analysis.recommendations.map((recommendation, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="text-blue-500 mr-2 mt-0.5">•</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Transcript Toggle */}
      {showTranscript && session.transcript && (
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="text-sm font-semibold text-gray-700">
              Interview Transcript
            </h4>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isExpanded && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {session.transcript}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
