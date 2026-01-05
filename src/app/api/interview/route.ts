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
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check user's credits in the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('interview_credits, is_gnm')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    if (!profile || profile.interview_credits <= 0) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please purchase more credits to continue.' },
        { status: 403 }
      )
    }

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
    //     is_gnm: profile.is_gnm,
    //   }),
    // })

    // Decrement user's credits
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ interview_credits: profile.interview_credits - 1 })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update credits' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Interview session started',
      remaining_credits: profile.interview_credits - 1,
      // retell_session_id: retellResponse.session_id, // Add when Retell AI is integrated
    })
  } catch (error: any) {
    console.error('Interview API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
