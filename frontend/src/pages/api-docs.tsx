import { useState, useEffect } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useAuth } from '@/lib/useAuth'
import AuthNavigation from '@/components/AuthNavigation'
import PageTransition from '@/components/PageTransition'

// Dynamically import SwaggerUI to avoid SSR issues and reduce bundle size
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false })

// Import Swagger UI CSS
import 'swagger-ui-react/swagger-ui.css'

interface SwaggerSpec {
  openapi: string
  info: {
    title: string
    version: string
    description: string
  }
  servers: Array<{
    url: string
    description: string
  }>
  paths: Record<string, any>
  components: Record<string, any>
}

export default function ApiDocsPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [swaggerSpec, setSwaggerSpec] = useState<SwaggerSpec | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSwaggerSpec = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch the swagger spec from backend
        const response = await fetch('https://backend-production-05a7e.up.railway.app/api/docs/swagger.json')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch API spec: ${response.status}`)
        }
        
        const spec = await response.json()
        setSwaggerSpec(spec)
      } catch (err) {
        console.error('Error fetching swagger spec:', err)
        setError(err instanceof Error ? err.message : 'Failed to load API documentation')
      } finally {
        setLoading(false)
      }
    }

    fetchSwaggerSpec()
  }, [])

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="ml-0 lg:ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading API Documentation...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ml-0 lg:ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
      <Head>
        <title>API Documentation - Xeno CRM</title>
        <meta name="description" content="Interactive API documentation and testing for Xeno CRM" />
      </Head>

      <AuthNavigation currentPath="/api-docs" />

      <main className="flex-1 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">API Documentation</h1>
                <p className="text-sm sm:text-base text-gray-600">Interactive API testing and documentation</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {loading && (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading API specification...</p>
              </div>
            )}

            {error && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load API Documentation</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {swaggerSpec && !loading && !error && (
              <div className="swagger-ui-container">
                <SwaggerUI
                  spec={swaggerSpec}
                  docExpansion="list"
                  defaultModelsExpandDepth={2}
                  defaultModelExpandDepth={2}
                  deepLinking={true}
                  displayOperationId={false}
                  displayRequestDuration={true}
                  filter={true}
                  showExtensions={true}
                  showCommonExtensions={true}
                  tryItOutEnabled={true}
                  requestInterceptor={(request) => {
                    // Add authentication token if available
                    const token = localStorage.getItem('token')
                    if (token) {
                      request.headers.Authorization = `Bearer ${token}`
                    }
                    return request
                  }}
                  responseInterceptor={(response) => {
                    // Handle responses
                    return response
                  }}
                  onComplete={() => {
                    // Custom styling after Swagger UI loads
                    const style = document.createElement('style')
                    style.textContent = `
                      .swagger-ui .topbar { display: none; }
                      .swagger-ui .info { margin: 20px 0; }
                      .swagger-ui .info .title { color: #1f2937; font-size: 2rem; }
                      .swagger-ui .info .description { color: #6b7280; font-size: 1.1rem; }
                      .swagger-ui .scheme-container { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                      .swagger-ui .opblock { border-radius: 8px; margin-bottom: 20px; }
                      .swagger-ui .opblock.opblock-post { border-color: #10b981; }
                      .swagger-ui .opblock.opblock-get { border-color: #3b82f6; }
                      .swagger-ui .opblock.opblock-put { border-color: #f59e0b; }
                      .swagger-ui .opblock.opblock-delete { border-color: #ef4444; }
                      .swagger-ui .btn { border-radius: 6px; }
                      .swagger-ui .btn.execute { background-color: #3b82f6; border-color: #3b82f6; }
                      .swagger-ui .btn.execute:hover { background-color: #2563eb; }
                      .swagger-ui .response-col_status { font-weight: 600; }
                      .swagger-ui .model { font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; }
                      .swagger-ui .model-title { color: #1f2937; }
                      .swagger-ui .prop-name { color: #7c3aed; }
                      .swagger-ui .prop-type { color: #059669; }
                      .swagger-ui .response-col_description__inner p { margin: 0; }
                      .swagger-ui .response-col_description__inner code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }
                      @media (max-width: 768px) {
                        .swagger-ui .wrapper { padding: 10px; }
                        .swagger-ui .opblock { margin-bottom: 15px; }
                        .swagger-ui .opblock-summary { padding: 10px; }
                        .swagger-ui .opblock-description-wrapper { padding: 10px; }
                        .swagger-ui .btn { padding: 8px 16px; font-size: 14px; }
                      }
                    `
                    document.head.appendChild(style)
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}