import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/lib/useAuth'

interface SwaggerUIProps {
  className?: string
}

export default function SwaggerUI({ className = '' }: SwaggerUIProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { user, token } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get the backend URL from environment or use production URL
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-production-05a7e.up.railway.app'
  const swaggerUrl = `${backendUrl}/api/docs`

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    const handleLoad = () => {
      setIsLoading(false)
      setError(null)
    }

    const handleError = () => {
      setIsLoading(false)
      setError('Failed to load API documentation. Please check your connection.')
    }

    iframe.addEventListener('load', handleLoad)
    iframe.addEventListener('error', handleError)

    // Set up message listener for authentication
    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our backend
      if (event.origin !== backendUrl) return

      if (event.data.type === 'SWAGGER_UI_READY') {
        // Send authentication token to Swagger UI
        if (token) {
          iframe.contentWindow?.postMessage({
            type: 'SET_AUTH_TOKEN',
            token: token
          }, backendUrl)
        }
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      iframe.removeEventListener('load', handleLoad)
      iframe.removeEventListener('error', handleError)
      window.removeEventListener('message', handleMessage)
    }
  }, [backendUrl, token])

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle shadow-lg">
              <span className="text-white font-bold text-2xl">📚</span>
            </div>
            <p className="text-gray-600 animate-pulse font-medium">Loading API Documentation...</p>
            <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
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
                  if (iframeRef.current) {
                    iframeRef.current.src = swaggerUrl
                  }
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
      )}

      {/* Swagger UI iframe */}
      <iframe
        ref={iframeRef}
        src={swaggerUrl}
        className="w-full h-full border-0 rounded-lg"
        title="API Documentation"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false)
          setError('Failed to load API documentation. Please check your connection.')
        }}
        style={{
          minHeight: '600px',
          height: '100vh',
        }}
      />

      {/* Custom CSS for Swagger UI styling */}
      <style jsx global>{`
        /* Override Swagger UI styles to match dashboard */
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
