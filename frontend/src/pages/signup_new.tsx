import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import PageTransition from '@/components/PageTransition'
import SmoothButton from '@/components/SmoothButton'
import { useAuth } from '@/lib/useAuth'

export default function SignUp() {
  const router = useRouter()
  const { isAuthenticated, login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [authStep, setAuthStep] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)

  // Redirect if already authenticated (handled by useAuth hook)
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

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
    if (passwordStrength <= 2) return 'bg-red-400'
    if (passwordStrength <= 3) return 'bg-yellow-400'
    return 'bg-green-400'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak'
    if (passwordStrength <= 3) return 'Good'
    return 'Strong'
  }

  const handleGoogleSignUp = async () => {
    console.log('🔐 SignUp: Starting Google OAuth login...')
    login()
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
        provider: 'email',
        createdAt: new Date().toISOString(),
        verified: false
      }
      
      // Store user in localStorage
      localStorage.setItem('xeno-user', JSON.stringify(user))
      
      // Show success message briefly before redirect
      console.log('✅ Email signup successful!')
      setSuccess(true)
      setAuthStep('Account created successfully!')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Redirect to dashboard
      router.push('/')
    } catch (err) {
      console.error('❌ Signup error:', err)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="max-w-lg w-full space-y-10 relative z-10">
          {/* Header */}
          <div className="text-center animate-fade-in-up">
            <div className="relative mb-8">
              {/* Rocket Icon */}
              <div className="w-24 h-24 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-2xl transform rotate-12 animate-bounce-gentle"></div>
                <div className="absolute inset-1 bg-gradient-to-br from-orange-300 via-red-400 to-pink-400 rounded-xl transform rotate-6"></div>
                <div className="absolute inset-2 bg-gradient-to-br from-orange-200 via-red-300 to-pink-300 rounded-lg transform rotate-3"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl">🚀</div>
              </div>
              {/* Floating particles */}
              <div className="absolute top-2 right-8 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="absolute top-8 left-4 w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute top-16 right-4 w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              Join Xeno CRM
            </h1>
            <p className="text-gray-600 text-lg">
              Create your account and start managing your customers
            </p>
          </div>

          {/* Form Container */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100/50 p-10 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            {/* Google Sign Up Button */}
            <div className="mb-8">
              <SmoothButton
                onClick={handleGoogleSignUp}
                disabled={loading}
                loading={loading}
                variant="secondary"
                size="lg"
                className="w-full flex items-center justify-center space-x-4 py-4 bg-white border-2 border-gray-200 hover:border-red-400 hover:bg-red-50/50 rounded-xl font-medium text-gray-700 hover:text-red-600 transition-all duration-300 hover:shadow-lg"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-lg font-medium">
                  {loading ? (authStep || 'Signing up with Google...') : 'Continue with Google'}
                </span>
                {loading && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                )}
              </SmoothButton>
            </div>

            {/* Divider */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">or continue with email</span>
              </div>
            </div>

            {/* Email Sign Up Form */}
            <form onSubmit={handleEmailSignUp} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-800">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500 font-medium"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-800">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500 font-medium"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-800">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 hover:border-blue-300 bg-white/70 backdrop-blur-sm text-gray-900 placeholder-gray-500 font-medium"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-2 rounded-full transition-all duration-700 ease-out ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          passwordStrength <= 2 ? 'text-red-700 bg-red-100' : 
                          passwordStrength <= 3 ? 'text-yellow-700 bg-yellow-100' : 'text-green-700 bg-green-100'
                        }`}>
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-fade-in">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-red-700 font-semibold">{error}</span>
                  </div>
                </div>
              )}

              <SmoothButton
                type="submit"
                disabled={loading}
                loading={loading}
                variant="primary"
                size="lg"
                className="w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl text-white"
              >
                Create Your Account
              </SmoothButton>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={() => router.push('/')}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 hover:underline"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="grid grid-cols-3 gap-6 text-sm text-gray-600">
              <div className="flex flex-col items-center space-y-3 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100/50 hover:bg-white/90 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800 text-sm">Free to start</span>
              </div>
              <div className="flex flex-col items-center space-y-3 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100/50 hover:bg-white/90 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800 text-sm">AI-powered</span>
              </div>
              <div className="flex flex-col items-center space-y-3 p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100/50 hover:bg-white/90 hover:shadow-lg transition-all duration-300 group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-800 text-sm">Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
