import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { customerApi, campaignApi, segmentApi, orderApi, aiApi } from '@/lib/api'
import Head from 'next/head'

export default function MobileDashboard() {
  const { data: session, status } = useSession()
  const [customers, setCustomers] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [segments, setSegments] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('📱 Mobile Dashboard: Loading data...')
      
      // Load all data in parallel
      const [customersRes, campaignsRes, segmentsRes, ordersRes] = await Promise.all([
        customerApi.getAll().catch(err => {
          console.error('❌ Customers error:', err)
          return { data: { data: [] } }
        }),
        campaignApi.getAll().catch(err => {
          console.error('❌ Campaigns error:', err)
          return { data: { data: [] } }
        }),
        segmentApi.getAll().catch(err => {
          console.error('❌ Segments error:', err)
          return { data: { data: [] } }
        }),
        orderApi.getAll().catch(err => {
          console.error('❌ Orders error:', err)
          return { data: { data: [] } }
        })
      ])

      setCustomers(customersRes.data.data || [])
      setCampaigns(campaignsRes.data.data || [])
      setSegments(segmentsRes.data.data || [])
      setOrders(ordersRes.data.data || [])
      
      console.log('✅ Mobile Dashboard: Data loaded successfully')
    } catch (error: any) {
      console.error('❌ Mobile Dashboard: Error loading data:', error)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const testAPI = async () => {
    try {
      console.log('🧪 Testing API connection...')
      const response = await fetch('https://backend-production-05a7e.up.railway.app/api/v1/orders')
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">X</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-3xl">X</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Xeno CRM</h1>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <button
              onClick={() => signIn('google')}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Mobile Dashboard - Xeno CRM</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {session.user?.name?.split(' ')[0] || 'User'}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="px-4 py-3">
          <div className="flex space-x-4">
            <button
              onClick={() => window.location.href = '/mobile-orders'}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Orders
            </button>
            <button
              onClick={() => window.location.href = '/customers'}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Customers
            </button>
            <button
              onClick={() => window.location.href = '/campaigns'}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Campaigns
            </button>
          </div>
        </div>
      </div>

      {/* Debug Panel */}
      <div className="bg-blue-50 border-b border-blue-200 p-3">
        <div className="text-xs text-blue-800 mb-2">
          <strong>📱 Debug:</strong> API: {process.env.NEXT_PUBLIC_API_URL || 'Default'} | 
          Data: {customers.length} customers, {campaigns.length} campaigns
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            onClick={testAPI}
            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
          >
            Test API
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="p-4 space-y-4">
        {/* Customers Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : customers.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-xs font-semibold text-green-600">Active</div>
            </div>
          </div>
        </div>

        {/* Campaigns Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : campaigns.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-xs font-semibold text-blue-600">Active</div>
            </div>
          </div>
        </div>

        {/* Segments Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-green-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Segments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : segments.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-xs font-semibold text-green-600">Active</div>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-orange-500 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? '...' : orders.length}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-xs font-semibold text-orange-600">Recent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Data */}
      {customers.length > 0 && (
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Customers</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {customers.slice(0, 3).map((customer: any, index) => (
              <div key={customer._id || index} className="p-3 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{customer.firstName} {customer.lastName}</p>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${customer.totalSpend || 0}</p>
                    <p className="text-xs text-gray-500">{customer.visits || 0} visits</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {orders.length > 0 && (
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Orders</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {orders.slice(0, 3).map((order: any, index) => (
              <div key={order._id || index} className="p-3 border-b border-gray-200 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderId}</p>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">${order.totalSpent}</p>
                    <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
