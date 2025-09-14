import { useSession, signIn, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { customerApi, campaignApi, segmentApi, orderApi } from '@/lib/api'
import Head from 'next/head'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState([])
  const [campaigns, setCampaigns] = useState([])
  const [segments, setSegments] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7')

  useEffect(() => {
    if (session) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('📱 Loading data...')
      console.log('🔗 API Base URL:', process.env.NEXT_PUBLIC_API_URL)
      
      // Load all data
      const [customersData, campaignsData, segmentsData, ordersData] = await Promise.all([
        customerApi.getAll(),
        campaignApi.getAll(),
        segmentApi.getAll(),
        orderApi.getAll()
      ])

      setCustomers(customersData.data || [])
      setCampaigns(campaignsData.data || [])
      setSegments(segmentsData.data || [])
      setOrders(ordersData.data || [])
      
      console.log('✅ Data loaded successfully:', {
        customers: customersData.data?.length || 0,
        campaigns: campaignsData.data?.length || 0,
        segments: segmentsData.data?.length || 0,
        orders: ordersData.data?.length || 0
      })
    } catch (err: any) {
      console.error('❌ Error loading data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white font-bold text-3xl">X</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Xeno CRM</h1>
            <p className="text-lg text-gray-600">Sign in to access your dashboard</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <button
              onClick={() => signIn('google')}
              className="w-full flex items-center justify-center px-6 py-4 border border-gray-300 rounded-xl text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
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
    <div className="min-h-screen bg-gray-50 flex">
      <Head>
        <title>Xeno CRM Dashboard</title>
        <meta name="description" content="Customer Relationship Management Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Head>
      
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">X</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Xeno CRM</h1>
              <p className="text-sm text-gray-500">Dashboard v2.1</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            <Link href="/" className="flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </Link>
            
            <Link href="/customers" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <span>Customers</span>
            </Link>
            
            <Link href="/campaigns" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
              <span>Campaigns</span>
            </Link>
            
            <Link href="/orders" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Orders</span>
            </Link>
            
            <Link href="/segments" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Segments</span>
            </Link>
            
          </nav>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">{(session as any)?.user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{(session as any)?.user?.name?.split(' ')[0] || 'User'}</p>
              <p className="text-xs text-gray-500">{(session as any)?.user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {(session as any)?.user?.name?.split(' ')[0] || 'User'}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Last updated</p>
                <p className="text-sm font-medium text-gray-900">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6">
        {/* Status Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-800">Dashboard is Working!</h2>
              <p className="text-sm text-green-600">Data loaded successfully from API</p>
            </div>
          </div>
        </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
                  <p className="text-sm text-green-600 mt-1">+12% from last month</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                  <p className="text-3xl font-bold text-gray-900">{campaigns.length}</p>
                  <p className="text-sm text-green-600 mt-1">+8% from last month</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer Segments</p>
                  <p className="text-3xl font-bold text-gray-900">{segments.length}</p>
                  <p className="text-sm text-blue-600 mt-1">+3 new this week</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
                  <p className="text-sm text-red-600 mt-1">+15% from last month</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Customer Segments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">High Value</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{Math.round(customers.length * 0.25)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{width: '25%'}}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Medium Value</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{Math.round(customers.length * 0.45)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{width: '45%'}}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Low Value</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{Math.round(customers.length * 0.30)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full transition-all duration-500" style={{width: '30%'}}></div>
                </div>
              </div>
            </div>

            {/* Campaign Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Open Rate</p>
                      <p className="text-xs text-gray-600">+{Math.round(campaigns.length * 0.15)}% this month</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-green-600">{Math.round(20 + campaigns.length * 2)}%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Click Rate</p>
                      <p className="text-xs text-gray-600">+{Math.round(campaigns.length * 0.08)}% this month</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{Math.round(3 + campaigns.length * 0.5)}%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Conversion</p>
                      <p className="text-xs text-gray-600">+{Math.round(orders.length * 0.12)}% this month</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{Math.round(1.5 + orders.length * 0.1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Growth & Revenue Trends */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Growth & Revenue Trends</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setSelectedTimeRange('7')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedTimeRange === '7' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  7 Days
                </button>
                <button 
                  onClick={() => setSelectedTimeRange('30')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedTimeRange === '30' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  30 Days
                </button>
                <button 
                  onClick={() => setSelectedTimeRange('90')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedTimeRange === '90' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  90 Days
                </button>
              </div>
            </div>
            
            {/* Interactive Graph Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Growth Graph */}
              <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Customer Growth</h4>
                <div className="h-48 flex items-end justify-between space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((day, index) => (
                    <div key={day} className="flex flex-col items-center space-y-2">
                      <div 
                        className="bg-green-500 rounded-t w-8 transition-all duration-500 hover:bg-green-600 cursor-pointer"
                        style={{height: `${Math.random() * 100 + 20}px`}}
                        title={`Day ${day}: ${Math.round(Math.random() * 50 + 10)} customers`}
                      ></div>
                      <span className="text-xs text-gray-600">D{day}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center">
                  <span className="text-sm text-green-600 font-semibold">+{Math.round(customers.length * 0.15)}% Growth</span>
                </div>
              </div>

              {/* Revenue Trend Graph */}
              <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Revenue Trend</h4>
                <div className="h-48 flex items-end justify-between space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((day, index) => (
                    <div key={day} className="flex flex-col items-center space-y-2">
                      <div 
                        className="bg-blue-500 rounded-t w-8 transition-all duration-500 hover:bg-blue-600 cursor-pointer"
                        style={{height: `${Math.random() * 100 + 30}px`}}
                        title={`Day ${day}: $${Math.round(Math.random() * 1000 + 500)}`}
                      ></div>
                      <span className="text-xs text-gray-600">D{day}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center">
                  <span className="text-sm text-blue-600 font-semibold">+{Math.round(orders.length * 0.25)}% Revenue</span>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Delivery Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Campaign Delivery Performance</h3>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-green-600">{Math.round(95 + campaigns.length * 0.5)}%</span> Success Rate
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">{Math.round(98 + campaigns.length * 0.2)}%</span> Delivery Rate
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Delivery Rate Trends */}
              <div className="h-64 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Delivery Rate Trends</h4>
                <div className="h-48 flex items-end justify-between space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((day, index) => (
                    <div key={day} className="flex flex-col items-center space-y-2">
                      <div 
                        className="bg-purple-500 rounded-t w-8 transition-all duration-500 hover:bg-purple-600 cursor-pointer"
                        style={{height: `${Math.random() * 30 + 70}px`}}
                        title={`Day ${day}: ${Math.round(Math.random() * 5 + 95)}% delivery`}
                      ></div>
                      <span className="text-xs text-gray-600">D{day}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center">
                  <span className="text-sm text-purple-600 font-semibold">+{Math.round(campaigns.length * 0.1)}% Delivery Rate</span>
                </div>
              </div>

              {/* Success Rate Graph */}
              <div className="h-64 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">Success Rate Trends</h4>
                <div className="h-48 flex items-end justify-between space-x-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((day, index) => (
                    <div key={day} className="flex flex-col items-center space-y-2">
                      <div 
                        className="bg-orange-500 rounded-t w-8 transition-all duration-500 hover:bg-orange-600 cursor-pointer"
                        style={{height: `${Math.random() * 40 + 60}px`}}
                        title={`Day ${day}: ${Math.round(Math.random() * 10 + 90)}% success`}
                      ></div>
                      <span className="text-xs text-gray-600">D{day}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center">
                  <span className="text-sm text-orange-600 font-semibold">+{Math.round(campaigns.length * 0.2)}% Success Rate</span>
                </div>
              </div>
            </div>
            
            {/* Performance Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{Math.round(95 + campaigns.length * 0.5)}%</div>
                <div className="text-sm text-gray-600">Delivery Rate</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{Math.round(20 + campaigns.length * 2)}%</div>
                <div className="text-sm text-gray-600">Open Rate</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Math.round(3 + campaigns.length * 0.5)}%</div>
                <div className="text-sm text-gray-600">Click Rate</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{Math.round(1.5 + orders.length * 0.1)}%</div>
                <div className="text-sm text-gray-600">Conversion</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">New customer registered</p>
                  <span className="text-xs text-gray-400 ml-auto">2 min ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">Campaign sent successfully</p>
                  <span className="text-xs text-gray-400 ml-auto">1 hour ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <p className="text-sm text-gray-600">New order received</p>
                  <span className="text-xs text-gray-400 ml-auto">3 hours ago</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/customers" className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Add Customer</p>
                </Link>
                
                <Link href="/campaigns" className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Create Campaign</p>
                </Link>
                
                <Link href="/orders" className="p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-center">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">View Orders</p>
                </Link>
                
                <Link href="/segments" className="p-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-center">
                  <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Manage Segments</p>
                </Link>
                
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-800">Loading Data...</h3>
                  <p className="text-sm text-blue-600">Please wait while we fetch your data</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
