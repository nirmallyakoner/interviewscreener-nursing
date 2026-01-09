'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { CallAnalysisList } from '../components/CallAnalysisList'
import { TransactionList } from '../components/TransactionList'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [interviewSessions, setInterviewSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [courseType, setCourseType] = useState<'BSc Nursing' | 'Post Basic' | 'GNM'>('BSc Nursing')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      console.log('[Profile] Loading profile data...')
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.log('[Profile] No user found, redirecting to login')
        router.push('/login')
        return
      }

      console.log('[Profile] User authenticated:', user.id)
      setUser(user)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('[Profile] Error loading profile:', profileError)
      } else if (profileData) {
        console.log('[Profile] Profile loaded successfully')
        setProfile(profileData)
        setName(profileData.name || '')
        setCourseType(profileData.course_type || 'BSc Nursing')
      }

      // Fetch all interview sessions with analysis
      console.log('[Profile] Fetching interview sessions...')
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('started_at', { ascending: false })

      if (sessionsError) {
        console.error('[Profile] Error loading sessions:', sessionsError)
      } else if (sessionsData) {
        console.log('[Profile] Sessions loaded:', {
          total: sessionsData.length,
          with_analysis: sessionsData.filter(s => s.analysis).length,
          without_analysis: sessionsData.filter(s => !s.analysis).length
        })
        setInterviewSessions(sessionsData)
      }
    } catch (error) {
      console.error('[Profile] Unexpected error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          course_type: courseType,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Profile updated successfully!')
      setEditing(false)
      loadProfile()
    } catch (error: any) {
      console.error('Update error:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">
              NursingPrep
            </Link>
            <Link href="/dashboard" className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors cursor-pointer">
              ← Back to Dashboard
            </Link>
          </div>
        </nav>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all cursor-pointer"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {!editing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Full Name
                  </label>
                  <p className="text-lg text-gray-900">{profile?.name || 'Not set'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email Address
                  </label>
                  <p className="text-lg text-gray-900">{user?.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Course
                  </label>
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                    <span className="text-sm font-medium text-gray-900">
                      {profile?.course_type || 'Not set'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Subscription Type
                  </label>
                  <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                    <span className="text-sm font-medium text-gray-900">
                      {profile?.subscription_type === 'paid' ? 'Premium' : 'Free Trial'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Interviews Remaining
                  </label>
                  <p className="text-2xl font-bold text-blue-600">{profile?.interviews_remaining || 0}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Interview Duration
                  </label>
                  <p className="text-lg text-gray-900">{profile?.interview_duration || 5} minutes</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Member Since
                  </label>
                  <p className="text-lg text-gray-900">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder:text-gray-400"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Your Course
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setCourseType('BSc Nursing')}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        courseType === 'BSc Nursing'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">BSc</div>
                      <div className="text-xs mt-1">Nursing</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseType('Post Basic')}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        courseType === 'Post Basic'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">Post</div>
                      <div className="text-xs mt-1">Basic</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCourseType('GNM')}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        courseType === 'GNM'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-sm">GNM</div>
                      <div className="text-xs mt-1 opacity-0">-</div>
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false)
                      setName(profile?.name || '')
                      setCourseType(profile?.course_type || 'BSc Nursing')
                    }}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Transaction History Section */}
          <div id="transaction-history" className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Transaction History</h2>
            <TransactionList />
          </div>

          {/* Interview History Section */}
          <div id="interview-history" className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Interview History</h2>
            <CallAnalysisList sessions={interviewSessions} showTranscript={true} />
          </div>
        </main>
      </div>
    </>
  )
}
