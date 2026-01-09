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

    // Fetch all payments for the user
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return NextResponse.json({ 
        error: 'Failed to fetch transaction history' 
      }, { status: 500 })
    }

    // Format the response
    const formattedPayments = (payments || []).map(payment => ({
      id: payment.id,
      razorpay_order_id: payment.razorpay_order_id,
      razorpay_payment_id: payment.razorpay_payment_id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      payment_method: payment.payment_method,
      payment_method_details: payment.payment_method_details,
      customer_email: payment.customer_email,
      customer_contact: payment.customer_contact,
      fee: payment.fee,
      tax: payment.tax,
      receipt: payment.receipt,
      interviews_added: payment.interviews_added,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
    }))

    return NextResponse.json({
      success: true,
      payments: formattedPayments,
      total: formattedPayments.length,
    })
  } catch (error: any) {
    console.error('List payments error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
