import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { useAuth } from '@/lib/useAuth'
import AuthNavigation from '@/components/AuthNavigation'
import PageTransition from '@/components/PageTransition'
import SmoothButton from '@/components/SmoothButton'

// Dynamically import ApiDocs to avoid SSR issues
const ApiDocs = dynamic(() => import('@/components/ApiDocs'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle shadow-lg">
          <span className="text-white font-bold text-2xl">📚</span>
        </div>
        <p className="text-gray-600 animate-pulse font-medium">Loading API Documentation...</p>
        <p className="text-sm text-gray-500 mt-2">Initializing Swagger UI...</p>
      </div>
    </div>
  )
})

export default function ApiDocsNew() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('🔐 API Docs: User not authenticated, redirecting to login')
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
            <span className="text-white font-bold text-xl">📚</span>
          </div>
          <p className="text-gray-600 animate-pulse">Loading API Documentation...</p>
        </div>
      </div>
    )
  }

  // Access denied state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to view API documentation.</p>
          <SmoothButton onClick={() => router.push('/login')} variant="primary">
            Go to Login
          </SmoothButton>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <Head>
        <title>API Documentation - Xeno CRM</title>
        <meta name="description" content="Comprehensive API documentation for Xeno CRM" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        <AuthNavigation currentPath={router.pathname} />

        {/* Main Content */}
        <div className="ml-0 lg:ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
          {/* Mobile Header */}
          <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle sidebar"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">📚</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">API Documentation</h1>
                  <p className="text-sm text-gray-600">Interactive API Reference</p>
                </div>
              </div>
              <div className="w-10"></div> {/* Spacer for centering */}
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📚</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
                  <p className="text-gray-600">Interactive API Reference and Testing Interface</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <SmoothButton
                  onClick={() => window.open('https://backend-production-05a7e.up.railway.app/api/docs', '_blank')}
                  variant="secondary"
                  size="sm"
                >
                  Open in New Tab
                </SmoothButton>
              </div>
            </div>
          </div>

          {/* API Documentation Content */}
          <div className="flex-1 p-4 sm:p-6">
            <div className="max-w-full mx-auto">
              {/* Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 text-sm">🔐</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Authentication</h3>
                      <p className="text-xs text-gray-600">Google OAuth + JWT</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 text-sm">📊</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Endpoints</h3>
                      <p className="text-xs text-gray-600">50+ API Endpoints</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 text-sm">🤖</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">AI Features</h3>
                      <p className="text-xs text-gray-600">Smart Segmentation</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Swagger UI Container */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Interactive API Documentation</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Live</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>Powered by Swagger UI React</span>
                    </div>
                  </div>
                </div>
                <div className="min-h-[600px]">
                  <ApiDocs />
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Quick Start</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Use the "Authorize" button to set your JWT token</li>
                    <li>• Click "Try it out" on any endpoint to test</li>
                    <li>• View request/response schemas and examples</li>
                    <li>• Copy cURL commands for integration</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">API Categories</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <strong>Authentication:</strong> Google OAuth, JWT tokens</li>
                    <li>• <strong>Customers:</strong> CRUD operations, analytics</li>
                    <li>• <strong>Segments:</strong> AI-powered segmentation</li>
                    <li>• <strong>Campaigns:</strong> Email/SMS campaign management</li>
                    <li>• <strong>Orders:</strong> Order processing and tracking</li>
                    <li>• <strong>AI:</strong> Smart features and insights</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
