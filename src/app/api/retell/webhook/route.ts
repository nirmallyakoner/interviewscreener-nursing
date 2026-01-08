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
    console.log('=== RETELL WEBHOOK RECEIVED ===')
    console.log('Method:', request.method)
    console.log('URL:', request.url)
    console.log('Headers:', Object.fromEntries(request.headers.entries()))
    
    const body = await request.json()
    const signature = request.headers.get('x-retell-signature')

    console.log('Event:', body.event)
    console.log('Call ID:', body.call?.call_id)
    console.log('Timestamp:', new Date().toISOString())
    console.log('Full payload:', JSON.stringify(body, null, 2))

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
        }
        break

      case 'call_ended':
        console.log('🏁 Processing call_ended event...')
        // Update session with transcript and duration
        const duration = call.end_timestamp && call.start_timestamp
          ? Math.floor((call.end_timestamp - call.start_timestamp) / 1000)
          : null

        console.log('Call duration (seconds):', duration)
        console.log('Transcript length:', call.transcript?.length || 0)

        const endResult = await supabaseAdmin
          .from('interview_sessions')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString(),
            actual_duration_seconds: duration,
            transcript: call.transcript || null,
          })
          .eq('retell_call_id', call.call_id)
        
        if (endResult.error) {
          console.error('❌ DB Error (call_ended):', endResult.error)
        } else {
          console.log('✅ Successfully updated session with transcript and duration')
        }
        break

      case 'call_analyzed':
        console.log('📊 Processing call_analyzed event...')
        console.log('Analysis data:', JSON.stringify(call.analysis, null, 2))
        
        // Store AI analysis/feedback
        const analysisResult = await supabaseAdmin
          .from('interview_sessions')
          .update({
            analysis: call.analysis || null,
          })
          .eq('retell_call_id', call.call_id)
        
        if (analysisResult.error) {
          console.error('❌ DB Error (call_analyzed):', analysisResult.error)
        } else {
          console.log('✅ Successfully stored analysis data')
        }
        break

      default:
        console.log('⚠️ Unhandled webhook event:', event)
    }

    console.log('=== WEBHOOK PROCESSING COMPLETE ===\n')
    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('=== WEBHOOK ERROR ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Full error:', error)
    console.error('===================\n')
    
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error.message },
      { status: 500 }
    )
  }
}
