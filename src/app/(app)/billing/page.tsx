'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { RazorpayCheckout } from '../../../components/RazorpayCheckout'
import Link from 'next/link'
import { TransactionList } from '../../../components/TransactionList'
import { CreditCard, Zap, Calendar, ArrowRight } from 'lucide-react'

export default function BillingPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error: any) {
      toast.error('Error loading billing information')
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    toast.success('Payment successful! Credits added to your account.')
    loadProfile() // Reload profile to show updated credits
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />
      
      {/* Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-cyan-600 p-8">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-300 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Billing & Subscription</h1>
          </div>
          <p className="text-teal-50 text-lg">Manage your subscription and view payment history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Subscription Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Current Plan Card */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Current Plan</h2>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-400">Subscription Type</span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase ${
                  profile?.subscription_type === 'paid' 
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' 
                  : 'bg-slate-800 text-slate-300'
                }`}>
                  {profile?.subscription_type || 'Free'}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-400">Available Credits</span>
                <span className="font-bold text-white text-xl">{profile?.credits || profile?.interviews_remaining || 0}</span>
              </div>

              <div className="flex justify-between items-center py-3 border-b border-slate-800">
                <span className="text-slate-400">Interview Duration</span>
                <span className="text-white font-medium">{profile?.interview_duration || 5} minutes</span>
              </div>

              <div className="flex justify-between items-center py-3">
                <span className="text-slate-400">Member Since</span>
                <span className="text-white">{new Date(profile?.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Payment History</h2>
            </div>
            <TransactionList />
          </div>
        </div>

        {/* Right Column - Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Buy Credits Card */}
          <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl p-6 text-white">
            <div className="mb-4">
              <Zap className="w-10 h-10 mb-3" />
              <h3 className="text-xl font-bold mb-2">Buy Interview Credits</h3>
              <p className="text-teal-50 text-sm mb-4">
                Get 160 credits for ₹149 - Perfect for 2 long interviews (8 minutes each)
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4">
                <p className="text-xs text-teal-100 mb-1">Premium Pack</p>
                <p className="text-2xl font-bold">₹149</p>
                <p className="text-xs text-teal-100">160 Credits</p>
              </div>
            </div>
            <RazorpayCheckout amount={14900} onSuccess={handlePaymentSuccess} />
          </div>

          {/* Help Card */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">Need Help?</h3>
            <p className="text-slate-400 text-sm mb-4">
              Have questions about billing or payments? Our support team is here to help.
            </p>
            <Link 
              href="/contact" 
              className="block w-full py-3 text-center rounded-xl border border-teal-500/30 text-teal-400 font-bold hover:bg-teal-500/5 transition-colors"
            >
              Contact Support
            </Link>
          </div>

          {/* Payment Info */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
              <CreditCard className="w-4 h-4" />
              <span className="font-medium">Secure Payments</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              All transactions are encrypted and secured by Razorpay. We never store your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
