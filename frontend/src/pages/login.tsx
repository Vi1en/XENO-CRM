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

        const handleDemoLogin = () => {
          console.log('🔐 Login: Starting demo login...')
          setError(null)
          login()
        }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                Loading...
              </h2>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <Head>
        <title>Login - Xeno CRM</title>
        <meta name="description" content="Login to Xeno CRM" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-6xl">🚀</div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome to Xeno CRM
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Authentication Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

                  <div className="space-y-4">
                    <SmoothButton
                      onClick={handleDemoLogin}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                      title="Sign in with Demo Account"
                    >
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                        <svg className="h-5 w-5 text-indigo-500 group-hover:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </span>
                      Sign in with Demo Account
                    </SmoothButton>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Demo authentication for testing purposes
                    </p>
                  </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}