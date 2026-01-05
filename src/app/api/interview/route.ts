import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Please log in to start an interview' },
        { status: 401 }
      )
    }

    // Fetch user profile to check credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('interviews_remaining, interview_duration, subscription_type')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch your account details. Please try again.' },
        { status: 500 }
      )
    }

    // Check if user has remaining interviews
    if (!profile.interviews_remaining || profile.interviews_remaining <= 0) {
      return NextResponse.json(
        { 
          error: 'No interviews remaining. Please upgrade your subscription.',
          interviews_remaining: 0,
          subscription_type: profile.subscription_type 
        },
        { status: 403 }
      )
    }

    // Deduct one interview
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

    // Log interview start
    console.log('Interview started', {
      user_id: user.id,
      interviews_remaining: profile.interviews_remaining - 1,
      duration: profile.interview_duration
    })

    // TODO: Integrate with Retell AI SDK
    // This is where you would call Retell AI to start an interview session
    // Example:
    // const retellResponse = await fetch('https://api.retellai.com/v1/interview', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     user_id: user.id,
    //     interview_type: 'nursing',
    //     interview_duration: profile.interview_duration,
    //   }),
    // })

    return NextResponse.json({
      success: true,
      message: 'Interview session started successfully',
      interview_duration: profile.interview_duration,
      interviews_remaining: profile.interviews_remaining - 1,
      subscription_type: profile.subscription_type,
    })
  } catch (error: any) {
    console.error('Interview API error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again or contact support.' },
      { status: 500 }
    )
  }
}

