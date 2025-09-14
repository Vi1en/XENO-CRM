import { useState, useEffect } from 'react'
import { customerApi, campaignApi, segmentApi, orderApi } from '@/lib/api'

export default function ApiTest() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testApis = async () => {
    setLoading(true)
    const testResults: any = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      tests: {}
    }

    // Test each API
    const apis = [
      { name: 'customers', fn: () => customerApi.getAll() },
      { name: 'campaigns', fn: () => campaignApi.getAll() },
      { name: 'segments', fn: () => segmentApi.getAll() },
      { name: 'orders', fn: () => orderApi.getAll() }
    ]

    for (const api of apis) {
      try {
        console.log(`🧪 Testing ${api.name} API...`)
        const response = await api.fn()
        testResults.tests[api.name] = {
          status: 'success',
          statusCode: response.status,
          dataLength: response.data.data?.length || 0,
          fullResponse: response.data
        }
        console.log(`✅ ${api.name} API success:`, response.data)
      } catch (error: any) {
        testResults.tests[api.name] = {
          status: 'error',
          error: error.message,
          statusCode: error.response?.status,
          response: error.response?.data,
          config: {
            baseURL: error.config?.baseURL,
            url: error.config?.url,
            method: error.config?.method
          }
        }
        console.error(`❌ ${api.name} API error:`, error)
      }
    }

    setResults(testResults)
    setLoading(false)
  }

  useEffect(() => {
    testApis()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🧪 API Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">API Test Results</h2>
            <button
              onClick={testApis}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Run Tests Again'}
            </button>
          </div>
          
          <div className="space-y-4">
            {Object.entries(results.tests || {}).map(([key, test]: [string, any]) => (
              <div key={key} className="border rounded p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold capitalize">{key}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    test.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {test.status} {test.statusCode && `(${test.statusCode})`}
                  </span>
                </div>
                {test.status === 'success' ? (
                  <div>
                    <p className="text-sm text-gray-600">Data count: {test.dataLength}</p>
                    <details className="mt-2">
                      <summary className="text-sm text-blue-600 cursor-pointer">View response</summary>
                      <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto max-h-40">
                        {JSON.stringify(test.fullResponse, null, 2)}
                      </pre>
                    </details>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-red-600">Error: {test.error}</p>
                    <p className="text-xs text-gray-500">Base URL: {test.config?.baseURL}</p>
                    <p className="text-xs text-gray-500">Full URL: {test.config?.baseURL}{test.config?.url}</p>
                    <details className="mt-2">
                      <summary className="text-sm text-blue-600 cursor-pointer">View error details</summary>
                      <pre className="text-xs bg-red-50 p-2 rounded mt-2 overflow-auto max-h-40">
                        {JSON.stringify(test, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>User Agent:</strong><br />
              <code className="text-xs bg-gray-100 p-1 rounded">{results.userAgent}</code>
            </div>
            <div>
              <strong>Screen Size:</strong><br />
              <code className="text-xs bg-gray-100 p-1 rounded">{results.screenSize}</code>
            </div>
            <div>
              <strong>API URL:</strong><br />
              <code className="text-xs bg-gray-100 p-1 rounded">{results.apiUrl || 'Not set'}</code>
            </div>
            <div>
              <strong>Hostname:</strong><br />
              <code className="text-xs bg-gray-100 p-1 rounded">{results.hostname}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
