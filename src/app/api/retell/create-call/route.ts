import { NextRequest, NextResponse } from 'next/server'
import { Retell } from 'retell-sdk'
import { createClient } from '@/lib/supabase/server'
import { 
  calculateCreditsForDuration, 
  calculateAvailableCredits,
  validateCreditsForDuration 
} from '@/lib/credits'
import { blockCredits, refundBlockedCredits } from '@/lib/creditTransactions'

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Read custom duration from request body (optional)
    let customDuration: number | null = null
    try {
      const body = await request.json()
      if (body.duration && typeof body.duration === 'number') {
        customDuration = body.duration
      }
    } catch {
      // No body or invalid JSON, use profile duration
    }

    // Get user profile to check credits and duration
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits, blocked_credits, interview_duration, subscription_type, course_type')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('[CreateCall] Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch your account details' },
        { status: 500 }
      )
    }

    // Use custom duration if provided, otherwise use profile duration
    const interviewDuration = customDuration || profile.interview_duration

    // Calculate available credits
    const availableCredits = calculateAvailableCredits(
      profile.credits || 0,
      profile.blocked_credits || 0
    )

    // Validate credits for requested duration
    const validation = validateCreditsForDuration(
      availableCredits,
      interviewDuration
    )

    if (!validation.valid) {
      console.log('[CreateCall] Insufficient credits:', {
        user_id: user.id,
        available: availableCredits,
        needed: validation.creditsNeeded,
        suggested: validation.suggestedDurations
      })

      return NextResponse.json(
        { 
          error: 'Insufficient credits for this interview duration',
          available_credits: availableCredits,
          credits_needed: validation.creditsNeeded,
          suggested_durations: validation.suggestedDurations,
          max_duration: validation.maxDuration,
          message: validation.suggestedDurations && validation.suggestedDurations.length > 0
            ? `You have ${availableCredits} credits. Try a ${validation.suggestedDurations[0]}-minute interview instead.`
            : 'Please purchase more credits to continue.'
        },
        { status: 403 }
      )
    }

    // Create interview session first (to get session ID)
    // Don't include retell_call_id yet as we haven't created the call
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        agent_id: process.env.RETELL_AGENT_ID!,
        duration_minutes: interviewDuration,
        status: 'started',
        // retell_call_id will be added after call creation
      })
      .select('id')
      .single()

    if (sessionError || !session) {
      console.error('[CreateCall] Session creation error:', sessionError)
      return NextResponse.json(
        { error: 'Failed to create interview session' },
        { status: 500 }
      )
    }

    // Block credits for this interview
    const creditsToBlock = calculateCreditsForDuration(interviewDuration)
    const blockResult = await blockCredits(
      supabase,
      user.id,
      creditsToBlock,
      session.id
    )

    if (!blockResult.success) {
      console.error('[CreateCall] Credit blocking failed:', blockResult)
      
      // Clean up session
      await supabase
        .from('interview_sessions')
        .delete()
        .eq('id', session.id)

      return NextResponse.json(
        { 
          error: blockResult.error || 'Failed to reserve credits',
          available_credits: blockResult.available,
          credits_needed: blockResult.needed
        },
        { status: 500 }
      )
    }

    // Create Retell web call
    let webCallResponse
    try {
      webCallResponse = await retellClient.call.createWebCall({
        agent_id: process.env.RETELL_AGENT_ID!,
        metadata: {
          user_id: user.id,
          subscription_type: profile.subscription_type,
          session_id: session.id,
        },
        // Dynamic variables for template substitution in agent prompt
        retell_llm_dynamic_variables: {
          course_type: profile.course_type,
          duration_minutes: interviewDuration.toString(),
        },
      })
    } catch (callError: any) {
      console.error('[CreateCall] Retell call creation failed:', callError)
      
      // Refund blocked credits
      await refundBlockedCredits(supabase, user.id, creditsToBlock, session.id)
      
      // Clean up session
      await supabase
        .from('interview_sessions')
        .update({ status: 'failed' })
        .eq('id', session.id)

      return NextResponse.json(
        { error: 'Failed to create interview session. Your credits have been restored.' },
        { status: 500 }
      )
    }

    // Update session with call ID
    await supabase
      .from('interview_sessions')
      .update({
        retell_call_id: webCallResponse.call_id,
      })
      .eq('id', session.id)

    // Log interview start
    console.log('[CreateCall] Interview started successfully:', {
      user_id: user.id,
      call_id: webCallResponse.call_id,
      session_id: session.id,
      duration: interviewDuration,
      credits_blocked: creditsToBlock,
      available_credits: blockResult.new_balance
    })

    return NextResponse.json({
      access_token: webCallResponse.access_token,
      call_id: webCallResponse.call_id,
      agent_id: webCallResponse.agent_id,
      session_id: session.id,
      duration_minutes: interviewDuration,
      credits_blocked: creditsToBlock,
      available_credits: blockResult.new_balance,
    })
  } catch (error: any) {
    console.error('[CreateCall] Unexpected error:', error)
    
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
