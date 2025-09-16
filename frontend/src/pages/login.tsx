import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/useAuth'
import PageTransition from '@/components/PageTransition'
import SmoothButton from '@/components/SmoothButton'

export default function Login() {
  const router = useRouter()
  const { isAuthenticated, isLoading, login } = useAuth()
  const [error, setError] = useState<string | null>(null)

  // Redirect if already authenticated
  useEffect(() => {
    console.log('🔍 Login: Checking authentication status...')
    console.log('🔍 Login: isAuthenticated:', isAuthenticated)
    console.log('🔍 Login: isLoading:', isLoading)
    
    if (!isLoading && isAuthenticated) {
      console.log('✅ Login: User already authenticated, redirecting to dashboard')
      router.replace('/')
    }
  }, [isAuthenticated, isLoading, router])

  const handleGoogleLogin = () => {
    console.log('🔐 Login: Starting Google OAuth login...')
    setError(null)
    login()
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 animate-bounce-gentle shadow-2xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600 animate-pulse">Please wait while we prepare your dashboard</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <Head>
        <title>Login - Xeno CRM</title>
        <meta name="description" content="Sign in to your Xeno CRM account" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <div className="relative max-w-md w-full space-y-8 z-10">
          {/* Header */}
          <div className="text-center">
            {/* Enhanced logo */}
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl mb-6 animate-fade-in-up">
              <div className="relative">
                <svg className="w-10 h-10 text-white animate-bounce-gentle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {/* Floating particles around logo */}
                <div className="absolute -top-2 -right-2 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-1 -left-2 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              Welcome to Xeno CRM
            </h1>
            <p className="text-lg text-gray-600 font-medium animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 p-8 animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            {error && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-fade-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-semibold text-red-800">Authentication Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Google Sign In Button */}
            <div className="space-y-6">
              <SmoothButton
                onClick={handleGoogleLogin}
                className="group relative w-full flex items-center justify-center px-6 py-4 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-lg transition-all duration-300 text-gray-700 font-semibold text-lg"
                title="Sign in with Google"
              >
                <span className="absolute left-6 flex items-center">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </span>
                <span className="group-hover:text-blue-600 transition-colors duration-300">
                  Sign in with Google
                </span>
              </SmoothButton>

              {/* Security note */}
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-full">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-green-700">Secure authentication with Google OAuth</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex flex-col items-center space-y-2 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:shadow-lg transition-all duration-300 group">
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800 text-xs">Secure</span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:shadow-lg transition-all duration-300 group">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-violet-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800 text-xs">Fast</span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-3 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 hover:bg-white/80 hover:shadow-lg transition-all duration-300 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800 text-xs">Smart</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}