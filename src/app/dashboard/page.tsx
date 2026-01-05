import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { StartInterviewButton } from '../components/StartInterviewButton'
import { PricingCard } from '../components/PricingCard'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile with new subscription fields
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_type, interviews_remaining, interview_duration, course_type, name, email')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
            NursingPrep
          </Link>
          <div className="flex items-center gap-4">
            <Link 
              href="/profile" 
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
            >
              My Profile
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name || 'Student'}!
          </h2>
          <p className="text-gray-600">{profile?.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Course
              </h3>
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                <span className="text-sm font-medium text-gray-900">
                  {profile?.course_type || 'Not Set'}
                </span>
              </div>
            </div>

            {/* Start Interview Card */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">
                Ready to Practice?
              </h3>
              <p className="text-blue-100 text-sm mb-6">
                Start a {profile?.interview_duration || 5}-minute nursing interview session
              </p>
              <StartInterviewButton hasCredits={(profile?.interviews_remaining || 0) > 0} />
            </div>
          </div>

          {/* Right Column - Pricing Card */}
          <div className="lg:col-span-1">
            <PricingCard
              subscriptionType={profile?.subscription_type || 'free'}
              interviewsRemaining={profile?.interviews_remaining || 0}
              interviewDuration={profile?.interview_duration || 5}
            />
          </div>
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Start Session
              </h4>
              <p className="text-sm text-gray-600">
                Click "Start Interview" to begin your practice session
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Voice Interview
              </h4>
              <p className="text-sm text-gray-600">
                Practice with AI-powered voice interviews
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Get Feedback
              </h4>
              <p className="text-sm text-gray-600">
                Receive detailed feedback to improve your skills
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
