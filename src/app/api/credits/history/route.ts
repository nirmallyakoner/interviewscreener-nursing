import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const type = searchParams.get('type') // 'purchase' | 'block' | 'deduct' | 'refund'
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Build query
    let query = supabase
      .from('credit_transactions')
      .select(`
        id,
        transaction_type,
        amount,
        balance_after,
        reference_id,
        reference_type,
        metadata,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (type) {
      query = query.eq('transaction_type', type)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    // Get total count for pagination
    const { count } = await supabase
      .from('credit_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Get paginated transactions
    const { data: transactions, error: txError } = await query
      .range(offset, offset + limit - 1)

    if (txError) {
      console.error('[CreditHistory] Error fetching transactions:', txError)
      return NextResponse.json(
        { error: 'Failed to fetch credit history' },
        { status: 500 }
      )
    }

    // Enrich transactions with interview and payment details
    const enrichedTransactions = await Promise.all(
      (transactions || []).map(async (tx) => {
        const enriched: any = { ...tx }

        // If reference is an interview, fetch interview details
        if (tx.reference_type === 'interview' && tx.reference_id) {
          const { data: interview } = await supabase
            .from('interview_sessions')
            .select('id, duration_minutes, actual_duration_seconds, status, started_at')
            .eq('id', tx.reference_id)
            .single()

          if (interview) {
            enriched.interview = interview
          }
        }

        // If reference is a payment, fetch payment details
        if (tx.reference_type === 'payment' && tx.reference_id) {
          const { data: payment } = await supabase
            .from('payments')
            .select('id, amount, receipt_number, created_at')
            .eq('id', tx.reference_id)
            .single()

          if (payment) {
            enriched.payment = payment
          }
        }

        return enriched
      })
    )

    return NextResponse.json({
      transactions: enrichedTransactions,
      total: count || 0,
      hasMore: (offset + limit) < (count || 0),
      limit,
      offset
    })

  } catch (error: any) {
    console.error('[CreditHistory] Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
