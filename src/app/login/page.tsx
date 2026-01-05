'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'

export default function LoginPage() {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [courseType, setCourseType] = useState<'BSc Nursing' | 'Post Basic' | 'GNM'>('BSc Nursing')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Sign up with email and password
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            name,
            course_type: courseType,
          },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes('already') || signUpError.message.includes('registered')) {
          toast.error('This email is already registered. Please use "Sign In" instead.')
          setLoading(false)
          return
        }
        throw signUpError
      }

      if (signUpData.user && !signUpData.session) {
        toast.error('Please check your email to confirm your account.')
        setLoading(false)
        return
      }

      toast.success('Account created successfully!')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      console.error('Signup error:', error)
      toast.error(error.message || 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      toast.success('Welcome back!')
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      console.error('Sign in error:', error)
      toast.error(error.message === 'Invalid login credentials' 
        ? 'Invalid email or password. Please try again.' 
        : error.message || 'An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const handleSubmit = mode === 'signup' ? handleSignUp : handleSignIn

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === 'signup' ? 'Get Started' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {mode === 'signup' 
                ? 'Create your account to start practicing' 
                : 'Sign in to continue practicing'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field - Only for Sign Up */}
            {mode === 'signup' && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
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
                  disabled={loading}
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder:text-gray-400"
                placeholder="student@example.com"
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 placeholder:text-gray-400"
                placeholder={mode === 'signup' ? 'Create a password (min 6 characters)' : 'Enter your password'}
                disabled={loading}
              />
            </div>

            {/* Course Type Selection - Only for Sign Up */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Your Course
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setCourseType('BSc Nursing')}
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl cursor-pointer"
            >
              {loading 
                ? (mode === 'signup' ? 'Creating Account...' : 'Signing In...') 
                : (mode === 'signup' ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              {mode === 'signup' 
                ? 'Secure password-based authentication' 
                : 'Enter your credentials to continue'}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
