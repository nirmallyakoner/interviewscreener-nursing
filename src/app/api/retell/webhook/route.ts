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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = request.headers.get('x-retell-signature')

    // Verify webhook signature (if you have webhook secret)
    // const isValid = verifyWebhookSignature(body, signature)
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    const { event, call } = body

    console.log('Retell webhook received:', event, call?.call_id)

    switch (event) {
      case 'call_started':
        // Update session status
        await supabaseAdmin
          .from('interview_sessions')
          .update({
            status: 'started',
            started_at: new Date().toISOString(),
          })
          .eq('retell_call_id', call.call_id)
        break

      case 'call_ended':
        // Update session with transcript and duration
        const duration = call.end_timestamp && call.start_timestamp
          ? Math.floor((call.end_timestamp - call.start_timestamp) / 1000)
          : null

        await supabaseAdmin
          .from('interview_sessions')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString(),
            actual_duration_seconds: duration,
            transcript: call.transcript || null,
          })
          .eq('retell_call_id', call.call_id)
        break

      case 'call_analyzed':
        // Store AI analysis/feedback
        await supabaseAdmin
          .from('interview_sessions')
          .update({
            analysis: call.analysis || null,
          })
          .eq('retell_call_id', call.call_id)
        break

      default:
        console.log('Unhandled webhook event:', event)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
