'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { User, Mail, BookOpen, Clock, Settings } from 'lucide-react'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Form states
  const [name, setName] = useState('')
  const [courseType, setCourseType] = useState('BSc Nursing')
  const [interviewDuration, setInterviewDuration] = useState('5')

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
      setName(data.name || '')
      setCourseType(data.course_type || 'BSc Nursing')
      setInterviewDuration(data.interview_duration?.toString() || '5')
    } catch (error: any) {
      toast.error('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
       const { data: { user } } = await supabase.auth.getUser()
       if (!user) throw new Error('No user found')

       const { error } = await supabase
        .from('profiles')
        .update({
          name,
          course_type: courseType,
          interview_duration: parseInt(interviewDuration),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully')
      loadProfile()
    } catch (error: any) {
      toast.error('Failed to update profile')
    } finally {
      setUpdating(false)
    }
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
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Profile Settings</h1>
          </div>
          <p className="text-teal-50 text-lg">Manage your personal information and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
           
           {/* Personal Details Card */}
           <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-800">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">Personal Information</h2>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                       <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-colors"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                    <div className="relative opacity-70 cursor-not-allowed">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                       <input 
                          type="email" 
                          value={profile?.email}
                          disabled
                          className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-400"
                       />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Email cannot be changed</p>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-sm font-medium text-slate-400 mb-2">Course Type</label>
                       <div className="relative">
                          <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <select 
                             value={courseType}
                             onChange={(e) => setCourseType(e.target.value)}
                             className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none"
                          >
                             <option value="BSc Nursing">BSc Nursing</option>
                             <option value="Post Basic">Post Basic</option>
                             <option value="GNM">GNM</option>
                          </select>
                       </div>
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-slate-400 mb-2">Interview Duration</label>
                       <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <select 
                             value={interviewDuration}
                             onChange={(e) => setInterviewDuration(e.target.value)}
                             className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-teal-500 transition-colors appearance-none"
                          >
                             <option value="5">5 Minutes (Standard)</option>
                             <option value="10">10 Minutes (Extended)</option>
                             <option value="15">15 Minutes (Advanced)</option>
                          </select>
                       </div>
                    </div>
                 </div>

                 <div className="pt-4">
                    <button 
                       type="submit" 
                       disabled={updating}
                       className="px-8 py-3 bg-teal-500 text-slate-950 font-bold rounded-xl hover:bg-teal-400 transition-colors disabled:opacity-70"
                    >
                       {updating ? 'Saving...' : 'Save Changes'}
                    </button>
                 </div>
              </form>
           </div>
        </div>

        {/* Right Column - Quick Links */}
        <div className="lg:col-span-1 space-y-6">
           {/* Account Info */}
           <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Account Information</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">Member Since</span>
                    <span className="text-white text-sm">{new Date(profile?.created_at).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">User ID</span>
                    <span className="text-white text-xs font-mono">{profile?.id?.slice(0, 8)}...</span>
                 </div>
              </div>
           </div>

           {/* Quick Links */}
           <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
              <div className="space-y-3">
                 <Link href="/analysis" className="block px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-sm font-medium">
                    View Analysis Reports
                 </Link>
                 <Link href="/billing" className="block px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-sm font-medium">
                    Manage Billing
                 </Link>
                 <Link href="/pricing" className="block px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-sm font-medium">
                    View Pricing
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  )
}
