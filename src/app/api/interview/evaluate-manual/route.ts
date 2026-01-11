import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Manual Evaluation Trigger
 * Manually trigger evaluation for a completed interview
 * Use this to evaluate interviews that weren't auto-evaluated
 */

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { session_id } = await request.json()

    if (!session_id) {
      return NextResponse.json(
        { error: 'Missing session_id' },
        { status: 400 }
      )
    }

    console.log('[ManualEvaluation] Triggering evaluation for session:', session_id)

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('id, transcript, user_id')
      .eq('id', session_id)
      .eq('user_id', user.id) // Ensure user owns this session
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found or unauthorized' },
        { status: 404 }
      )
    }

    if (!session.transcript) {
      return NextResponse.json(
        { error: 'No transcript available for this session' },
        { status: 400 }
      )
    }

    // Call evaluation API
    const evaluationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/interview/evaluate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify({
        session_id: session.id,
        transcript: session.transcript
      })
    })

    if (!evaluationResponse.ok) {
      const errorData = await evaluationResponse.json()
      throw new Error(errorData.error || 'Evaluation failed')
    }

    const evalData = await evaluationResponse.json()

    console.log('[ManualEvaluation] Evaluation completed:', {
      perfect: evalData.overall?.perfect,
      moderate: evalData.overall?.moderate,
      wrong: evalData.overall?.wrong,
      average_score: evalData.overall?.average_score
    })

    return NextResponse.json({
      success: true,
      message: 'Evaluation completed successfully',
      results: evalData
    })

  } catch (error: any) {
    console.error('[ManualEvaluation] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to trigger evaluation' },
      { status: 500 }
    )
  }
}
