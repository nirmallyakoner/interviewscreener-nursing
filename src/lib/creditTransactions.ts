/**
 * Credit Transaction Management
 * 
 * Functions for managing credit transactions using Supabase database functions
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { calculateCreditsFromSeconds } from './credits'

export type TransactionType = 'purchase' | 'block' | 'deduct' | 'refund' | 'adjustment'
export type ReferenceType = 'interview' | 'payment' | 'manual'

export interface CreditTransaction {
  id: string
  user_id: string
  transaction_type: TransactionType
  amount: number
  balance_after: number
  reference_id?: string
  reference_type?: ReferenceType
  metadata?: Record<string, any>
  created_at: string
}

export interface BlockCreditsResult {
  success: boolean
  error?: string
  available?: number
  needed?: number
  credits_blocked?: number
  new_balance?: number
  blocked_credits?: number
}

export interface DeductCreditsResult {
  success: boolean
  credits_deducted?: number
  credits_refunded?: number
  new_balance?: number
  error?: string
}

export interface RefundCreditsResult {
  success: boolean
  credits_refunded?: number
  new_balance?: number
  error?: string
}

export interface AddCreditsResult {
  success: boolean
  credits_added?: number
  new_balance?: number
  error?: string
}

/**
 * Block credits for an interview (reserve them)
 * Uses atomic database function to prevent race conditions
 * 
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param amount - Credits to block
 * @param interviewSessionId - Interview session ID for reference
 * @returns Result of blocking operation
 */
export async function blockCredits(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  interviewSessionId: string
): Promise<BlockCreditsResult> {
  try {
    const { data, error } = await supabase.rpc('block_credits_atomic', {
      p_user_id: userId,
      p_amount: amount,
      p_session_id: interviewSessionId
    })

    if (error) {
      console.error('[Credits] Error blocking credits:', error)
      throw error
    }

    return data as BlockCreditsResult
  } catch (error: any) {
    console.error('[Credits] Failed to block credits:', error)
    return {
      success: false,
      error: error.message || 'Failed to block credits'
    }
  }
}

/**
 * Deduct actual credits used and refund the difference
 * Uses atomic database function to ensure consistency
 * 
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param blockedAmount - Amount that was blocked
 * @param actualAmount - Actual credits to deduct
 * @param interviewSessionId - Interview session ID for reference
 * @returns Result of deduction operation
 */
export async function deductCredits(
  supabase: SupabaseClient,
  userId: string,
  blockedAmount: number,
  actualAmount: number,
  interviewSessionId: string
): Promise<DeductCreditsResult> {
  try {
    const { data, error } = await supabase.rpc('deduct_credits_atomic', {
      p_user_id: userId,
      p_blocked_amount: blockedAmount,
      p_actual_amount: actualAmount,
      p_session_id: interviewSessionId
    })

    if (error) {
      console.error('[Credits] Error deducting credits:', error)
      throw error
    }

    return data as DeductCreditsResult
  } catch (error: any) {
    console.error('[Credits] Failed to deduct credits:', error)
    return {
      success: false,
      error: error.message || 'Failed to deduct credits'
    }
  }
}

/**
 * Refund all blocked credits (for failed calls)
 * 
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param amount - Credits to refund
 * @param interviewSessionId - Interview session ID for reference
 * @returns Result of refund operation
 */
export async function refundBlockedCredits(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  interviewSessionId: string
): Promise<RefundCreditsResult> {
  try {
    const { data, error } = await supabase.rpc('refund_blocked_credits_atomic', {
      p_user_id: userId,
      p_amount: amount,
      p_session_id: interviewSessionId
    })

    if (error) {
      console.error('[Credits] Error refunding credits:', error)
      throw error
    }

    return data as RefundCreditsResult
  } catch (error: any) {
    console.error('[Credits] Failed to refund credits:', error)
    return {
      success: false,
      error: error.message || 'Failed to refund credits'
    }
  }
}

/**
 * Add credits to user account (for purchases)
 * 
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param amount - Credits to add
 * @param paymentId - Payment ID for reference
 * @returns Result of add operation
 */
export async function addCredits(
  supabase: SupabaseClient,
  userId: string,
  amount: number,
  paymentId: string
): Promise<AddCreditsResult> {
  try {
    const { data, error } = await supabase.rpc('add_credits_atomic', {
      p_user_id: userId,
      p_amount: amount,
      p_payment_id: paymentId
    })

    if (error) {
      console.error('[Credits] Error adding credits:', error)
      throw error
    }

    return data as AddCreditsResult
  } catch (error: any) {
    console.error('[Credits] Failed to add credits:', error)
    return {
      success: false,
      error: error.message || 'Failed to add credits'
    }
  }
}

