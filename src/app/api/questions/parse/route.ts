import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'
import { z } from 'zod'

/**
 * Question Parser API
 * Uses Groq to parse bulk text into structured questions
 * Generates answers for questions without them
 */

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

// Validation Schema
const QuestionSchema = z.object({
  text: z.string().min(5),
  answer: z.string().min(5),
  has_provided_answer: z.boolean().default(false),
  competency: z.enum(['clinical', 'communication', 'ethics', 'emergency', 'patient_care']).default('clinical'),
  follow_up_count: z.number().min(0).max(2).default(1)
})

const ParserResponseSchema = z.object({
  questions: z.array(QuestionSchema).default([])
})

type ParsedQuestion = z.infer<typeof QuestionSchema>

// Helper: Retry Logic
async function parseWithRetry(rawText: string, courseType: string, maxRetries = 3): Promise<ParsedQuestion[]> {
  let lastError: any

  const systemPrompt = `You are a nursing education expert. Extract questions and answers from the provided text.

RULES:
1. Identify all questions in the text
2. If an answer is provided after a question, extract it exactly
3. If no answer is provided, generate a comprehensive, accurate nursing answer
4. Detect the competency area: clinical, communication, ethics, emergency, patient_care
5. Suggest follow_up_count (0, 1, or 2) based on question complexity
6. Return ONLY valid JSON, no markdown formatting

OUTPUT FORMAT:
{
  "questions": [
    {
      "text": "Question text here",
      "answer": "Answer text here (user-provided or AI-generated)",
      "has_provided_answer": true,
      "competency": "clinical",
      "follow_up_count": 1
    }
  ]
}

IMPORTANT: 
- Generate detailed, accurate nursing answers for questions without answers
- Answers should be 2-4 sentences, covering key points
- Focus on ${courseType} level knowledge`

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: rawText }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        response_format: { type: "json_object" }
      })

      const content = completion.choices[0]?.message?.content || ''
      if (!content) throw new Error('Empty response from Groq')

      // Robust JSON extraction
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : content
      const parsed = JSON.parse(jsonString)
      
      const result = ParserResponseSchema.safeParse(parsed)
      
      if (!result.success) {
        console.warn(`[Parser] Schema validation failed (Attempt ${attempt}):`, result.error)
        throw new Error('Schema validation failed')
      }

      return result.data.questions

    } catch (error) {
      console.warn(`[Parser] Attempt ${attempt} failed:`, error)
      lastError = error
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)))
      }
    }
  }
  
  throw lastError
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { raw_text, course_type } = await request.json()

    // Validation
    if (!raw_text || !course_type) {
      return NextResponse.json(
        { error: 'Missing required fields: raw_text and course_type' },
        { status: 400 }
      )
    }

    if (raw_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text cannot be empty' },
        { status: 400 }
      )
    }

    // Limit input length to prevent context overflow (approx 5000 tokens)
    const MAX_CHARS = 20000
    if (raw_text.length > MAX_CHARS) {
      return NextResponse.json(
        { error: `Text is too long. Please limit to ${MAX_CHARS} characters (currently ${raw_text.length}).` },
        { status: 400 }
      )
    }

    console.log('[QuestionParser] Parsing text for course:', course_type)
    console.log('[QuestionParser] Text length:', raw_text.length)

    // Parse with robust retry logic
    const questions = await parseWithRetry(raw_text, course_type)

    if (questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions found in the text. Please check the format and try again.' },
        { status: 400 }
      )
    }

    // Limit to 100 questions
    const limitedQuestions = questions.slice(0, 100)

    console.log('[QuestionParser] Parsed questions:', {
      total: limitedQuestions.length,
      user_provided: limitedQuestions.filter(q => q.has_provided_answer).length,
      ai_generated: limitedQuestions.filter(q => !q.has_provided_answer).length
    })

    return NextResponse.json({
      success: true,
      questions: limitedQuestions,
      stats: {
        total: limitedQuestions.length,
        user_provided_answers: limitedQuestions.filter(q => q.has_provided_answer).length,
        ai_generated_answers: limitedQuestions.filter(q => !q.has_provided_answer).length,
        skipped: questions.length - limitedQuestions.length
      }
    })

  } catch (error: any) {
    console.error('[QuestionParser] Error:', error)
    
    if (error.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to parse questions. Please check your text provided.' },
      { status: 500 }
    )
  }
}
