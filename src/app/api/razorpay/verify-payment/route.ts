import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  console.log('='.repeat(80))
  console.log('[VERIFY-PAYMENT] 🚀 Payment verification started')
  console.log('[VERIFY-PAYMENT] Timestamp:', new Date().toISOString())
  
  try {
    const body = await request.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    console.log('[VERIFY-PAYMENT] 📦 Received payment data:', {
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      has_signature: !!razorpay_signature
    })

    // Input validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('[VERIFY-PAYMENT] ❌ Missing payment details')
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    // Validate format
    if (typeof razorpay_order_id !== 'string' || 
        typeof razorpay_payment_id !== 'string' || 
        typeof razorpay_signature !== 'string') {
      console.error('[VERIFY-PAYMENT] ❌ Invalid payment data format')
      return NextResponse.json({ error: 'Invalid payment data format' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('[VERIFY-PAYMENT] ❌ Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[VERIFY-PAYMENT] ✅ User authenticated:', user.id)

    // SECURITY: Check if payment already processed (idempotency)
    console.log('[VERIFY-PAYMENT] 🔍 Checking for existing payment...')
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('status, razorpay_payment_id')
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', user.id)
      .single()

    if (existingPayment) {
      console.log('[VERIFY-PAYMENT] 📋 Found existing payment:', {
        status: existingPayment.status,
        payment_id: existingPayment.razorpay_payment_id
      })
      
      if (existingPayment.status === 'paid') {
        console.log('[VERIFY-PAYMENT] ⚠️  Payment already processed, skipping')
        return NextResponse.json({ 
          success: true, 
          message: 'Payment already processed',
          interviews_added: 0 
        })
      }
      
      // Check if trying to use different payment_id for same order
      if (existingPayment.razorpay_payment_id && 
          existingPayment.razorpay_payment_id !== razorpay_payment_id) {
        console.error('[VERIFY-PAYMENT] ❌ Payment ID mismatch')
        return NextResponse.json({ 
          error: 'Payment ID mismatch for this order' 
        }, { status: 400 })
      }
    }

    // Verify signature
    console.log('[VERIFY-PAYMENT] 🔐 Verifying payment signature...')
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      console.error('[VERIFY-PAYMENT] ❌ Signature verification failed:', {
        user_id: user.id,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id
      })
      
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    console.log('[VERIFY-PAYMENT] ✅ Signature verified successfully')

    // Fetch complete payment details from Razorpay
    console.log('[VERIFY-PAYMENT] 🌐 Fetching payment details from Razorpay API...')
    let paymentDetails: any = {}
    let paymentMethod = ''
    let paymentMethodDetails: any = {}
    let customerEmail = ''
    let customerContact = ''
    let fee = 0
    let tax = 0

    try {
      const Razorpay = require('razorpay')
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      })

      // Fetch payment details from Razorpay
      paymentDetails = await razorpay.payments.fetch(razorpay_payment_id)
      
      console.log('[VERIFY-PAYMENT] ✅ Payment details fetched from Razorpay:', {
        payment_id: razorpay_payment_id,
        method: paymentDetails.method,
        status: paymentDetails.status,
        amount: paymentDetails.amount,
        email: paymentDetails.email,
        contact: paymentDetails.contact
      })

      // Extract payment method
      paymentMethod = paymentDetails.method || ''

      // Extract method-specific details
      if (paymentMethod === 'card' && paymentDetails.card) {
        paymentMethodDetails = {
          last4: paymentDetails.card.last4,
          network: paymentDetails.card.network,
          type: paymentDetails.card.type,
          issuer: paymentDetails.card.issuer,
          name: paymentDetails.card.name,
        }
        console.log('[VERIFY-PAYMENT] 💳 Card payment:', paymentMethodDetails)
      } else if (paymentMethod === 'upi' && paymentDetails.vpa) {
        paymentMethodDetails = {
          vpa: paymentDetails.vpa,
        }
        console.log('[VERIFY-PAYMENT] 📱 UPI payment:', paymentMethodDetails)
      } else if (paymentMethod === 'netbanking' && paymentDetails.bank) {
        paymentMethodDetails = {
          bank: paymentDetails.bank,
        }
        console.log('[VERIFY-PAYMENT] 🏦 NetBanking payment:', paymentMethodDetails)
      } else if (paymentMethod === 'wallet' && paymentDetails.wallet) {
        paymentMethodDetails = {
          wallet: paymentDetails.wallet,
        }
        console.log('[VERIFY-PAYMENT] 👛 Wallet payment:', paymentMethodDetails)
      }

      // Extract customer details
      customerEmail = paymentDetails.email || ''
      customerContact = paymentDetails.contact || ''

      // Extract fee details
      fee = paymentDetails.fee || 0
      tax = paymentDetails.tax || 0

    } catch (razorpayError: any) {
      console.error('[VERIFY-PAYMENT] ⚠️  Error fetching payment details from Razorpay:', razorpayError.message)
      // Continue with payment verification even if fetching details fails
      // We'll just store basic information
    }

    // Sanitize payment metadata to prevent database errors from large payloads
    const sanitizedMetadata = paymentDetails ? {
      id: paymentDetails.id,
      entity: paymentDetails.entity,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      status: paymentDetails.status,
      method: paymentDetails.method,
      captured: paymentDetails.captured,
      created_at: paymentDetails.created_at,
    } : {}

    // Update payment record
    console.log('[VERIFY-PAYMENT] 💾 Updating payment record in database...')
    const { error: paymentError } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'paid',
        payment_method: paymentMethod || null,
        payment_method_details: Object.keys(paymentMethodDetails).length > 0 ? paymentMethodDetails : null,
        customer_email: customerEmail || null,
        customer_contact: customerContact || null,
        fee: fee || 0,
        tax: tax || 0,
        notes: (paymentDetails?.notes && Object.keys(paymentDetails.notes).length > 0) ? paymentDetails.notes : null,
        payment_metadata: Object.keys(sanitizedMetadata).length > 0 ? sanitizedMetadata : null,
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .eq('user_id', user.id)

    if (paymentError) {
      console.error('[VERIFY-PAYMENT] ❌ Payment update error:', paymentError)
      return NextResponse.json({ 
        error: 'Payment processing failed. Please contact support.' 
      }, { status: 500 })
    }

    console.log('[VERIFY-PAYMENT] ✅ Payment record updated successfully')

    // Get current profile values
    const { data: profile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('interviews_remaining, total_interviews_purchased, subscription_type')
      .eq('id', user.id)
      .single()

    if (profileFetchError || !profile) {
      console.error('Profile fetch error:', profileFetchError)
      return NextResponse.json({ 
        error: 'Failed to update account. Please contact support.' 
      }, { status: 500 })
    }

    // Update user profile with subscription
    console.log('[VERIFY-PAYMENT] 👤 Crediting interviews to user account...')
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        subscription_type: 'paid',
        interview_duration: 8,
        interviews_remaining: (profile.interviews_remaining || 0) + 2,
        total_interviews_purchased: (profile.total_interviews_purchased || 0) + 2,
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('[VERIFY-PAYMENT] ❌ Profile update error:', profileError)
      // Payment was marked as paid but profile update failed
      // This needs manual intervention
      return NextResponse.json({ 
        error: 'Payment successful but account update failed. Please contact support with your payment ID.' 
      }, { status: 500 })
    }

    console.log('[VERIFY-PAYMENT] ✅ Interviews credited successfully')
    console.log('[VERIFY-PAYMENT] 🎉 Payment verification completed successfully!')
    console.log('[VERIFY-PAYMENT] Summary:', {
      user_id: user.id,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      amount: 14900,
      method: paymentMethod,
      interviews_added: 2,
      duration_ms: Date.now() - startTime
    })
    console.log('='.repeat(80))

    // Log successful payment
    console.log('Payment processed successfully', {
      user_id: user.id,
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      amount: 14900
    })

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      interviews_added: 2,
    })
  } catch (error: any) {
    console.error('Verify payment error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again or contact support.' },
      { status: 500 }
    )
  }
}

