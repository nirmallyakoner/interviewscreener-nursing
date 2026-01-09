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

    // Get payment ID from query params
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    // Fetch payment details
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .eq('user_id', user.id) // Ensure user owns this payment
      .single()

    if (paymentError || !payment) {
      console.error('Error fetching payment:', paymentError)
      return NextResponse.json({ 
        error: 'Payment not found or access denied' 
      }, { status: 404 })
    }

    // Fetch user profile for receipt
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, email')
      .eq('id', user.id)
      .single()

    // Format receipt data
    const receiptData = {
      // Company/App Info
      companyName: 'NursingPrep',
      companyAddress: 'India',
      companyEmail: 'support@nursingprep.com',
      
      // Receipt Info
      receiptNumber: payment.receipt || payment.razorpay_order_id,
      receiptDate: new Date(payment.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      
      // Customer Info
      customerName: profile?.name || 'Customer',
      customerEmail: payment.customer_email || profile?.email || user.email,
      customerContact: payment.customer_contact || '',
      
      // Payment Info
      paymentId: payment.razorpay_payment_id || 'N/A',
      orderId: payment.razorpay_order_id || 'N/A',
      paymentMethod: payment.payment_method || 'N/A',
      paymentMethodDetails: payment.payment_method_details || {},
      
      // Transaction Details
      amount: payment.amount || 0,
      currency: payment.currency || 'INR',
      fee: payment.fee || 0,
      tax: payment.tax || 0,
      totalAmount: payment.amount || 0,
      
      // Product Info
      productDescription: 'Premium Subscription - Interview Credits',
      interviewsAdded: payment.interviews_added || 2,
      
      // Status
      status: payment.status || 'N/A',
      paymentDate: new Date(payment.updated_at || payment.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    return NextResponse.json({
      success: true,
      receipt: receiptData,
    })
  } catch (error: any) {
    console.error('Receipt generation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
