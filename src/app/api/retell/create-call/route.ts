import { NextRequest, NextResponse } from 'next/server'
import { Retell } from 'retell-sdk'
import { createClient } from '@/lib/supabase/server'

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

    // Get user profile to check credits and duration
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('interviews_remaining, interview_duration, subscription_type')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch your account details' },
        { status: 500 }
      )
    }

    // Check if user has remaining interviews
    if (!profile.interviews_remaining || profile.interviews_remaining <= 0) {
      return NextResponse.json(
        { 
          error: 'No interviews remaining. Please upgrade your subscription.',
          interviews_remaining: 0 
        },
        { status: 403 }
      )
    }

    // Deduct one interview BEFORE creating call
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        interviews_remaining: profile.interviews_remaining - 1,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Interview count update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to start interview. Please try again.' },
        { status: 500 }
      )
    }

    // Create Retell web call
    const webCallResponse = await retellClient.call.createWebCall({
      agent_id: process.env.RETELL_AGENT_ID!,
      metadata: {
        user_id: user.id,
        duration_minutes: profile.interview_duration.toString(),
        subscription_type: profile.subscription_type,
      },
    })

    // Store interview session in database
    const { error: sessionError } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user.id,
        retell_call_id: webCallResponse.call_id,
        agent_id: process.env.RETELL_AGENT_ID!,
        duration_minutes: profile.interview_duration,
        status: 'started',
      })

    if (sessionError) {
      console.error('Session creation error:', sessionError)
      // Don't fail the call, just log the error
    }

    // Log interview start
    console.log('Interview started', {
      user_id: user.id,
      call_id: webCallResponse.call_id,
      duration: profile.interview_duration,
      interviews_remaining: profile.interviews_remaining - 1
    })

    return NextResponse.json({
      access_token: webCallResponse.access_token,
      call_id: webCallResponse.call_id,
      agent_id: webCallResponse.agent_id,
      duration_minutes: profile.interview_duration,
      interviews_remaining: profile.interviews_remaining - 1,
    })
  } catch (error: any) {
    console.error('Create call error:', error)
    
    // Try to restore credit if call creation failed
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('interviews_remaining')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          await supabase
            .from('profiles')
            .update({ interviews_remaining: profile.interviews_remaining + 1 })
            .eq('id', user.id)
          
          console.log('Credit restored after failed call creation')
        }
      }
    } catch (restoreError) {
      console.error('Failed to restore credit:', restoreError)
    }
    
    return NextResponse.json(
      { error: 'Failed to create interview session. Your credit has been restored.' },
      { status: 500 }
    )
  }
}
