import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            NursingPrep
          </h1>
          <Link
            href="/login"
            className="px-6 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 pb-16 text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              🎯 AI-Powered Interview Practice
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Boost Your Confidence to
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Conquer the Nursing
            </span>
            <br />
            Interview Process
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Master your nursing interviews with AI-powered practice sessions tailored for BSc, Post Basic, and GNM students
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/login"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Take Your First Interview
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-all shadow-md border border-gray-200"
            >
              Get Started Free
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 text-center mb-20">
            <div>
              <div className="text-3xl font-bold text-gray-900">3+</div>
              <div className="text-sm text-gray-600">Free Credits</div>
            </div>
            <div className="hidden sm:block w-px bg-gray-300"></div>
            <div>
              <div className="text-3xl font-bold text-gray-900">AI</div>
              <div className="text-sm text-gray-600">Voice Interviews</div>
            </div>
            <div className="hidden sm:block w-px bg-gray-300"></div>
            <div>
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Practice Anytime</div>
            </div>
          </div>
        </div>

        {/* Course Cards */}
        <div className="pb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tailored for Your Course
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* BSc Nursing */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-white text-2xl font-bold">BSc</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                BSc Nursing
              </h3>
              <p className="text-gray-600 mb-6">
                Advanced interview preparation for Bachelor of Science in Nursing students
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Clinical scenarios
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Evidence-based practice
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Leadership questions
                </li>
              </ul>
            </div>

            {/* Post Basic */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                <span className="text-white text-2xl font-bold">PB</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Post Basic
              </h3>
              <p className="text-gray-600 mb-6">
                Specialized preparation for Post Basic Nursing certification interviews
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Specialty knowledge
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Advanced procedures
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Critical thinking
                </li>
              </ul>
            </div>

            {/* GNM */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-6">
                <span className="text-white text-xl font-bold">GNM</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                GNM
              </h3>
              <p className="text-gray-600 mb-6">
                Comprehensive practice for General Nursing and Midwifery students
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Core nursing concepts
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Patient care basics
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Communication skills
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="pb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Sign Up & Choose Course
              </h3>
              <p className="text-gray-600">
                Create your account and select your nursing course (BSc, Post Basic, or GNM)
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Practice with AI
              </h3>
              <p className="text-gray-600">
                Engage in realistic voice-based interview sessions powered by AI
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold text-blue-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Get Instant Feedback
              </h3>
              <p className="text-gray-600">
                Receive detailed feedback and improve your interview skills
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="pb-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Ace Your Interview?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join nursing students who are boosting their confidence with AI-powered interview practice
            </p>
            <Link
              href="/login"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Start Practicing Now - It's Free!
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2026 NursingPrep. Empowering nursing students to succeed.</p>
        </div>
      </footer>
    </div>
  )
}
