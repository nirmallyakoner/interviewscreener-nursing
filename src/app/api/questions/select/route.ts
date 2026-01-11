import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Smart Question Selection API
 * Selects questions based on mastery tracking
 * Prioritizes: wrong → moderate → never asked → least recently asked
 * Excludes mastered questions (2+ perfect answers)
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { course_type, duration_minutes } = await request.json()

    // Validate inputs
    if (!course_type || !duration_minutes) {
      return NextResponse.json(
        { error: 'Missing required fields: course_type and duration_minutes' },
        { status: 400 }
      )
    }

    // Determine question count based on duration
    // 5 mins = 3 questions
    // 8 mins = 7 questions (User feedback: 5 questions finished in ~6 mins)
    const questionCount = duration_minutes === 5 ? 3 : 7

    console.log('[QuestionSelect] Selecting questions:', {
      user_id: user.id,
      course_type,
      duration_minutes,
      total_needed: questionCount
    })

    // Fetch user's questions with mastery data
    const { data: userQuestions, error: questionsError } = await supabase
      .from('interview_questions')
      .select(`
        id,
        text,
        answer,
        follow_up_count,
        competency,
        mastery:user_question_mastery!left(
          mastered,
          last_performance,
          times_asked,
          last_asked_at
        )
      `)
      .eq('created_by', user.id)
      .contains('course_types', [course_type])
      .eq('is_active', true)

    if (questionsError) {
      console.error('[QuestionSelect] Error fetching questions:', questionsError)
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      )
    }

    // Handle edge case: No questions in bank
    if (!userQuestions || userQuestions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'no_questions',
        message: 'No questions in your bank. Please add questions first.',
        action: 'add_questions'
      }, { status: 200 })
    }

    // Filter out mastered questions
    const unmastered = userQuestions.filter((q: any) => {
      const mastery = Array.isArray(q.mastery) ? q.mastery[0] : q.mastery
      return !mastery?.mastered
    })

    // Handle edge case: All questions mastered
    if (unmastered.length === 0) {
      return NextResponse.json({
        success: true,
        all_mastered: true,
        message: '🎉 You\'ve mastered all questions!',
        mastered_count: userQuestions.length,
        options: {
          review_mode: true,
          add_more: true,
          use_default: false
        }
      })
    }

    // Categorize questions by performance
    const wrong = unmastered.filter((q: any) => {
      const mastery = Array.isArray(q.mastery) ? q.mastery[0] : q.mastery
      return mastery?.last_performance === 'wrong'
    })

    const moderate = unmastered.filter((q: any) => {
      const mastery = Array.isArray(q.mastery) ? q.mastery[0] : q.mastery
      return mastery?.last_performance === 'moderate'
    })

    const neverAsked = unmastered.filter((q: any) => {
      const mastery = Array.isArray(q.mastery) ? q.mastery[0] : q.mastery
      return !mastery || mastery.times_asked === 0
    })

    const perfectNotMastered = unmastered.filter((q: any) => {
      const mastery = Array.isArray(q.mastery) ? q.mastery[0] : q.mastery
      return mastery?.last_performance === 'perfect' && !mastery?.mastered
    })

    // Shuffle helper
    const shuffle = (array: any[]) => {
      return array.sort(() => Math.random() - 0.5)
    }

    // Prioritize: wrong → moderate → never asked → perfect not mastered
    const prioritized = [
      ...shuffle(wrong),
      ...shuffle(moderate),
      ...shuffle(neverAsked),
      ...shuffle(perfectNotMastered)
    ]

    // Select top N questions
    const selected = prioritized.slice(0, questionCount)

    // Format for Retell prompt
    const formattedQuestions = selected.map((q, index) => ({
      id: q.id,
      number: index + 1,
      text: q.text,
      follow_up_count: q.follow_up_count || 1,
      competency: q.competency || 'clinical'
    }))

    console.log('[QuestionSelect] Questions selected:', {
      total: formattedQuestions.length,
      wrong: wrong.length,
      moderate: moderate.length,
      never_asked: neverAsked.length,
      perfect_not_mastered: perfectNotMastered.length,
      mastered: userQuestions.length - unmastered.length
    })

    return NextResponse.json({
      success: true,
      questions: formattedQuestions,
      count: formattedQuestions.length,
      metadata: {
        total_in_bank: userQuestions.length,
        mastered: userQuestions.length - unmastered.length,
        remaining: unmastered.length,
        course_type,
        duration_minutes
      }
    })

  } catch (error: any) {
    console.error('[QuestionSelect] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
