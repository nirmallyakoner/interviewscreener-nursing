import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Bulk Import API
 * Saves parsed questions to the database
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { questions, course_type } = await request.json()

    // Validation
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: 'No questions provided' },
        { status: 400 }
      )
    }

    if (!course_type) {
      return NextResponse.json(
        { error: 'Course type is required' },
        { status: 400 }
      )
    }

    console.log('[BulkImport] Importing', questions.length, 'questions for', course_type)

    // Prepare questions for insertion
    const questionsToInsert = questions.map((q: any) => ({
      text: q.text.trim(),
      answer: q.answer.trim(),
      course_types: [course_type], // Array of course types
      competency: q.competency || 'clinical',
      follow_up_count: q.follow_up_count || 1,
      is_default: false,
      created_by: user.id,
      is_active: true
    }))

    // Insert questions
    const { data: insertedQuestions, error: insertError } = await supabase
      .from('interview_questions')
      .insert(questionsToInsert)
      .select('id')

    if (insertError) {
      console.error('[BulkImport] Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to save questions to database' },
        { status: 500 }
      )
    }

    console.log('[BulkImport] Successfully imported', insertedQuestions?.length, 'questions')

    return NextResponse.json({
      success: true,
      imported_count: insertedQuestions?.length || 0,
      message: `Successfully imported ${insertedQuestions?.length} questions`
    })

  } catch (error: any) {
    console.error('[BulkImport] Error:', error)
    return NextResponse.json(
      { error: 'Failed to import questions' },
      { status: 500 }
    )
  }
}
