import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has a pending payment
    const { data: pendingPayment } = await supabase
      .from('payments')
      .select('razorpay_order_id, created_at')
      .eq('user_id', user.id)
      .eq('status', 'created')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // If pending payment exists and is less than 10 minutes old, return it
    if (pendingPayment) {
      const createdAt = new Date(pendingPayment.created_at)
      const now = new Date()
      const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)
      
      if (diffMinutes < 10) {
        return NextResponse.json({
          orderId: pendingPayment.razorpay_order_id,
          amount: 14900,
          currency: 'INR',
          keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          message: 'Using existing pending order'
        })
      }
    }

    // Validate Razorpay keys exist
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay keys not configured')
      return NextResponse.json({ 
        error: 'Payment system not configured. Please contact support.' 
      }, { status: 500 })
    }

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    // Create order for ₹149
    const amount = 14900 // Amount in paise (₹149)
    const currency = 'INR'

    // Generate short receipt ID (max 40 chars)
    const timestamp = Date.now().toString().slice(-8)
    const receiptId = `rcpt_${timestamp}`

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: receiptId,
      notes: {
        user_id: user.id,
        interviews: '2',
        duration: '8',
      },
    })

    // Store order in database
    const { error: dbError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        razorpay_order_id: order.id,
        amount,
        currency,
        status: 'created',
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ 
        error: 'Failed to create order. Please try again.' 
      }, { status: 500 })
    }

    // Log order creation
    console.log('Order created successfully', {
      user_id: user.id,
      order_id: order.id,
      amount
    })

    return NextResponse.json({
      orderId: order.id,
      amount,
      currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    })
  } catch (error: any) {
    console.error('Create order error:', error)
    
    // Don't expose internal error details to client
    const clientError = error.statusCode === 400 
      ? 'Invalid payment configuration. Please contact support.'
      : 'Failed to create order. Please try again.'
    
    return NextResponse.json(
      { error: clientError },
      { status: 500 }
    )
  }
}
