import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function MobileDashboard() {
  const { data: session, status } = useSession()
  const [customers, setCustomers] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [segments, setSegments] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const API_BASE_URL = 'https://backend-production-05a7e.up.railway.app/api/v1'

  useEffect(() => {
    if (session) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('📱 Loading data from:', API_BASE_URL)
      
      // Load all data using direct fetch calls
      const [customersRes, campaignsRes, segmentsRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/customers`).then(res => res.json()),
        fetch(`${API_BASE_URL}/campaigns`).then(res => res.json()),
        fetch(`${API_BASE_URL}/segments`).then(res => res.json()),
        fetch(`${API_BASE_URL}/orders`).then(res => res.json())
      ])

      console.log('📊 API Responses:', {
        customers: customersRes,
        campaigns: campaignsRes,
        segments: segmentsRes,
        orders: ordersRes
      })

      setCustomers(customersRes.data || [])
      setCampaigns(campaignsRes.data || [])
      setSegments(segmentsRes.data || [])
      setOrders(ordersRes.data || [])
      
      console.log('✅ Data loaded successfully:', {
        customers: customersRes.data?.length || 0,
        campaigns: campaignsRes.data?.length || 0,
        segments: segmentsRes.data?.length || 0,
        orders: ordersRes.data?.length || 0
      })
    } catch (error: any) {
      console.error('❌ Error loading data:', error)
      setError(`Failed to load data: ${error.message}`)
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
            <p className="text-gray-600">Sign in to continue</p>
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
        <title>Xeno CRM</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Hi, {session.user?.name?.split(' ')[0] || 'User'}</p>
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
              onClick={loadData}
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

      {/* Stats */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600">Customers</p>
                <p className="text-lg font-bold text-gray-900">
                  {loading ? '...' : customers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600">Campaigns</p>
                <p className="text-lg font-bold text-gray-900">
                  {loading ? '...' : campaigns.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600">Segments</p>
                <p className="text-lg font-bold text-gray-900">
                  {loading ? '...' : segments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-600">Orders</p>
                <p className="text-lg font-bold text-gray-900">
                  {loading ? '...' : orders.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
          
          <button
            onClick={testAPI}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium"
          >
            Test API Connection
          </button>
          
          <button
            onClick={() => window.location.href = '/mobile-orders'}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium"
          >
            View Orders
          </button>
          
          <button
            onClick={() => window.location.href = '/customers'}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium"
          >
            View Customers
          </button>
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-2">Debug Info:</p>
          <p className="text-xs text-gray-500">API: {API_BASE_URL}</p>
          <p className="text-xs text-gray-500">Data: {customers.length} customers, {orders.length} orders</p>
          <p className="text-xs text-gray-500">Status: {loading ? 'Loading...' : 'Ready'}</p>
          <p className="text-xs text-gray-500">Error: {error || 'None'}</p>
        </div>
      </div>
    </div>
  )
}