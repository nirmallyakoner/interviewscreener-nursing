import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')

    console.log('[Webhook] Received webhook event')

    if (!signature) {
      console.error('[Webhook] Missing signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    
    if (!webhookSecret) {
      console.error('[Webhook] Webhook secret not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.error('[Webhook] Invalid signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log('[Webhook] Event type:', event.event)

    // Handle payment.captured event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity
      
      console.log('[Webhook] Processing payment.captured:', {
        payment_id: payment.id,
        order_id: payment.order_id,
        amount: payment.amount,
        method: payment.method
      })

      // Use service role client for webhook (no user auth)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      console.log('[Webhook] Using service role client for database access')

      // Get payment record to find user_id
      const { data: paymentRecord, error: fetchError } = await supabase
        .from('payments')
        .select('user_id, status')
        .eq('razorpay_order_id', payment.order_id)
        .single()

      if (fetchError || !paymentRecord) {
        console.error('[Webhook] Payment record not found:', payment.order_id, fetchError)
        return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
      }

      console.log('[Webhook] Found payment record for user:', paymentRecord.user_id)

      // Check if already processed
      if (paymentRecord.status === 'paid') {
        console.log('[Webhook] Payment already processed, skipping')
        return NextResponse.json({ success: true, message: 'Already processed' })
      }

      // Extract payment method details
      let paymentMethodDetails: any = {}
      
      if (payment.method === 'card' && payment.card) {
        paymentMethodDetails = {
          last4: payment.card.last4,
          network: payment.card.network,
          type: payment.card.type,
          issuer: payment.card.issuer,
        }
      } else if (payment.method === 'upi' && payment.vpa) {
        paymentMethodDetails = {
          vpa: payment.vpa,
        }
      } else if (payment.method === 'netbanking' && payment.bank) {
        paymentMethodDetails = {
          bank: payment.bank,
        }
      } else if (payment.method === 'wallet' && payment.wallet) {
        paymentMethodDetails = {
          wallet: payment.wallet,
        }
      }

      // Update payment record
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          razorpay_payment_id: payment.id,
          razorpay_signature: 'webhook_verified',
          status: 'paid',
          payment_method: payment.method || null,
          payment_method_details: Object.keys(paymentMethodDetails).length > 0 ? paymentMethodDetails : null,
          customer_email: payment.email || null,
          customer_contact: payment.contact || null,
          fee: payment.fee || 0,
          tax: payment.tax || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', payment.order_id)

      if (updateError) {
        console.error('[Webhook] Error updating payment:', updateError)
        return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 })
      }

      console.log('[Webhook] Payment record updated successfully')

      // Get current profile to calculate new credits
      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('credits, blocked_credits, total_interviews_purchased')
        .eq('id', paymentRecord.user_id)
        .single()

      if (profileFetchError || !profile) {
        console.error('[Webhook] Error fetching profile:', profileFetchError)
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
      }

      // Calculate credits for plan (₹149 = 160 credits for 2×8min interviews)
      const planCredits = 160

      // Import credit function
      const { addCredits } = await import('@/lib/creditTransactions')
      
      // Add credits using atomic function
      const creditResult = await addCredits(
        supabase,
        paymentRecord.user_id,
        planCredits,
        payment.id
      )

      if (!creditResult.success) {
        console.error('[Webhook] Error adding credits:', creditResult.error)
        return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 })
      }

      // Update profile with subscription details
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          subscription_type: 'paid',
          interview_duration: 8,
          total_interviews_purchased: (profile.total_interviews_purchased || 0) + 2,
        })
        .eq('id', paymentRecord.user_id)

      if (profileError) {
        console.error('[Webhook] Error updating profile:', profileError)
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
      }

      // Update payment record with credits added
      await supabase
        .from('payments')
        .update({
          credits_added: planCredits
        })
        .eq('razorpay_order_id', payment.order_id)

      console.log('[Webhook] Credits added successfully:', {
        user_id: paymentRecord.user_id,
        credits_added: planCredits,
        new_balance: creditResult.new_balance
      })

      return NextResponse.json({ 
        success: true,
        message: 'Payment verified and credits added',
        payment_id: payment.id,
        credits_added: planCredits
      })
    }

    // Handle other events
    console.log('[Webhook] Unhandled event type:', event.event)
    return NextResponse.json({ success: true, message: 'Event received' })

  } catch (error: any) {
    console.error('[Webhook] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
