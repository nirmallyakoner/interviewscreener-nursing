import { NextRequest, NextResponse } from 'next/server'
import { Retell } from 'retell-sdk'
import { createClient } from '@/lib/supabase/server'
import { processInterviewCompletion } from '@/lib/creditTransactions'
import { calculateCreditsFromSeconds } from '@/lib/credits'

const retellClient = new Retell({
  apiKey: process.env.RETELL_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { call_id } = body

    if (!call_id) {
      return NextResponse.json({ error: 'Missing call_id' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get call details from Retell
    const callDetails = await retellClient.call.retrieve(call_id)

    // Calculate duration safely
    const duration = callDetails.end_timestamp && callDetails.start_timestamp
      ? Math.floor((callDetails.end_timestamp - callDetails.start_timestamp) / 1000)
      : null

    console.log('[EndCall] Call details retrieved:', {
      call_id,
      duration,
      start_timestamp: callDetails.start_timestamp,
      end_timestamp: callDetails.end_timestamp
    })

    // Get interview session to check credit status
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('id, status, credits_blocked, credits_deducted, credits_refunded, actual_duration_seconds')
      .eq('retell_call_id', call_id)
      .eq('user_id', user.id)
      .single()

    if (sessionError || !session) {
      console.error('[EndCall] Session not found:', sessionError)
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    console.log('[EndCall] Session status:', {
      session_id: session.id,
      status: session.status,
      credits_blocked: session.credits_blocked,
      credits_deducted: session.credits_deducted,
      credits_refunded: session.credits_refunded,
      actual_duration_seconds: session.actual_duration_seconds
    })

    // ============================================
    // VALIDATION CHECKS BEFORE CREDIT PROCESSING
    // ============================================

    let shouldProcessCredits = false
    let validationMessage = ''

    // Check 1: Is the call actually completed?
    if (session.status === 'completed' && session.credits_deducted !== null) {
      validationMessage = 'Credits already processed by webhook'
      console.log('[EndCall] ✓', validationMessage)
    } 
    // Check 2: Are credits already deducted?
    else if (session.credits_deducted !== null && session.credits_refunded !== null) {
      // Validate the existing calculation
      const expectedCredits = duration ? calculateCreditsFromSeconds(duration) : 0
      const actualDeducted = session.credits_deducted
      const actualRefunded = session.credits_refunded
      const totalBlocked = session.credits_blocked || 0

      console.log('[EndCall] Validating existing credit calculation:', {
        expected_credits: expectedCredits,
        actual_deducted: actualDeducted,
        actual_refunded: actualRefunded,
        total_blocked: totalBlocked,
        sum_check: actualDeducted + actualRefunded,
        should_equal: totalBlocked
      })

      // Check if the calculation is correct
      const calculationCorrect = Math.abs((actualDeducted + actualRefunded) - totalBlocked) < 0.01
      
      if (!calculationCorrect) {
        validationMessage = 'Credit calculation mismatch detected - needs recalculation'
        shouldProcessCredits = true
        console.warn('[EndCall] ⚠️', validationMessage)
      } else {
        validationMessage = 'Credits already processed and validated'
        console.log('[EndCall] ✓', validationMessage)
      }
    }
    // Check 3: Credits not processed at all (webhook didn't fire)
    else if (session.credits_deducted === null && session.credits_refunded === null) {
      if (duration && duration > 0) {
        validationMessage = 'Credits not processed - webhook likely failed, processing now'
        shouldProcessCredits = true
        console.log('[EndCall] ⚠️', validationMessage)
      } else {
        validationMessage = 'No duration available, cannot process credits'
        console.warn('[EndCall] ⚠️', validationMessage)
      }
    }

    // ============================================
    // PROCESS CREDITS IF NEEDED (FALLBACK)
    // ============================================

    if (shouldProcessCredits && duration && duration > 0) {
      console.log('[EndCall] 💳 Processing credits as fallback...')
      
      const creditResult = await processInterviewCompletion(
        supabase,
        call_id,
        duration
      )

      if (creditResult.success) {
        console.log('[EndCall] ✅ Credits processed successfully:', {
          credits_deducted: creditResult.credits_deducted,
          credits_refunded: creditResult.credits_refunded
        })
      } else {
        console.error('[EndCall] ❌ Credit processing failed:', creditResult.error)
      }
    }

    // Update session status
    const { error: updateError } = await supabase
      .from('interview_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        actual_duration_seconds: duration,
      })
      .eq('retell_call_id', call_id)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('[EndCall] Session update error:', updateError)
    }

    // Log call end
    console.log('[EndCall] Interview ended', {
      user_id: user.id,
      call_id,
      duration: duration || 0,
      credits_processed: shouldProcessCredits,
      validation: validationMessage
    })

    return NextResponse.json({
      success: true,
      call_duration: duration || 0,
      credits_processed: shouldProcessCredits,
      validation_message: validationMessage
    })
  } catch (error: any) {
    console.error('[EndCall] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Failed to end call' },
      { status: 500 }
    )
  }
}
