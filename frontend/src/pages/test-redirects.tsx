import { useEffect, useState } from 'react'
import Head from 'next/head'

export default function TestRedirects() {
  const [testResults, setTestResults] = useState<any[]>([])

  useEffect(() => {
    const testUrls = [
      '/api/auth/error',
      '/api/auth/signin',
      '/api/auth/signout',
      '/api/customers',
      '/api/test',
      '/nonexistent'
    ]

    const runTests = async () => {
      const results = []
      
      for (const url of testUrls) {
        try {
          const response = await fetch(url, { method: 'GET' })
          results.push({
            url,
            status: response.status,
            statusText: response.statusText,
            redirected: response.redirected,
            type: response.type
          })
        } catch (error: any) {
          results.push({
            url,
            error: error?.message || 'Unknown error',
            status: 'ERROR'
          })
        }
      }
      
      setTestResults(results)
    }

    runTests()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Head>
        <title>Redirect Test - Xeno CRM</title>
        <meta name="description" content="Test redirects for API endpoints" />
      </Head>
      
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Redirect Test Results</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">API Endpoint Tests</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500">Running tests...</p>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {result.url}
                    </code>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      result.status === 404 ? 'bg-red-100 text-red-800' :
                      result.status === 200 ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {result.status}
                    </span>
                  </div>
                  {result.statusText && (
                    <p className="text-sm text-gray-600 mt-2">
                      Status: {result.statusText}
                    </p>
                  )}
                  {result.redirected && (
                    <p className="text-sm text-blue-600 mt-1">
                      ✓ Redirected
                    </p>
                  )}
                  {result.error && (
                    <p className="text-sm text-red-600 mt-1">
                      Error: {result.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Expected Results:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <code>/api/auth/error</code> should return 404 (redirected to 404.html)</li>
            <li>• <code>/api/auth/*</code> should return 404 (redirected to 404.html)</li>
            <li>• <code>/api/*</code> should return 404 (redirected to 404.html)</li>
            <li>• <code>/nonexistent</code> should return 200 (redirected to index.html)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
