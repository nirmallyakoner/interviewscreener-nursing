'use client'

import { RazorpayCheckout } from './RazorpayCheckout'

interface PricingCardProps {
  subscriptionType: string
  interviewsRemaining: number
  interviewDuration: number
}

export function PricingCard({ subscriptionType, interviewsRemaining, interviewDuration }: PricingCardProps) {
  const isFree = subscriptionType === 'free'
  const hasCredits = interviewsRemaining > 0

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
      {/* Subscription Badge */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Plan</h2>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            isFree
              ? 'bg-gray-100 text-gray-700'
              : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700'
          }`}
        >
          {isFree ? 'Free Trial' : 'Premium'}
        </span>
      </div>

      {/* Plan Details */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Interviews Remaining</span>
          <span className="text-2xl font-bold text-blue-600">{interviewsRemaining}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Interview Duration</span>
          <span className="text-lg font-semibold text-gray-900">{interviewDuration} minutes</span>
        </div>
      </div>

      {/* Upgrade Section */}
      {isFree && !hasCredits && (
        <div className="border-t border-gray-200 pt-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Upgrade to Premium</h3>
            <p className="text-gray-600 text-sm mb-4">
              Get 2 more interviews with extended 8-minute duration
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">2 Interviews</span>
                <span className="font-semibold text-gray-900">8 mins each</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Total Price</span>
                <span className="text-2xl font-bold text-blue-600">₹149</span>
              </div>
            </div>
          </div>

          <RazorpayCheckout amount={14900} />
        </div>
      )}

      {/* Free Trial Used */}
      {isFree && hasCredits && (
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-700">
              🎉 You have {interviewsRemaining} free interview{interviewsRemaining > 1 ? 's' : ''} remaining!
            </p>
          </div>
        </div>
      )}

      {/* Premium Active */}
      {!isFree && hasCredits && (
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
            <p className="text-sm text-blue-700 font-medium">
              ✨ Premium Active - Enjoy your {interviewsRemaining} interview{interviewsRemaining > 1 ? 's' : ''}!
            </p>
          </div>
        </div>
      )}

      {/* Premium Exhausted */}
      {!isFree && !hasCredits && (
        <div className="border-t border-gray-200 pt-6">
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-4">
              You've used all your premium interviews. Purchase more to continue!
            </p>
          </div>
          <RazorpayCheckout amount={14900} />
        </div>
      )}
    </div>
  )
}
