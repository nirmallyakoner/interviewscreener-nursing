// Google Analytics Event Tracking Utilities

// Track custom events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, eventParams)
  }
}

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Track user properties
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('set', 'user_properties', properties)
  }
}

// Predefined event tracking functions for common actions
export const analytics = {
  // Authentication events
  trackSignUp: (method: string = 'email') => {
    trackEvent('sign_up', { method })
  },

  trackLogin: (method: string = 'email') => {
    trackEvent('login', { method })
  },

  // Interview events
  trackInterviewStarted: (courseType: string, duration: number) => {
    trackEvent('interview_started', {
      course_type: courseType,
      duration: duration,
    })
  },

  trackInterviewCompleted: (courseType: string, duration: number) => {
    trackEvent('interview_completed', {
      course_type: courseType,
      duration: duration,
    })
  },

  trackAudioTestCompleted: () => {
    trackEvent('audio_test_completed')
  },

  // Payment events
  trackBeginCheckout: (amount: number, currency: string = 'INR') => {
    trackEvent('begin_checkout', {
      value: amount,
      currency: currency,
    })
  },

  trackPurchase: (
    transactionId: string,
    amount: number,
    currency: string,
    interviewsAdded: number
  ) => {
    trackEvent('purchase', {
      transaction_id: transactionId,
      value: amount,
      currency: currency,
      items: [
        {
          item_name: 'Interview Credits',
          quantity: interviewsAdded,
        },
      ],
    })
  },

  // Engagement events
  trackViewAnalysis: (callId: string) => {
    trackEvent('view_analysis', { call_id: callId })
  },

  trackDownloadReceipt: (transactionId: string) => {
    trackEvent('download_receipt', { transaction_id: transactionId })
  },
}