/**
 * Get user's credit transactions history
 * 
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param limit - Maximum number of transactions to fetch
 * @returns Array of credit transactions
 */
export async function getCreditTransactions(
  supabase: SupabaseClient,
  userId: string,
  limit: number = 50
): Promise<CreditTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('[Credits] Error fetching transactions:', error)
      throw error
    }

    return data || []
  } catch (error: any) {
    console.error('[Credits] Failed to fetch transactions:', error)
    return []
  }
}

/**
 * Process interview completion and deduct credits
 * This is the main function called from the Retell webhook
 * 
 * @param supabase - Supabase client
 * @param callId - Retell call ID
 * @param actualDurationSeconds - Actual call duration in seconds
 * @returns Result of processing
 */
export async function processInterviewCompletion(
  supabase: SupabaseClient,
  callId: string,
  actualDurationSeconds: number
): Promise<{
  success: boolean
  error?: string
  credits_deducted?: number
  credits_refunded?: number
}> {
  try {
    // Get interview session
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('id, user_id, credits_blocked, credits_deducted, credits_refunded, status')
      .eq('retell_call_id', callId)
      .single()

    if (sessionError || !session) {
      console.error('[Credits] Interview session not found:', callId)
      return {
        success: false,
        error: 'Interview session not found'
      }
    }

    // Check if credits already processed (not just status)
    if (session.credits_deducted !== null && session.credits_refunded !== null) {
      console.log('[Credits] Credits already processed:', callId, {
        credits_deducted: session.credits_deducted,
        credits_refunded: session.credits_refunded
      })
      return {
        success: true,
        error: 'Already processed',
        credits_deducted: session.credits_deducted,
        credits_refunded: session.credits_refunded
      }
    }

    // Calculate actual credits used
    const actualCredits = calculateCreditsFromSeconds(actualDurationSeconds)
    const blockedCredits = session.credits_blocked || 0

    console.log('[Credits] Processing interview completion:', {
      callId,
      actualDurationSeconds,
      actualCredits,
      blockedCredits,
      refund: blockedCredits - actualCredits
    })

    // Special case: If call failed immediately (0 duration), refund all blocked credits
    if (actualDurationSeconds === 0 && blockedCredits > 0) {
      console.log('[Credits] Call failed with 0 duration - refunding all blocked credits')
      
      const refundResult = await refundBlockedCredits(
        supabase,
        session.user_id,
        blockedCredits,
        session.id
      )

      if (!refundResult.success) {
        return {
          success: false,
          error: refundResult.error
        }
      }

      // Update session to mark as failed
      await supabase
        .from('interview_sessions')
        .update({
          actual_duration_seconds: 0,
          status: 'failed'
        })
        .eq('id', session.id)

      return {
        success: true,
        credits_deducted: 0,
        credits_refunded: blockedCredits
      }
    }

    // Normal case: Deduct actual usage and refund difference
    const result = await deductCredits(
      supabase,
      session.user_id,
      blockedCredits,
      actualCredits,
      session.id
    )

    if (!result.success) {
      return {
        success: false,
        error: result.error
      }
    }

    // Update interview session with actual duration
    await supabase
      .from('interview_sessions')
      .update({
        actual_duration_seconds: actualDurationSeconds
      })
      .eq('id', session.id)

    return {
      success: true,
      credits_deducted: result.credits_deducted,
      credits_refunded: result.credits_refunded
    }
  } catch (error: any) {
    console.error('[Credits] Failed to process interview completion:', error)
    return {
      success: false,
      error: error.message || 'Failed to process interview completion'
    }
  }
}

/**
 * Get user's current credit balance
 * 
 * @param supabase - Supabase client
 * @param userId - User ID
 * @returns Credit balance information
 */
export async function getUserCreditBalance(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  credits: number
  blocked_credits: number
  available_credits: number
} | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('credits, blocked_credits')
      .eq('id', userId)
      .single()

    if (error || !data) {
      console.error('[Credits] Error fetching credit balance:', error)
      return null
    }

    return {
      credits: data.credits || 0,
      blocked_credits: data.blocked_credits || 0,
      available_credits: (data.credits || 0) - (data.blocked_credits || 0)
    }
  } catch (error: any) {
    console.error('[Credits] Failed to fetch credit balance:', error)
    return null
  }
}
