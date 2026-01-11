'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/app-logo.png" alt="NursingPrep" width={40} height={40} className="rounded-lg" />
            <span className="text-xl font-bold text-white">NursingPrep</span>
          </Link>
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-gray-400 mb-8">Last updated: January 11, 2026</p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <p className="mb-4">We collect information that you provide directly to us when using NursingPrep:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Information:</strong> Name, email address, and profile picture from your Google account</li>
                <li><strong>Course Information:</strong> Your selected nursing course type (BSc Nursing, GNM, etc.)</li>
                <li><strong>Interview Data:</strong> Voice recordings, transcripts, and performance analytics from practice interviews</li>
                <li><strong>Usage Data:</strong> Information about how you use our service, including interview history and credit usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our AI-powered interview practice service</li>
                <li>Generate personalized feedback and performance analytics</li>
                <li>Process payments and manage your credits</li>
                <li>Send you important updates about your account and our service</li>
                <li>Respond to your questions and support requests</li>
                <li>Analyze usage patterns to improve our platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Data Storage and Security</h2>
              <p className="mb-4">
                Your data is stored securely using industry-standard encryption. We use Supabase for authentication and data storage,
                which employs enterprise-grade security measures. Interview recordings and transcripts are stored securely and are
                only accessible to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Third-Party Services</h2>
              <p className="mb-4">We use the following third-party services:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Google OAuth:</strong> For secure authentication</li>
                <li><strong>Supabase:</strong> For database and authentication services</li>
                <li><strong>Groq AI:</strong> For generating interview feedback and analysis</li>
                <li><strong>Retell AI:</strong> For voice interview functionality</li>
                <li><strong>Razorpay:</strong> For payment processing</li>
                <li><strong>Google Analytics:</strong> For usage analytics</li>
                <li><strong>Microsoft Clarity:</strong> For user experience insights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Data Sharing</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We only share your data with service
                providers necessary to operate our platform, and they are bound by confidentiality agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and data</li>
                <li>Export your interview data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
              <p>
                We retain your account information and interview data for as long as your account is active. If you delete your
                account, we will delete your personal data within 30 days, except where we are required to retain it for legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
              <p>
                Our service is not intended for users under the age of 18. We do not knowingly collect personal information from
                children under 18. If you believe we have collected such information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the
                new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
              <p className="mb-4">If you have any questions about this Privacy Policy, please contact us:</p>
              <ul className="space-y-2">
                <li>Email: <a href="mailto:nirmallyakoner31@gmail.com" className="text-cyan-400 hover:text-cyan-300">nirmallyakoner31@gmail.com</a></li>
                <li>Website: <Link href="/contact" className="text-cyan-400 hover:text-cyan-300">Contact Page</Link></li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
