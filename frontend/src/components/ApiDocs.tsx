import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'

interface ApiDocsProps {
  className?: string
}

export default function ApiDocs({ className = '' }: ApiDocsProps) {
  const { token } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  // Get the backend URL from environment or use production URL
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-production-05a7e.up.railway.app'
  const swaggerUrl = `${backendUrl}/api/docs`

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Test if the swagger endpoint is accessible
    const testConnection = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/docs/swagger.json`)
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
  }, [backendUrl, isClient])

  if (!isClient) {
    return (
      <div className={`flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle shadow-lg">
            <span className="text-white font-bold text-2xl">📚</span>
          </div>
          <p className="text-gray-600 animate-pulse font-medium">Loading API Documentation...</p>
          <p className="text-sm text-gray-500 mt-2">Initializing...</p>
        </div>
      </div>
    )
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
              onClick={() => window.open(swaggerUrl, '_blank')}
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
      {/* API Documentation iframe with proper styling */}
      <iframe
        src={swaggerUrl}
        className="w-full border-0 rounded-lg"
        title="API Documentation"
        style={{
          minHeight: '600px',
          height: '80vh',
        }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
        loading="lazy"
      />
      
      {/* Custom CSS for iframe styling */}
      <style jsx global>{`
        iframe[title="API Documentation"] {
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          background: white;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 768px) {
          iframe[title="API Documentation"] {
            min-height: 500px;
            height: 70vh;
            border-radius: 6px;
          }
        }
        
        /* Tablet responsiveness */
        @media (min-width: 768px) and (max-width: 1024px) {
          iframe[title="API Documentation"] {
            min-height: 600px;
            height: 75vh;
          }
        }
        
        /* Desktop responsiveness */
        @media (min-width: 1024px) {
          iframe[title="API Documentation"] {
            min-height: 600px;
            height: calc(100vh - 200px);
          }
        }
      `}</style>
    </div>
  )
}
