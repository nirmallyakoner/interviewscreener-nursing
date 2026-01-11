'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-gray-400 mb-8">Last updated: January 11, 2026</p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using NursingPrep ("the Service"), you accept and agree to be bound by these Terms of Service.
                If you do not agree to these terms, please do not use our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="mb-4">
                NursingPrep is an AI-powered platform that provides:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Voice-based nursing interview practice sessions</li>
                <li>AI-generated feedback and performance analysis</li>
                <li>Personalized coaching recommendations</li>
                <li>Interview transcript and recording access</li>
                <li>Progress tracking and analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
              <p className="mb-4">To use our Service, you must:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Be at least 18 years old</li>
                <li>Create an account using a valid Google account</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
              </ul>
              <p className="mt-4">
                You are responsible for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Credits and Payments</h2>
              <p className="mb-4">
                Our Service operates on a credit-based system:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Each interview session consumes credits based on duration</li>
                <li>Credits can be purchased through our payment gateway (Razorpay)</li>
                <li>All payments are processed securely and are non-refundable unless required by law</li>
                <li>Unused credits do not expire but are non-transferable</li>
                <li>We reserve the right to modify pricing with 30 days notice</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Acceptable Use</h2>
              <p className="mb-4">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Share your account credentials with others</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Upload malicious content or viruses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
              <p className="mb-4">
                All content, features, and functionality of NursingPrep are owned by us and are protected by copyright, trademark,
                and other intellectual property laws.
              </p>
              <p>
                You retain ownership of your interview recordings and responses. By using our Service, you grant us a license to
                process and analyze your content to provide our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. AI-Generated Content</h2>
              <p>
                Our Service uses AI to generate feedback and analysis. While we strive for accuracy, AI-generated content may
                contain errors or inaccuracies. The feedback is for practice purposes only and should not be considered as
                professional career advice or guaranteed interview success.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Disclaimer of Warranties</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT GUARANTEE
                THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Data and Privacy</h2>
              <p>
                Your use of the Service is also governed by our <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">Privacy Policy</Link>.
                Please review it to understand how we collect, use, and protect your information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Termination</h2>
              <p className="mb-4">
                We reserve the right to suspend or terminate your account if you violate these Terms. You may also delete your
                account at any time through your profile settings.
              </p>
              <p>
                Upon termination, your right to use the Service will immediately cease, and we may delete your data in accordance
                with our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Changes to Terms</h2>
              <p>
                We may modify these Terms at any time. We will notify you of significant changes by email or through the Service.
                Your continued use of the Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its
                conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Contact Information</h2>
              <p className="mb-4">For questions about these Terms, please contact us:</p>
              <ul className="space-y-2">
                <li>Email: <a href="mailto:nirmallyakoner31@gmail.com" className="text-cyan-400 hover:text-cyan-300">nirmallyakoner31@gmail.com</a></li>
                <li>Website: <Link href="/contact" className="text-cyan-400 hover:text-cyan-300">Contact Page</Link></li>
              </ul>
            </section>

            <section className="pt-8 border-t border-white/10">
              <p className="text-sm text-gray-400">
                By using NursingPrep, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
