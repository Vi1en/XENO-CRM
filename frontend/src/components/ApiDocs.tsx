import { useState, useEffect } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import { useAuth } from '@/lib/useAuth'

interface ApiDocsProps {
  className?: string
}

export default function ApiDocs({ className = '' }: ApiDocsProps) {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get the backend URL from environment or use production URL
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-production-05a7e.up.railway.app'
  const swaggerJsonUrl = `${backendUrl}/api/docs/swagger.json`

  useEffect(() => {
    // Test if the swagger.json endpoint is accessible
    const testConnection = async () => {
      try {
        const response = await fetch(swaggerJsonUrl)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        setIsLoading(false)
        setError(null)
      } catch (err: any) {
        console.error('Failed to load Swagger JSON:', err)
        setError(err.message || 'Failed to load API documentation')
        setIsLoading(false)
      }
    }

    testConnection()
  }, [swaggerJsonUrl])

  // Swagger UI configuration
  const swaggerConfig = {
    url: swaggerJsonUrl,
    deepLinking: true,
    displayOperationId: false,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    defaultModelRendering: 'example' as const,
    displayRequestDuration: true,
    docExpansion: 'list' as const,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (request: any) => {
      // Add authentication header if token is available
      if (token) {
        request.headers.Authorization = `Bearer ${token}`
      }
      return request
    },
    responseInterceptor: (response: any) => {
      // Handle responses
      return response
    },
    onComplete: () => {
      console.log('Swagger UI loaded successfully')
    },
    onFailure: (error: any) => {
      console.error('Swagger UI failed to load:', error)
      setError('Failed to load API documentation')
    }
  }

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle shadow-lg">
            <span className="text-white font-bold text-2xl">📚</span>
          </div>
          <p className="text-gray-600 animate-pulse font-medium">Loading API Documentation...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching OpenAPI specification</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center p-6 max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Documentation</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setIsLoading(true)
                setError(null)
                window.location.reload()
              }}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Retry Loading
            </button>
            <button
              onClick={() => window.open(`${backendUrl}/api/docs`, '_blank')}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Open in New Tab
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full ${className}`}>
      {/* Custom CSS to match dashboard theme */}
      <style jsx global>{`
        .swagger-ui {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .swagger-ui .topbar {
          display: none;
        }
        
        .swagger-ui .info {
          margin: 20px 0;
        }
        
        .swagger-ui .info .title {
          color: #1f2937;
          font-size: 2rem;
          font-weight: 700;
        }
        
        .swagger-ui .info .description {
          color: #6b7280;
          font-size: 1.1rem;
        }
        
        .swagger-ui .scheme-container {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border: 1px solid #e5e7eb;
        }
        
        .swagger-ui .opblock {
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #e5e7eb;
        }
        
        .swagger-ui .opblock.opblock-post {
          border-left: 4px solid #10b981;
        }
        
        .swagger-ui .opblock.opblock-get {
          border-left: 4px solid #3b82f6;
        }
        
        .swagger-ui .opblock.opblock-put {
          border-left: 4px solid #f59e0b;
        }
        
        .swagger-ui .opblock.opblock-delete {
          border-left: 4px solid #ef4444;
        }
        
        .swagger-ui .btn {
          border-radius: 6px;
          font-weight: 500;
        }
        
        .swagger-ui .btn.execute {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }
        
        .swagger-ui .btn.execute:hover {
          background-color: #2563eb;
        }
        
        .swagger-ui .response-col_status {
          font-weight: 600;
        }
        
        .swagger-ui .model {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
        
        .swagger-ui .model-title {
          color: #1f2937;
        }
        
        .swagger-ui .prop-name {
          color: #7c3aed;
        }
        
        .swagger-ui .prop-type {
          color: #059669;
        }
        
        .swagger-ui .response-col_description__inner p {
          margin: 0;
        }
        
        .swagger-ui .response-col_description__inner code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .swagger-ui .wrapper {
            padding: 10px;
          }
          
          .swagger-ui .opblock {
            margin-bottom: 15px;
          }
          
          .swagger-ui .opblock-summary {
            padding: 10px;
          }
          
          .swagger-ui .opblock-description-wrapper {
            padding: 10px;
          }
          
          .swagger-ui .btn {
            padding: 8px 16px;
            font-size: 14px;
          }
          
          .swagger-ui .info .title {
            font-size: 1.5rem;
          }
        }
      `}</style>
      
      <SwaggerUI {...swaggerConfig} />
    </div>
  )
}
