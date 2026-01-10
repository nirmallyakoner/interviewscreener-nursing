/**
 * Credit System Utilities
 * 
 * Core functions for credit calculations and conversions
 * Based on: 10 credits = 1 minute
 */

// Constants
export const CREDITS_PER_MINUTE = 10
export const CREDITS_PER_SECOND = CREDITS_PER_MINUTE / 60
export const ROUNDING_INTERVAL_SECONDS = 15

/**
 * Calculate credits needed for a given duration in minutes
 * @param minutes - Interview duration in minutes
 * @returns Credits required
 * 
 * @example
 * calculateCreditsForDuration(5) // 50
 * calculateCreditsForDuration(8) // 80
 */
export function calculateCreditsForDuration(minutes: number): number {
  return minutes * CREDITS_PER_MINUTE
}

/**
 * Calculate credits from actual seconds with rounding to nearest 15 seconds
 * This ensures we don't have fractional credits and provides fair billing
 * 
 * @param seconds - Actual call duration in seconds
 * @returns Credits to deduct (rounded up to nearest 15s increment)
 * 
 * @example
 * calculateCreditsFromSeconds(125) // 2m 5s → rounds to 2m 15s → 22.5 credits
 * calculateCreditsFromSeconds(150) // 2m 30s → 25 credits
 * calculateCreditsFromSeconds(305) // 5m 5s → rounds to 5m 15s → 52.5 credits
 */
export function calculateCreditsFromSeconds(seconds: number): number {
  // Round up to nearest 15-second interval
  const roundedSeconds = Math.ceil(seconds / ROUNDING_INTERVAL_SECONDS) * ROUNDING_INTERVAL_SECONDS
  
  // Convert to credits
  return (roundedSeconds / 60) * CREDITS_PER_MINUTE
}

/**
 * Get maximum interview duration (in minutes) for available credits
 * @param credits - Available credits
 * @returns Maximum duration in minutes (floored)
 * 
 * @example
 * getMaxDurationForCredits(50) // 5 minutes
 * getMaxDurationForCredits(35) // 3 minutes
 * getMaxDurationForCredits(85) // 8 minutes
 */
export function getMaxDurationForCredits(credits: number): number {
  return Math.floor(credits / CREDITS_PER_MINUTE)
}

/**
 * Suggest alternative interview durations based on available credits
 * Returns standard durations (3, 5, 8, 10 minutes) that fit within available credits
 * 
 * @param availableCredits - User's available credits
 * @returns Array of suggested durations in minutes
 * 
 * @example
 * suggestDurations(80) // [3, 5, 8]
 * suggestDurations(30) // [3]
 * suggestDurations(150) // [3, 5, 8, 10]
 */
export function suggestDurations(availableCredits: number): number[] {
  const maxMinutes = getMaxDurationForCredits(availableCredits)
  const standardDurations = [3, 5, 8, 10]
  
  const suggestions = standardDurations.filter(duration => duration <= maxMinutes)
  
  // If no standard durations fit, return the max possible duration
  if (suggestions.length === 0 && maxMinutes > 0) {
    return [maxMinutes]
  }
  
  return suggestions
}

/**
 * Format credits as human-readable time
 * @param credits - Number of credits
 * @returns Formatted string (e.g., "5 minutes", "8.5 minutes")
 * 
 * @example
 * formatCreditsAsTime(50) // "5 minutes"
 * formatCreditsAsTime(85) // "8.5 minutes"
 */
export function formatCreditsAsTime(credits: number): string {
  const minutes = credits / CREDITS_PER_MINUTE
  
  if (minutes === Math.floor(minutes)) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }
  
  return `${minutes.toFixed(1)} minutes`
}

/**
 * Format seconds as MM:SS
 * @param seconds - Duration in seconds
 * @returns Formatted time string
 * 
 * @example
 * formatTime(125) // "02:05"
 * formatTime(305) // "05:05"
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Calculate available credits (total - blocked)
 * @param totalCredits - User's total credits
 * @param blockedCredits - Currently blocked credits
 * @returns Available credits
 */
export function calculateAvailableCredits(totalCredits: number, blockedCredits: number): number {
  return Math.max(0, totalCredits - blockedCredits)
}

/**
 * Check if user has sufficient credits for a duration
 * @param availableCredits - User's available credits
 * @param durationMinutes - Requested interview duration
 * @returns Object with validation result and suggestions
 */
export function validateCreditsForDuration(
  availableCredits: number,
  durationMinutes: number
): {
  valid: boolean
  creditsNeeded: number
  creditsAvailable: number
  suggestedDurations?: number[]
  maxDuration?: number
} {
  const creditsNeeded = calculateCreditsForDuration(durationMinutes)
  
  if (availableCredits >= creditsNeeded) {
    return {
      valid: true,
      creditsNeeded,
      creditsAvailable: availableCredits
    }
  }
  
  return {
    valid: false,
    creditsNeeded,
    creditsAvailable: availableCredits,
    suggestedDurations: suggestDurations(availableCredits),
    maxDuration: getMaxDurationForCredits(availableCredits)
  }
}

/**
 * Get pricing plan details
 */
export const PRICING_PLANS = {
  free: {
    name: 'Free',
    credits: 50,
    price: 0,
    currency: 'INR',
    interviews: '1×5min',
    duration: 5
  },
  starter: {
    name: 'Starter Pack',
    credits: 160,
    price: 149,
    currency: 'INR',
    interviews: '2×8min',
    duration: 8
  }
} as const

/**
 * Get credits for a pricing plan
 * @param planId - Plan identifier
 * @returns Credits for the plan
 */
export function getCreditsForPlan(planId: keyof typeof PRICING_PLANS): number {
  return PRICING_PLANS[planId].credits
}
