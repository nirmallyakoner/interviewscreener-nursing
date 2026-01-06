import { NextRequest, NextResponse } from 'next/server'
import { Retell } from 'retell-sdk'
import { createClient } from '@/lib/supabase/server'

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

    // Update session in database
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
      console.error('Session update error:', updateError)
    }

    // Log call end
    console.log('Interview ended', {
      user_id: user.id,
      call_id,
      duration: duration || 0
    })

    return NextResponse.json({
      success: true,
      call_duration: duration || 0,
    })
  } catch (error: any) {
    console.error('End call error:', error)
    return NextResponse.json(
      { error: 'Failed to end call' },
      { status: 500 }
    )
  }
}
