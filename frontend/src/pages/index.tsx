import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { customerApi, campaignApi, segmentApi, orderApi, aiApi } from '@/lib/api'
import Head from 'next/head'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [segments, setSegments] = useState([])
  const [orders, setOrders] = useState([])
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useEffect(() => {
    if (session) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📱 Loading data for mobile device...')
      console.log('🔗 API Base URL:', process.env.NEXT_PUBLIC_API_URL)
      console.log('🌍 Current hostname:', window.location.hostname)
      
      // Try to load data with individual error handling
      const loadCustomersData = async () => {
        try {
          console.log('🔄 Loading customers...')
          const response = await customerApi.getAll()
          console.log('✅ Customers loaded:', response.data.data?.length || 0)
          console.log('📊 Customers response:', response.data)
          return response.data.data || []
        } catch (error: any) {
          console.error('❌ Customers error:', error)
          console.error('❌ Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            config: error.config
          })
          return []
        }
      }
      
      const loadCampaignsData = async () => {
        try {
          const response = await campaignApi.getAll()
          console.log('✅ Campaigns loaded:', response.data.data?.length || 0)
          return response.data.data || []
        } catch (error: any) {
          console.error('❌ Campaigns error:', error)
          return []
        }
      }
      
      const loadSegmentsData = async () => {
        try {
          const response = await segmentApi.getAll()
          console.log('✅ Segments loaded:', response.data.data?.length || 0)
          return response.data.data || []
        } catch (error: any) {
          console.error('❌ Segments error:', error)
          return []
        }
      }
      
      const loadOrdersData = async () => {
        try {
          const response = await orderApi.getAll()
          console.log('✅ Orders loaded:', response.data.data?.length || 0)
          return response.data.data || []
        } catch (error: any) {
          console.error('❌ Orders error:', error)
          return []
        }
      }
      
      const loadAnalyticsData = async () => {
        try {
          const response = await aiApi.getAnalytics()
          console.log('✅ Analytics loaded:', !!response.data)
          return response.data.data || null
        } catch (error: any) {
          console.error('❌ Analytics error:', error)
          return null
        }
      }
      
      // Load all data in parallel
      const [customersData, campaignsData, segmentsData, ordersData, analyticsData] = await Promise.all([
        loadCustomersData(),
        loadCampaignsData(),
        loadSegmentsData(),
        loadOrdersData(),
        loadAnalyticsData()
      ])
      
      console.log('📊 Final data loaded:', {
        customers: customersData.length,
        campaigns: campaignsData.length,
        segments: segmentsData.length,
        orders: ordersData.length,
        analytics: !!analyticsData
      })
      
      setCustomers(customersData)
      setCampaigns(campaignsData)
      setSegments(segmentsData)
      setOrders(ordersData)
      setAnalytics(analyticsData)
    } catch (error: any) {
      console.error('❌ Critical error loading data:', error)
      setError(error.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking mobile
  if (typeof window === 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">X</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo and Header */}
          <div className="text-center mb-6 lg:mb-8">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 lg:mb-6 shadow-lg">
              <span className="text-white font-bold text-2xl lg:text-3xl">X</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Welcome to Xeno CRM</h1>
            <p className="text-base lg:text-lg text-gray-600">Sign in to access your customer relationship management dashboard</p>
          </div>

          {/* Sign In Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 lg:p-8 border border-gray-100">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">Get Started</h2>
                <p className="text-sm lg:text-base text-gray-600">Choose your preferred sign-in method</p>
              </div>

              {/* Google Sign In Button */}
              <button
                onClick={() => signIn('google')}
                className="group relative w-full flex items-center justify-center px-4 lg:px-6 py-3 lg:py-4 border border-gray-300 rounded-xl text-sm lg:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
                <svg className="w-4 h-4 lg:w-5 lg:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Secure authentication</span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 lg:space-y-3">
                <div className="flex items-center text-xs lg:text-sm text-gray-600">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-500 mr-2 lg:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Secure OAuth 2.0 authentication
                </div>
                <div className="flex items-center text-xs lg:text-sm text-gray-600">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-500 mr-2 lg:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  AI-powered customer insights
                </div>
                <div className="flex items-center text-xs lg:text-sm text-gray-600">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-green-500 mr-2 lg:mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Advanced campaign management
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6 lg:mt-8">
            <p className="text-xs lg:text-sm text-gray-500">
              By signing in, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show mobile interface directly
  if (isMobile && session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Head>
          <title>Xeno CRM - Mobile</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        
        {/* Mobile Header */}
        <div className="bg-white shadow-lg border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">X</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Xeno CRM</h1>
                  <p className="text-xs text-gray-500">Welcome back, {session.user?.name?.split(' ')[0] || 'User'}</p>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 lg:p-8 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Total</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{customers.length}</div>
              <div className="text-sm text-gray-600">Customers</div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Active</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{campaigns.length}</div>
              <div className="text-sm text-gray-600">Campaigns</div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Groups</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{segments.length}</div>
              <div className="text-sm text-gray-600">Segments</div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Orders</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
              <div className="text-sm text-gray-600">Orders</div>
            </div>
          </div>


          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link href="/customers/create" className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Add Customer</span>
              </Link>
              
              <Link href="/campaigns/create" className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">New Campaign</span>
              </Link>
              
              <Link href="/segments/create" className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors">
                <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Create Segment</span>
              </Link>
              
              <Link href="/orders" className="flex items-center space-x-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">View Orders</span>
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh Data</span>
                </>
              )}
            </button>
            
            <button
              onClick={async () => {
                try {
                  const response = await fetch('https://backend-production-05a7e.up.railway.app/api/v1/orders')
                  const data = await response.json()
                  alert(`API Test: ${response.ok ? 'SUCCESS' : 'FAILED'}\nOrders: ${data.data?.length || 0}`)
                } catch (err: any) {
                  alert(`API Test: FAILED\nError: ${err.message}`)
                }
              }}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-2xl font-medium flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Test API Connection</span>
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-800">Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Dashboard - Xeno CRM</title>
        <meta name="description" content="Xeno CRM Dashboard - Customer Relationship Management System" />
      </Head>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">X</span>
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">Xeno CRM</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Navigation
              </div>
              <Link href="/" className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                Dashboard
              </Link>
              <Link href="/orders" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Orders
              </Link>
              <Link href="/customers" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                Customers
              </Link>
              <Link href="/segments" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Segments
              </Link>
              <Link href="/campaigns" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Campaigns
              </Link>
              <Link href="/campaigns/history" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Campaign History
              </Link>
            </div>

            <div className="pt-6">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                External
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/docs/`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                API Documentation
                <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </nav>

          {/* User Info */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">
                  {session.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-xs text-gray-500">{session.user?.email}</p>
              </div>
              <button
                onClick={() => signOut()}
                className="ml-auto p-1 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">X</span>
              </div>
              <span className="ml-2 text-xl font-semibold text-gray-900">Xeno CRM</span>
            </div>
            <div className="w-8"></div>
          </div>
        </div>

        {/* Top Bar */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
          <div className="px-4 lg:px-6 py-4 lg:py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-blue-100 mt-1 text-sm lg:text-base">Welcome back, {session.user?.name?.split(' ')[0] || 'User'}</p>
              </div>
              <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right text-white">
                <div className="text-sm text-blue-100">Last updated</div>
                <div className="text-sm font-medium">{new Date().toLocaleDateString()}</div>
                <button
                  onClick={() => {
                    console.log('📱 Manual mobile mode triggered from desktop')
                    setIsMobile(true)
                  }}
                  className="mt-2 px-3 py-1 bg-white bg-opacity-20 text-white text-xs rounded hover:bg-opacity-30"
                >
                  📱 Mobile View
                </button>
              </div>
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-6">
          {/* Mobile Debug Info */}
          {typeof window !== 'undefined' && window.innerWidth < 768 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-xs text-blue-800 mb-2">
                <strong>📱 Mobile Debug:</strong> Screen: {window.innerWidth}x{window.innerHeight} | 
                API: {process.env.NEXT_PUBLIC_API_URL || 'Default'} | 
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
                  onClick={() => {
                    console.log('🧪 Testing API connection...')
                    fetch('https://backend-production-05a7e.up.railway.app/api/v1/orders')
                      .then(res => res.json())
                      .then(data => {
                        console.log('🧪 API Test Result:', data)
                        alert(`API Test: ${data.success ? 'SUCCESS' : 'FAILED'}\nOrders: ${data.data?.length || 0}`)
                      })
                      .catch(err => {
                        console.error('🧪 API Test Error:', err)
                        alert(`API Test: FAILED\nError: ${err.message}`)
                      })
                  }}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                >
                  Test API
                </button>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8 -mt-2 lg:-mt-4">
            {/* Customers Card */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 lg:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 lg:ml-4">
                      <p className="text-xs lg:text-sm font-medium text-gray-600">Total Customers</p>
                      <p className="text-xl lg:text-2xl font-bold text-gray-900">
                        {loading ? (
                          <div className="animate-pulse bg-gray-200 h-6 lg:h-8 w-12 lg:w-16 rounded"></div>
                        ) : (
                          customers.length
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-gray-500">Active</div>
                    <div className="text-xs font-semibold text-green-600">+12%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Segments Card */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 lg:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-3 lg:ml-4">
                      <p className="text-xs lg:text-sm font-medium text-gray-600">Segments</p>
                      <p className="text-xl lg:text-2xl font-bold text-gray-900">
                        {loading ? (
                          <div className="animate-pulse bg-gray-200 h-6 lg:h-8 w-12 lg:w-16 rounded"></div>
                        ) : (
                          segments.length
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-gray-500">Targeted</div>
                    <div className="text-xs font-semibold text-blue-600">+8%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaigns Card */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 lg:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3 lg:ml-4">
                      <p className="text-xs lg:text-sm font-medium text-gray-600">Campaigns</p>
                      <p className="text-xl lg:text-2xl font-bold text-gray-900">
                        {loading ? (
                          <div className="animate-pulse bg-gray-200 h-6 lg:h-8 w-12 lg:w-16 rounded"></div>
                        ) : (
                          campaigns.length
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-gray-500">Running</div>
                    <div className="text-xs font-semibold text-purple-600">+5%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Orders Card */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 lg:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                      <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-3 lg:ml-4">
                      <p className="text-xs lg:text-sm font-medium text-gray-600">Orders</p>
                      <p className="text-xl lg:text-2xl font-bold text-gray-900">
                        {loading ? (
                          <div className="animate-pulse bg-gray-200 h-6 lg:h-8 w-12 lg:w-16 rounded"></div>
                        ) : (
                          orders.length
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-gray-500">This Month</div>
                    <div className="text-xs font-semibold text-orange-600">+15%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights */}
          {analytics && analytics.insights && analytics.insights.length > 0 && (
            <div className="mb-6 lg:mb-8">
              <div className="flex items-center mb-4 lg:mb-6">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-3">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">AI Insights</h3>
                <div className="ml-auto hidden sm:block">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Powered by AI
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {analytics.insights.map((insight: any, index: number) => (
                  <div key={index} className={`group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    insight.type === 'positive' ? 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200' :
                    insight.type === 'warning' ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200' :
                    insight.type === 'negative' ? 'bg-gradient-to-br from-red-50 to-red-100 border border-red-200' :
                    'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
                  }`}>
                    <div className="p-6">
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 p-3 rounded-xl shadow-lg ${
                          insight.type === 'positive' ? 'bg-green-500' :
                          insight.type === 'warning' ? 'bg-yellow-500' :
                          insight.type === 'negative' ? 'bg-red-500' :
                          'bg-blue-500'
                        }`}>
                          {insight.type === 'positive' && (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {insight.type === 'warning' && (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          )}
                          {insight.type === 'negative' && (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          {insight.type === 'neutral' && (
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h4>
                          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{insight.description}</p>
                          {insight.value && (
                            <div className="flex items-center justify-between">
                              <p className="text-2xl font-bold text-gray-900">{insight.value}</p>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                insight.type === 'positive' ? 'bg-green-200 text-green-800' :
                                insight.type === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                                insight.type === 'negative' ? 'bg-red-200 text-red-800' :
                                'bg-blue-200 text-blue-800'
                              }`}>
                                {insight.type === 'positive' ? 'Good' :
                                 insight.type === 'warning' ? 'Warning' :
                                 insight.type === 'negative' ? 'Attention' : 'Info'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Charts */}
          {analytics && (
            <div className="mb-6 lg:mb-8">
              <div className="flex items-center mb-4 lg:mb-6">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg mr-3">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900">Analytics Overview</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Customer Segments Chart */}
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="p-4 lg:p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base lg:text-lg font-semibold text-gray-900">Customer Segments</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs lg:text-sm text-gray-600">Distribution</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 lg:p-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={analytics.customerAnalytics?.topCustomerSegments || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(analytics.customerAnalytics?.topCustomerSegments || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Campaign Performance Chart */}
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">Campaign Performance</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Performance</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.campaignAnalytics?.campaignPerformance || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                        <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Revenue and Growth Trends */}
          {analytics && (
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Growth & Revenue Trends</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Growth Trend */}
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">Customer Growth</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Growth</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analytics.customerAnalytics?.customerGrowthTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                        <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Revenue Trend */}
                <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">Revenue Trend</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Revenue</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analytics.orderAnalytics?.revenueTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          formatter={(value: any) => [`$${value}`, 'Revenue']}
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e5e7eb', 
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }} 
                        />
                        <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Rate Trends */}
          {analytics && analytics.campaignAnalytics?.deliveryTrends && (
            <div className="mb-8">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Campaign Delivery Performance</h3>
              </div>
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">Delivery Rate Trends</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Success Rate</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.campaignAnalytics.deliveryTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: any) => [`${value}%`, 'Delivery Rate']}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb', 
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }} 
                      />
                      <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={3} dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}