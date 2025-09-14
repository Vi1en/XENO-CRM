import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { customerApi, campaignApi, segmentApi, orderApi } from '@/lib/api'

export default function DebugPage() {
  const { data: session } = useSession()
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const runDebug = async () => {
    setLoading(true)
    const info: any = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      tests: {}
    }

    try {
      // Test customers API
      try {
        const customersRes = await customerApi.getAll()
        info.tests.customers = {
          status: 'success',
          count: customersRes.data.data?.length || 0,
          data: customersRes.data.data?.slice(0, 2) || []
        }
      } catch (error: any) {
        info.tests.customers = {
          status: 'error',
          error: error.message,
          response: error.response?.data
        }
      }

      // Test campaigns API
      try {
        const campaignsRes = await campaignApi.getAll()
        info.tests.campaigns = {
          status: 'success',
          count: campaignsRes.data.data?.length || 0,
          data: campaignsRes.data.data?.slice(0, 2) || []
        }
      } catch (error: any) {
        info.tests.campaigns = {
          status: 'error',
          error: error.message,
          response: error.response?.data
        }
      }

      // Test segments API
      try {
        const segmentsRes = await segmentApi.getAll()
        info.tests.segments = {
          status: 'success',
          count: segmentsRes.data.data?.length || 0,
          data: segmentsRes.data.data?.slice(0, 2) || []
        }
      } catch (error: any) {
        info.tests.segments = {
          status: 'error',
          error: error.message,
          response: error.response?.data
        }
      }

      // Test orders API
      try {
        const ordersRes = await orderApi.getAll()
        info.tests.orders = {
          status: 'success',
          count: ordersRes.data.data?.length || 0,
          data: ordersRes.data.data?.slice(0, 2) || []
        }
      } catch (error: any) {
        info.tests.orders = {
          status: 'error',
          error: error.message,
          response: error.response?.data
        }
      }

    } catch (error: any) {
      info.generalError = error.message
    }

    setDebugInfo(info)
    setLoading(false)
  }

  useEffect(() => {
    if (session) {
      runDebug()
    }
  }, [session])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Debug Page</h1>
          <p className="text-gray-600">Please sign in to run debug tests</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🔍 Debug Information</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>User Agent:</strong><br />
              <code className="text-xs bg-gray-100 p-1 rounded">{debugInfo.userAgent}</code>
            </div>
            <div>
              <strong>Screen Size:</strong><br />
              <code className="text-xs bg-gray-100 p-1 rounded">{debugInfo.screenSize}</code>
            </div>
            <div>
              <strong>API URL:</strong><br />
              <code className="text-xs bg-gray-100 p-1 rounded">{debugInfo.apiUrl || 'Not set'}</code>
            </div>
            <div>
              <strong>Hostname:</strong><br />
              <code className="text-xs bg-gray-100 p-1 rounded">{debugInfo.hostname}</code>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">API Tests</h2>
            <button
              onClick={runDebug}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Running...' : 'Run Tests'}
            </button>
          </div>
          
          <div className="space-y-4">
            {Object.entries(debugInfo.tests || {}).map(([key, test]: [string, any]) => (
              <div key={key} className="border rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold capitalize">{key}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    test.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {test.status}
                  </span>
                </div>
                {test.status === 'success' ? (
                  <div>
                    <p className="text-sm text-gray-600">Count: {test.count}</p>
                    {test.data && test.data.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer">View sample data</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto">
                          {JSON.stringify(test.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-red-600">Error: {test.error}</p>
                    {test.response && (
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer">View error details</summary>
                        <pre className="text-xs bg-red-50 p-2 rounded mt-2 overflow-auto">
                          {JSON.stringify(test.response, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Raw Debug Data</h2>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
