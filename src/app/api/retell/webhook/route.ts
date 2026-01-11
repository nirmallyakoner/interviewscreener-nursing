import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// Use service role client for webhook (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Add GET handler for debugging
export async function GET(request: NextRequest) {
  console.log('GET request received at webhook endpoint')
  return NextResponse.json({ 
    status: 'Webhook endpoint is active',
    message: 'Use POST method to send webhook data',
    url: request.url
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🔔 RETELL WEBHOOK RECEIVED')
    console.log('Method:', request.method)
    console.log('URL:', request.url)
    console.log('Timestamp:', new Date().toISOString())
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    
    const body = await request.json()
    const signature = request.headers.get('x-retell-signature')

    console.log('📦 Payload Details:')
    console.log('  Event:', body.event)
    console.log('  Call ID:', body.call?.call_id)
    console.log('  Full payload:', JSON.stringify(body, null, 2))

    // Verify webhook signature (if you have webhook secret)
    // const isValid = verifyWebhookSignature(body, signature)
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const { event, call } = body

    if (!call?.call_id) {
      console.error('❌ ERROR: Missing call_id in webhook payload')
      return NextResponse.json({ error: 'Missing call_id' }, { status: 400 })
    }

    console.log(`\n🔄 Processing event: ${event}`)

    switch (event) {
      case 'call_started':
        console.log('📞 Processing call_started event...')
        const startResult = await supabaseAdmin
          .from('interview_sessions')
          .update({
            status: 'started',
            started_at: new Date().toISOString(),
          })
          .eq('retell_call_id', call.call_id)
        
        if (startResult.error) {
          console.error('❌ DB Error (call_started):', startResult.error)
        } else {
          console.log('✅ Successfully updated session to started')
          console.log('   Updated rows:', startResult.count || 'unknown')
        }
        break

      case 'call_ended':
        console.log('🏁 Processing call_ended event...')
        
        // Update session with transcript and duration
        const duration = call.end_timestamp && call.start_timestamp
          ? Math.floor((call.end_timestamp - call.start_timestamp) / 1000)
          : null

        // Extract transcript - Retell sends it as a string
        const transcript = call.transcript || call.transcript_text || null
        
        console.log('📊 Call details:')
        console.log('   Duration (seconds):', duration)
        console.log('   Transcript type:', typeof call.transcript)
        console.log('   Transcript length:', transcript?.length || 0)
        console.log('   Has transcript:', !!transcript)
        console.log('   Transcript preview:', transcript ? transcript.substring(0, 200) + '...' : 'null')

        const updateData = {
          status: 'completed',
          ended_at: new Date().toISOString(),
          actual_duration_seconds: duration,
          transcript: transcript,
          recording_url: call.recording_url || null,
        }
        
        console.log('📝 Updating database with:', {
          ...updateData,
          transcript: transcript ? `${transcript.length} chars` : 'null',
          recording_url: call.recording_url ? 'present' : 'null'
        })

        const endResult = await supabaseAdmin
          .from('interview_sessions')
          .update(updateData)
          .eq('retell_call_id', call.call_id)
          .select()
        
        if (endResult.error) {
          console.error('❌ DB Error (call_ended):', endResult.error)
          console.error('   Error code:', endResult.error.code)
          console.error('   Error message:', endResult.error.message)
          console.error('   Error details:', endResult.error.details)
        } else {
          console.log('✅ Successfully updated session with transcript and duration')
          console.log('   Updated rows:', endResult.count || 'unknown')
          console.log('   Updated data:', JSON.stringify(endResult.data, null, 2))
          console.log('   Session marked as completed')
        }

        // Process credit deduction
        if (duration !== null && duration > 0) {
          console.log('💳 Processing credit deduction...')
          
          // Import credit functions dynamically to avoid circular dependencies
          const { processInterviewCompletion } = await import('@/lib/creditTransactions')
          
          const creditResult = await processInterviewCompletion(
            supabaseAdmin,
            call.call_id,
            duration
          )

          if (creditResult.success) {
            console.log('✅ Credits processed successfully:')
            console.log('   Credits deducted:', creditResult.credits_deducted)
            console.log('   Credits refunded:', creditResult.credits_refunded)
          } else {
            console.error('❌ Credit processing failed:', creditResult.error)
          }
        } else {
          console.log('⚠️ Skipping credit deduction (no duration or zero duration)')
        }

        // Trigger answer evaluation if transcript exists
        if (transcript && endResult.data && endResult.data.length > 0) {
          console.log('🎯 Triggering answer evaluation...')
          const sessionId = endResult.data[0].id
          
          try {
            const evaluationResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/interview/evaluate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                session_id: sessionId,
                transcript: transcript
              })
            })

            if (evaluationResponse.ok) {
              const evalData = await evaluationResponse.json()
              console.log('✅ Answer evaluation completed:', {
                perfect: evalData.overall?.perfect,
                moderate: evalData.overall?.moderate,
                wrong: evalData.overall?.wrong,
                average_score: evalData.overall?.average_score
              })
            } else {
              const errorData = await evaluationResponse.json()
              console.error('❌ Evaluation failed:', errorData.error)
            }
          } catch (evalError: any) {
            console.error('❌ Evaluation error:', evalError.message)
          }
        } else {
          console.log('⚠️ Skipping evaluation (no transcript or session not found)')
        }
        break

      case 'call_analyzed':
        console.log('📊 Processing call_analyzed event...')
        console.log('📋 Full call object keys:', Object.keys(call))
        
        // Log ALL top-level fields to find where the analysis data is
        console.log('🔍 Inspecting call object structure:')
        for (const key of Object.keys(call)) {
          const value = (call as any)[key]
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            console.log(`   ${key}: {object with keys: ${Object.keys(value).join(', ')}}`)
          } else if (Array.isArray(value)) {
            console.log(`   ${key}: [array with ${value.length} items]`)
          } else {
            console.log(`   ${key}: ${typeof value}`)
          }
        }
        
        // Check for call_analysis field specifically
        const callAnalysis = (call as any).call_analysis
        console.log('🎯 call_analysis field exists:', !!callAnalysis)
        if (callAnalysis) {
          console.log('🎯 call_analysis content:', JSON.stringify(callAnalysis, null, 2))
        }
        
        // Retell's post-call data extraction fields
        const callSummary = (call as any).call_summary || callAnalysis?.call_summary || null
        const callSuccessful = (call as any).call_successful || callAnalysis?.call_successful || null
        const customExtractions = (call as any).custom_analysis_data || callAnalysis || {}
        
        // Build structured analysis object
        const analysisData = {
          summary: callSummary,
          successful: callSuccessful,
          ...customExtractions,
          // Include any other analysis fields from call.analysis if it exists
          ...(call.analysis || {}),
        }
        
        console.log('📋 Analysis data received:')
        console.log('   Call Summary:', callSummary)
        console.log('   Call Successful:', callSuccessful)
        console.log('   Has call.analysis:', !!call.analysis)
        console.log('   Analysis type:', typeof call.analysis)
        console.log('   Full analysis object:', JSON.stringify(analysisData, null, 2))
        
        // Store AI analysis/feedback
        const analysisResult = await supabaseAdmin
          .from('interview_sessions')
          .update({
            analysis: analysisData,
          })
          .eq('retell_call_id', call.call_id)
          .select()
        
        if (analysisResult.error) {
          console.error('❌ DB Error (call_analyzed):', analysisResult.error)
          console.error('   Error code:', analysisResult.error.code)
          console.error('   Error message:', analysisResult.error.message)
          console.error('   Error details:', JSON.stringify(analysisResult.error, null, 2))
        } else {
          console.log('✅ Successfully stored analysis data')
          console.log('   Updated rows:', analysisResult.count || 'unknown')
          console.log('   Updated data:', JSON.stringify(analysisResult.data, null, 2))
        }
        break

      default:
        console.log('⚠️ Unhandled webhook event:', event)
    }

    console.log('✅ WEBHOOK PROCESSING COMPLETE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.error('💥 WEBHOOK ERROR')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Full error:', error)
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}
