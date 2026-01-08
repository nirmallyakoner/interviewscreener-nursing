'use client'

import { CallAnalysisCard } from './CallAnalysisCard'

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

interface CallAnalysisListProps {
  sessions: InterviewSession[]
  showTranscript?: boolean
}

export function CallAnalysisList({ sessions, showTranscript = true }: CallAnalysisListProps) {
  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 border border-gray-200 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Interview History Yet
          </h3>
          <p className="text-gray-600 text-sm">
            Complete your first interview to see detailed analysis and feedback here.
          </p>
        </div>
      </div>
    )
  }

  // Sort sessions by most recent first
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  )

  return (
    <div className="space-y-6">
      {sortedSessions.map((session) => (
        <CallAnalysisCard
          key={session.id}
          session={session}
          showTranscript={showTranscript}
        />
      ))}
    </div>
  )
}
