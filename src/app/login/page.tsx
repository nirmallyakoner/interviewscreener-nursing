'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, Shield, Chrome } from 'lucide-react'

export default function LoginPage() {
  // Mode toggle: 'signin' or 'signup'
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  
  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [courseType, setCourseType] = useState<'BSc Nursing' | 'Post Basic' | 'GNM'>('BSc Nursing')
  
  const router = useRouter()
  const supabase = createClient()

  // Handler for Account Creation
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
           data: {
            name,
            course_type: courseType,
          },
        },
      })

      if (signUpError) {
        if (signUpError.message.includes('already') || signUpError.message.includes('registered')) {
          toast.error('This email is already registered. Switching to Sign In.')
          setMode('signin')
          setLoading(false)
          return
        }
        throw signUpError
      }
      
      if (signUpData.user && !signUpData.session) {
         toast.success('Check your email confirmation link!')
      } else {
         toast.success('Account created successfully!')
      }
      
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handler for Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      toast.success('Successfully logged in!')
      router.refresh()
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handler for Google Sign In
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
      
      // User will be redirected to Google OAuth consent screen
      // No need to show success message as they're leaving the page
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 flex overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Left Panel - Hero/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 border-r border-slate-800 items-center justify-center p-12">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/40 via-slate-900 to-slate-900 pointer-events-none" />
         <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0B0F17] to-transparent" />
         
         <div className="relative z-10 max-w-lg">
           <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-12 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Home
           </Link>
           
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="text-5xl font-bold text-white mb-6 leading-tight"
           >
             Master Your <br />
             <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">
               Nursing Interview
             </span>
           </motion.h1>
           
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="text-xl text-slate-400 mb-12"
           >
             Join thousands of nursing students practicing with our state-of-the-art AI interviewer.
           </motion.p>
           
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.4 }}
             className="space-y-4"
           >
              <div className="flex items-center gap-4 text-slate-300">
                 <div className="p-1 rounded-full bg-teal-500/10"><Check className="w-4 h-4 text-teal-400" /></div>
                 <span>Real-time voice analysis</span>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                 <div className="p-1 rounded-full bg-teal-500/10"><Check className="w-4 h-4 text-teal-400" /></div>
                 <span>Instant detailed feedback</span>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                 <div className="p-1 rounded-full bg-teal-500/10"><Check className="w-4 h-4 text-teal-400" /></div>
                 <span>Track your progress</span>
              </div>
           </motion.div>
         </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/10 via-[#0B0F17] to-[#0B0F17] pointer-events-none lg:hidden" />
         
         <div className="w-full max-w-md relative z-10">
            <div className="mb-8 text-center lg:text-left">
               <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
                  <ArrowLeft className="w-4 h-4" /> Back to Home
               </Link>
               <h2 className="text-3xl font-bold text-white mb-2">{mode === 'signup' ? 'Create an Account' : 'Welcome Back'}</h2>
               <p className="text-slate-400">
                 {mode === 'signup' ? 'Start your journey to interview success.' : 'Enter your details to access your dashboard.'}
               </p>
             {/* Google Sign In Button */}
             <button 
               onClick={handleGoogleSignIn}
               disabled={googleLoading}
               type="button"
               className="w-full py-4 rounded-xl font-semibold bg-white text-slate-900 hover:bg-slate-50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
             >
               <Chrome className="w-5 h-5" />
               {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
             </button>

             {/* Divider */}
             <div className="relative my-8">
               <div className="absolute inset-0 flex items-center">
                 <div className="w-full border-t border-slate-800"></div>
               </div>
               <div className="relative flex justify-center text-sm">
                 <span className="px-4 bg-[#0B0F17] text-slate-500">or continue with email</span>
               </div>
             </div>

            </div>

            <form onSubmit={mode === 'signup' ? handleSignUp : handleSignIn} className="space-y-6">
               
               {/* Name Input (Signup Only) */}
               {mode === 'signup' && (
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                      placeholder="Jane Doe"
                    />
                 </div>
               )}

               {/* Email Input */}
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                    placeholder="you@example.com"
                  />
               </div>
               
               {/* Password Input */}
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all"
                    placeholder="••••••••"
                  />
               </div>

                {/* Course Type Selection (Signup Only) */}
               {mode === 'signup' && (
                 <div>
                   <label className="block text-sm font-medium text-slate-300 mb-3">Select Your Course</label>
                   <div className="grid grid-cols-3 gap-3">
                     {['BSc Nursing', 'Post Basic', 'GNM'].map((type) => (
                       <button
                         key={type}
                         type="button"
                         onClick={() => setCourseType(type as any)}
                         className={`p-3 rounded-xl border transition-all text-sm font-medium cursor-pointer ${
                           courseType === type
                             ? 'bg-teal-500/20 border-teal-500 text-teal-400'
                             : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                         }`}
                       >
                         {type}
                       </button>
                     ))}
                   </div>
                 </div>
               )}

               <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full py-4 rounded-xl font-bold bg-gradient-to-r from-teal-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-teal-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
               >
                 {loading ? 'Processing...' : (mode === 'signup' ? 'Sign Up' : 'Sign In')}
               </button>
            </form>

            <div className="mt-8 text-center">
               <button 
                 onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                 className="text-slate-400 hover:text-teal-400 transition-colors text-sm cursor-pointer"
               >
                 {mode === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
               </button>
            </div>
            
            <div className="mt-12 flex justify-center items-center gap-2 text-slate-600 text-xs">
               <Shield className="w-3 h-3" />
               <span>Secure Authentication</span>
            </div>
         </div>
      </div>
    </div>
  )
}
