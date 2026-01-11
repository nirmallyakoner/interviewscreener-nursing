'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast, { Toaster } from 'react-hot-toast'
import { BookOpen, Upload, Sparkles, CheckCircle, AlertCircle, Circle } from 'lucide-react'

interface ParsedQuestion {
  text: string
  answer: string
  has_provided_answer: boolean
  competency: string
  follow_up_count: number
}

interface Question {
  id: string
  text: string
  answer: string
  mastery?: {
    mastered: boolean
    last_performance: string
    times_asked: number
    last_score: number
  }
}

export default function QuestionBankPage() {
  const [loading, setLoading] = useState(true)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  
  const [rawText, setRawText] = useState('')
  const [courseType, setCourseType] = useState('BSc Nursing')
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [stats, setStats] = useState({ total: 0, mastered: 0, needs_focus: 0, never_asked: 0 })
  
  const supabase = createClient()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('interview_questions')
        .select(`
          id,
          text,
          answer,
          mastery:user_question_mastery(
            mastered,
            last_performance,
            times_asked,
            last_score
          )
        `)
        .eq('created_by', user.id)  // Only show user's own questions
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedQuestions = data?.map((q: any) => ({
        ...q,
        mastery: Array.isArray(q.mastery) ? q.mastery[0] : q.mastery
      })) || []

      setQuestions(formattedQuestions)

      // Calculate stats
      const mastered = formattedQuestions.filter((q: any) => q.mastery?.mastered).length
      const needsFocus = formattedQuestions.filter((q: any) => 
        q.mastery?.last_performance === 'wrong' || q.mastery?.last_performance === 'moderate'
      ).length
      const neverAsked = formattedQuestions.filter((q: any) => !q.mastery || q.mastery.times_asked === 0).length

      setStats({
        total: formattedQuestions.length,
        mastered,
        needs_focus: needsFocus,
        never_asked: neverAsked
      })
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }

  const handleParse = async () => {
    if (!rawText.trim()) {
      toast.error('Please enter some text to parse')
      return
    }

    setParsing(true)
    try {
      const response = await fetch('/api/questions/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: rawText, course_type: courseType })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse questions')
      }

      setParsedQuestions(data.questions)
      toast.success(`Parsed ${data.questions.length} questions!`)
    } catch (error: any) {
      console.error('Parse error:', error)
      toast.error(error.message || 'Failed to parse questions')
    } finally {
      setParsing(false)
    }
  }

  const handleImport = async () => {
    if (parsedQuestions.length === 0) {
      toast.error('No questions to import')
      return
    }

    setImporting(true)
    try {
      const response = await fetch('/api/questions/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: parsedQuestions, course_type: courseType })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import questions')
      }

      toast.success(`Imported ${data.imported_count} questions!`)
      setParsedQuestions([])
      setRawText('')
      fetchQuestions()
    } catch (error: any) {
      console.error('Import error:', error)
      toast.error(error.message || 'Failed to import questions')
    } finally {
      setImporting(false)
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

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 p-8">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Question Bank</h1>
          </div>
          <p className="text-teal-50 text-lg">Manage your personalized interview questions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Total Questions</div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Mastered</div>
          <div className="text-3xl font-bold text-green-500">{stats.mastered}</div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Needs Focus</div>
          <div className="text-3xl font-bold text-yellow-500">{stats.needs_focus}</div>
        </div>
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-1">Never Asked</div>
          <div className="text-3xl font-bold text-slate-400">{stats.never_asked}</div>
        </div>
      </div>

      {/* Bulk Import Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-teal-400" />
          <h2 className="text-xl font-bold text-white">Import Questions</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Course Type</label>
            <select
              value={courseType}
              onChange={(e) => setCourseType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500"
            >
              <option value="BSc Nursing">BSc Nursing</option>
              <option value="Post Basic">Post Basic</option>
              <option value="GNM">GNM</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-slate-400">
                Paste Your Questions
              </label>
              <span className={`text-xs font-medium ${rawText.length > 20000 ? 'text-red-500' : 'text-slate-500'}`}>
                {rawText.length.toLocaleString()} / 20,000 characters
              </span>
            </div>
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className={`w-full h-64 px-4 py-3 bg-slate-900 border rounded-xl text-white focus:outline-none focus:border-teal-500 font-mono text-sm ${
                rawText.length > 20000 ? 'border-red-500 focus:border-red-500' : 'border-slate-700'
              }`}
              placeholder="Paste your questions here...

Example:
1. What is septic shock?
Answer: Severe infection causing hypotension and organ dysfunction...

2. Explain diabetes management
(AI will generate answer if not provided)"
            />
            {rawText.length > 20000 && (
              <p className="text-red-500 text-sm mt-1">
                Text exceeds limit by {(rawText.length - 20000).toLocaleString()} characters.
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleParse}
              disabled={parsing || !rawText.trim() || rawText.length > 20000}
              className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {parsing ? 'Parsing...' : 'Parse Questions'}
            </button>
            <button
              onClick={() => {
                setRawText('')
                setParsedQuestions([])
              }}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Parsed Questions Preview */}
      {parsedQuestions.length > 0 && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Parsed Questions ({parsedQuestions.length})</h3>
              <p className="text-sm text-slate-400 mt-1">
                {parsedQuestions.filter(q => q.has_provided_answer).length} with your answers • 
                {parsedQuestions.filter(q => !q.has_provided_answer).length} AI-generated
              </p>
            </div>
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import All (${parsedQuestions.length})`}
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {parsedQuestions.map((q, index) => (
              <div key={index} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <div className="flex items-start gap-3">
                  {q.has_provided_answer ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-white font-medium mb-2">{q.text}</p>
                    <p className="text-sm text-slate-400 mb-2">{q.answer}</p>
                    <div className="flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">{q.competency}</span>
                      <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">
                        {q.follow_up_count} follow-up{q.follow_up_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question List */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">Your Questions ({questions.length})</h3>

        {questions.length === 0 ? (
          <div className="text-center py-12">
            <Upload className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No questions yet. Import some to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <div className="flex items-start gap-3">
                  {q.mastery?.mastered ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : q.mastery?.last_performance === 'wrong' || q.mastery?.last_performance === 'moderate' ? (
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-white mb-2">{q.text}</p>
                    {q.mastery && (
                      <div className="flex gap-2 text-xs">
                        {q.mastery.mastered && (
                          <span className="px-2 py-1 bg-green-900 text-green-200 rounded">Mastered ✓</span>
                        )}
                        {q.mastery.last_performance && !q.mastery.mastered && (
                          <span className={`px-2 py-1 rounded ${
                            q.mastery.last_performance === 'perfect' ? 'bg-blue-900 text-blue-200' :
                            q.mastery.last_performance === 'moderate' ? 'bg-yellow-900 text-yellow-200' :
                            'bg-red-900 text-red-200'
                          }`}>
                            {q.mastery.last_score}/100
                          </span>
                        )}
                        <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">
                          Asked {q.mastery.times_asked} time{q.mastery.times_asked !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {!q.mastery && (
                      <span className="text-xs px-2 py-1 bg-slate-800 text-slate-400 rounded">Not attempted</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
