import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import PageTransition from '@/components/PageTransition'
import SmoothButton from '@/components/SmoothButton'

export default function SignUp() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('xeno-user')
        if (storedUser) {
          setIsAuthenticated(true)
          router.push('/')
        }
      } catch (error) {
        console.error('Auth check error:', error)
      }
    }

    checkAuth()
  }, [router])

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate Google OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create a mock user for demo purposes
      const mockUser = {
        id: `user_${Date.now()}`,
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        provider: 'google',
        createdAt: new Date().toISOString()
      }
      
      // Store user in localStorage
      localStorage.setItem('xeno-user', JSON.stringify(mockUser))
      
      // Redirect to dashboard
      router.push('/')
      
    } catch (error) {
      console.error('Google sign-up error:', error)
      setError('Failed to sign up with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get('name') as string
      const email = formData.get('email') as string
      const password = formData.get('password') as string
      
      if (!name || !email || !password) {
        setError('Please fill in all fields')
        return
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create user object
      const user = {
        id: `user_${Date.now()}`,
        name,
        email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=ffffff`,
        provider: 'email',
        createdAt: new Date().toISOString()
      }
      
      // Store user in localStorage
      localStorage.setItem('xeno-user', JSON.stringify(user))
      
      // Redirect to dashboard
      router.push('/')
      
    } catch (error) {
      console.error('Email sign-up error:', error)
      setError('Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
            <span className="text-white font-bold text-xl">X</span>
          </div>
          <p className="text-gray-600 animate-pulse">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <Head>
        <title>Sign Up - Xeno CRM</title>
        <meta name="description" content="Create your Xeno CRM account" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
              <span className="text-white font-bold text-2xl">X</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
            <p className="text-gray-600">Join Xeno CRM and start managing your business</p>
          </div>

          {/* Sign Up Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            {/* Google Sign Up Button */}
            <div className="mb-6">
              <SmoothButton
                onClick={handleGoogleSignUp}
                disabled={loading}
                loading={loading}
                variant="secondary"
                size="lg"
                className="w-full flex items-center justify-center space-x-3 py-3 border border-gray-300 hover:bg-gray-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </SmoothButton>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or sign up with email</span>
              </div>
            </div>

            {/* Email Sign Up Form */}
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Create a password"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-fade-in">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              )}

              <SmoothButton
                type="submit"
                disabled={loading}
                loading={loading}
                variant="primary"
                size="lg"
                className="w-full"
              >
                Create Account
              </SmoothButton>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/')}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Free to start</span>
              </div>
              <div className="flex items-center justify-center space-x-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>AI-powered</span>
              </div>
              <div className="flex items-center justify-center space-x-1">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Real-time data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
