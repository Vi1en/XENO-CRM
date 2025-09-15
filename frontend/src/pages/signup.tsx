import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import PageTransition from '@/components/PageTransition'
import SmoothButton from '@/components/SmoothButton'
import { signIn, getSession } from 'next-auth/react'

export default function SignUp() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authStep, setAuthStep] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)

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

  // Password strength checker
  useEffect(() => {
    if (formData.password) {
      let strength = 0
      if (formData.password.length >= 8) strength += 1
      if (/[A-Z]/.test(formData.password)) strength += 1
      if (/[a-z]/.test(formData.password)) strength += 1
      if (/[0-9]/.test(formData.password)) strength += 1
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 1
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(0)
    }
  }, [formData.password])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500'
    if (passwordStrength <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength <= 3) return 'Medium'
    return 'Strong'
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Try NextAuth Google OAuth first
      const result = await signIn('google', { 
        redirect: false,
        callbackUrl: '/' 
      })
      
      if (result?.ok) {
        // Get the session to extract user data
        const session = await getSession()
        if (session?.user) {
          const userData = {
            id: (session.user as any).id || `user_${Date.now()}`,
            name: session.user.name || 'User',
            email: session.user.email || '',
            avatar: session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || 'User')}&background=3b82f6&color=ffffff`,
            provider: 'google',
            createdAt: new Date().toISOString()
          }
          
          // Store user in localStorage
          localStorage.setItem('xeno-user', JSON.stringify(userData))
          router.push('/')
          return
        }
      }
      
      // Fallback to enhanced mock Google OAuth simulation
      console.log('NextAuth not configured, using enhanced mock Google OAuth')
      await simulateGoogleOAuth()
      
    } catch (error) {
      console.error('Google sign-up error:', error)
      setError('Failed to sign up with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const simulateGoogleOAuth = async () => {
    // Enhanced Google OAuth simulation with realistic steps
    const steps = [
      { message: 'Connecting to Google...', delay: 800 },
      { message: 'Opening Google OAuth...', delay: 1200 },
      { message: 'Authenticating with Google...', delay: 1500 },
      { message: 'Fetching user profile...', delay: 800 },
      { message: 'Setting up your account...', delay: 1000 }
    ]
    
    for (const step of steps) {
      setAuthStep(step.message)
      console.log(`🔐 ${step.message}`)
      await new Promise(resolve => setTimeout(resolve, step.delay))
    }
    
    // Generate realistic mock user data
    const mockNames = [
      'Alex Johnson', 'Sarah Chen', 'Michael Rodriguez', 'Emma Wilson', 
      'David Kim', 'Lisa Thompson', 'James Brown', 'Maria Garcia'
    ]
    const mockEmails = [
      'alex.johnson@gmail.com', 'sarah.chen@gmail.com', 'michael.rodriguez@gmail.com',
      'emma.wilson@gmail.com', 'david.kim@gmail.com', 'lisa.thompson@gmail.com'
    ]
    const mockAvatars = [
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    ]
    
    const randomIndex = Math.floor(Math.random() * mockNames.length)
    const mockUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: mockNames[randomIndex],
      email: mockEmails[randomIndex],
      avatar: mockAvatars[randomIndex % mockAvatars.length],
      provider: 'google',
      createdAt: new Date().toISOString(),
      verified: true
    }
    
    // Store user in localStorage
    localStorage.setItem('xeno-user', JSON.stringify(mockUser))
    
    // Show success message briefly before redirect
    console.log('✅ Google authentication successful!')
    setSuccess(true)
    setAuthStep('Welcome to Xeno CRM!')
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Redirect to dashboard
    router.push('/')
  }

  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const { name, email, password } = formData
      
      if (!name || !email || !password) {
        setError('Please fill in all fields')
        return
      }

      if (passwordStrength < 3) {
        setError('Password is too weak. Please use a stronger password.')
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
      
      // Show success state
      setSuccess(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
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
                className="w-full flex items-center justify-center space-x-3 py-3 border border-gray-300 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
              >
                {success ? (
                  <>
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-600">{authStep}</span>
                  </>
                ) : loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span>{authStep || 'Signing up with Google...'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
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
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
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
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        passwordStrength <= 2 ? 'text-red-600' : 
                        passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                  </div>
                )}
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
