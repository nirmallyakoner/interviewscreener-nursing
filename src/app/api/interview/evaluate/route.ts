import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'
import { z } from 'zod'

/**
 * Answer Evaluation API
 * Evaluates user answers from interview transcript
 * Compares with correct answers and updates mastery tracking
 */

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

// Zod Schemas for Robust Validation
const EvaluationItemSchema = z.object({
  question_number: z.number().optional(),
  user_answer: z.string().optional().default("No answer provided"),
  score: z.number().or(z.string().transform(Number)).pipe(z.number().min(0).max(100)).default(0),
  performance: z.string().transform(val => {
    const v = val.toLowerCase()
    return ['perfect', 'moderate', 'wrong'].includes(v) ? v as 'perfect' | 'moderate' | 'wrong' : 'wrong'
  }).default('wrong'),
  feedback: z.string().default("No feedback available"),
  missing_points: z.array(z.string()).optional().default([]),
  incorrect_points: z.array(z.string()).optional().default([])
})

const EvaluationResponseSchema = z.object({
  evaluations: z.array(EvaluationItemSchema).default([])
})

type EvaluationItem = z.infer<typeof EvaluationItemSchema>

// Helper: Retry Logic with Exponential Backoff
async function evaluateWithRetry(prompt: string, maxRetries = 3): Promise<EvaluationItem[]> {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
            { role: "system", content: "You are a nursing education expert. Return valid JSON only." },
            { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      })

      const content = completion.choices[0]?.message?.content || ''
      if (!content) throw new Error('Empty response from Groq')

      // Robust JSON extraction (find first { and last })
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : content

      const parsed = JSON.parse(jsonString)
      
      // Validation with Zod
      const result = EvaluationResponseSchema.safeParse(parsed)
      
      if (!result.success) {
        console.warn(`[Evaluation] Schema validation failed (Attempt ${attempt}):`, result.error)
        throw new Error(`Schema validation failed`)
      }

      return result.data.evaluations

    } catch (error) {
      console.warn(`[Evaluation] Attempt ${attempt} failed:`, error)
      lastError = error
      if (attempt < maxRetries) {
        // Backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)))
      }
    }
  }
  
  throw lastError
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { session_id, transcript } = await request.json()

    // Validation
    if (!session_id || !transcript) {
      return NextResponse.json(
        { error: 'Missing required fields: session_id and transcript' },
        { status: 400 }
      )
    }

    console.log('[Evaluation] Starting evaluation for session:', session_id)

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('user_id, duration_minutes')
      .eq('id', session_id)
      .single()

    if (sessionError || !session) {
      console.error('[Evaluation] Session not found:', sessionError)
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Get questions that were asked in this session
    const { data: sessionQuestions, error: questionsError } = await supabase
      .from('interview_session_questions')
      .select(`
        question_id,
        question:interview_questions(
          id,
          text,
          answer
        )
      `)
      .eq('session_id', session_id)

    if (questionsError || !sessionQuestions || sessionQuestions.length === 0) {
      console.error('[Evaluation] No questions found for session:', questionsError)
      return NextResponse.json(
        { error: 'No questions found for this session' },
        { status: 404 }
      )
    }

    // Extract questions with answers
    const questions = sessionQuestions.map((sq: any) => ({
      id: sq.question.id,
      text: sq.question.text,
      correct_answer: sq.question.answer
    }))

    console.log('[Evaluation] Evaluating', questions.length, 'questions')

    // Use Groq with robust retry logic
    const evaluationPrompt = `You are a nursing education expert evaluating interview answers.

TRANSCRIPT:
${transcript}

QUESTIONS AND CORRECT ANSWERS:
${questions.map((q, i) => `
Q${i + 1}: ${q.text}
Correct Answer: ${q.correct_answer}
`).join('\n')}

TASK:
For each question, extract the user's answer from the transcript and evaluate it against the correct answer.

SCORING CRITERIA:
- Perfect (90-100): All key points covered, accurate, comprehensive
- Moderate (60-89): Some key points covered, mostly accurate, missing details
- Wrong (0-59): Major gaps, inaccurate, or no answer given

OUTPUT FORMAT (JSON):
{
  "evaluations": [
    {
      "question_number": 1,
      "user_answer": "extracted answer from transcript",
      "score": 85,
      "performance": "moderate",
      "feedback": "Brief constructive feedback",
      "missing_points": ["point 1"],
      "incorrect_points": ["error 1"]
    }
  ]
}

IMPORTANT:
- If user said "I don't know" or gave no answer, score = 0, performance = "wrong"
- Return ONLY valid JSON`

    // Call Groq with retries and Zod validation
    const evaluations = await evaluateWithRetry(evaluationPrompt)

    console.log('[Evaluation] Groq evaluation received and validated')

    if (evaluations.length === 0) {
      console.error('[Evaluation] No evaluations returned')
      return NextResponse.json(
        { error: 'No evaluations generated' },
        { status: 500 }
      )
    }

    // Process each evaluation
    const results: any[] = []
    let perfectCount = 0
    let moderateCount = 0
    let wrongCount = 0

    // Process evaluations using validated data
    for (let i = 0; i < evaluations.length; i++) {
        if (i >= questions.length) break;
        
        const currentEvaluationItem = evaluations[i]
        const currentQuestionItem = questions[i]
  
        // Data is already validated and normalized by Zod
        const questionEval = {
          question_id: currentQuestionItem.id,
          question_text: currentQuestionItem.text,
          correct_answer: currentQuestionItem.correct_answer,
          user_answer: currentEvaluationItem.user_answer,
          performance: currentEvaluationItem.performance,
          score: currentEvaluationItem.score,
          feedback: currentEvaluationItem.feedback,
          missing_points: currentEvaluationItem.missing_points,
          incorrect_points: currentEvaluationItem.incorrect_points
        }
  
        results.push(questionEval)
  
        // Count performance (Zod guarantees lowercase enum)
        if (questionEval.performance === 'perfect') perfectCount++
        else if (questionEval.performance === 'moderate') moderateCount++
        else wrongCount++



      // Store analysis in database
      const { error: insertError } = await supabase
        .from('interview_answer_analysis')
        .insert({
          session_id,
          question_id: currentQuestionItem.id,
          user_answer: questionEval.user_answer,
          correct_answer: currentQuestionItem.correct_answer,
          performance_category: questionEval.performance,
          score: questionEval.score,
          feedback: questionEval.feedback,
          missing_points: questionEval.missing_points,
          incorrect_points: questionEval.incorrect_points
        })

      if (insertError) {
        console.error('[Evaluation] Failed to save analysis:', insertError)
      } else {
        console.log('[Evaluation] Saved analysis for question:', currentQuestionItem.id)
      }

      // Update mastery tracking using helper function
      const { error: rpcError } = await supabase.rpc('update_question_mastery', {
        p_user_id: session.user_id,
        p_question_id: currentQuestionItem.id,
        p_performance: questionEval.performance,
        p_score: questionEval.score,
        p_user_answer: questionEval.user_answer
      })

      if (rpcError) {
        console.error('[Evaluation] Failed to update mastery:', rpcError)
      }
    }

    const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length

    console.log('[Evaluation] Evaluation complete:', {
      total: results.length,
      perfect: perfectCount,
      moderate: moderateCount,
      wrong: wrongCount,
      average_score: averageScore.toFixed(1)
    })

    return NextResponse.json({
      success: true,
      session_id,
      overall: {
        perfect: perfectCount,
        moderate: moderateCount,
        wrong: wrongCount,
        average_score: parseFloat(averageScore.toFixed(1))
      },
      results
    })

  } catch (error: any) {
    console.error('[Evaluation] Error:', error)
    
    // Handle Groq API errors
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Evaluation will retry shortly.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to evaluate answers' },
      { status: 500 }
    )
  }
}
