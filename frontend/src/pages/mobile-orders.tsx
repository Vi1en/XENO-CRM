import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function MobileOrders() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_BASE_URL = 'https://backend-production-05a7e.up.railway.app/api/v1'

  useEffect(() => {
    if (session) {
      loadOrders()
    }
  }, [session])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('📱 Loading orders from:', API_BASE_URL)
      
      const response = await fetch(`${API_BASE_URL}/orders`)
      const data = await response.json()
      
      console.log('✅ Orders loaded:', data)
      
      if (data.success) {
        setOrders(data.data || [])
      } else {
        throw new Error(data.message || 'Failed to load orders')
      }
    } catch (err: any) {
      console.error('❌ Error loading orders:', err)
      setError(`Failed to load orders: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testAPI = async () => {
    try {
      console.log('🧪 Testing API connection...')
      const response = await fetch(`${API_BASE_URL}/orders`)
      const data = await response.json()
      console.log('🧪 API Test Result:', data)
      alert(`API Test: ${data.success ? 'SUCCESS' : 'FAILED'}\nOrders: ${data.data?.length || 0}`)
    } catch (err: any) {
      console.error('🧪 API Test Error:', err)
      alert(`API Test: FAILED\nError: ${err.message}`)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">X</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">X</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Xeno CRM</h1>
            <p className="text-gray-600">Sign in to view orders</p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <button
              onClick={() => signIn('google')}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Orders - Xeno CRM</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="mr-3 p-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Orders</h1>
                <p className="text-sm text-gray-600">{orders.length} total orders</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700">{error}</p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={loadOrders}
              className="text-sm text-red-600 underline"
            >
              Try again
            </button>
            <button
              onClick={testAPI}
              className="text-sm text-blue-600 underline"
            >
              Test API
            </button>
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">Orders will appear here when available.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any, index) => (
              <div key={order._id || index} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{order.orderId}</h3>
                  <span className="text-lg font-bold text-gray-900">${order.totalSpent}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Customer:</strong> {order.customerName}</p>
                  <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button
            onClick={loadOrders}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Orders'}
          </button>
          
          <button
            onClick={testAPI}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium"
          >
            Test API Connection
          </button>
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-2">Debug Info:</p>
          <p className="text-xs text-gray-500">API: {API_BASE_URL}</p>
          <p className="text-xs text-gray-500">Orders: {orders.length}</p>
          <p className="text-xs text-gray-500">Status: {loading ? 'Loading...' : 'Ready'}</p>
          <p className="text-xs text-gray-500">Error: {error || 'None'}</p>
        </div>
      </div>
    </div>
  )
}