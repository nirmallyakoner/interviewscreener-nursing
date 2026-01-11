'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { GraduationCap } from 'lucide-react'

export default function CompleteProfilePage() {
  const [courseType, setCourseType] = useState<'BSc Nursing' | 'Post Basic' | 'GNM'>('BSc Nursing')
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Check if user already has course_type set
      if (user.user_metadata?.course_type) {
        router.push('/dashboard')
        return
      }

      setCheckingAuth(false)
    }

    checkUser()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No user found')
      }

      // Update user metadata with course type
      const { error } = await supabase.auth.updateUser({
        data: {
          course_type: courseType,
        },
      })

      if (error) throw error

      toast.success('Profile completed successfully!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex items-center justify-center p-6">
      <Toaster position="top-right" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-teal-500/10">
              <GraduationCap className="w-8 h-8 text-teal-400" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              Complete Your Profile
            </h1>
            <p className="text-slate-400">
              Select your nursing course to get personalized interview questions
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Select Your Course
              </label>
              <div className="grid grid-cols-1 gap-3">
                {['BSc Nursing', 'Post Basic', 'GNM'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCourseType(type as any)}
                    className={`p-4 rounded-xl border transition-all text-left font-medium cursor-pointer ${
                      courseType === type
                        ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{type}</span>
                      {courseType === type && (
                        <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-teal-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Continue to Dashboard'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
