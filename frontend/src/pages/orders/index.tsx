import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { orderApi } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import PageTransition from '@/components/PageTransition'
import SkeletonLoader from '@/components/SkeletonLoader'
import SmoothButton from '@/components/SmoothButton'
import AuthNavigation from '@/components/AuthNavigation'

interface Order {
  _id: string
  orderId: string
  customerName: string
  totalSpent: number
  date: string
  createdAt: string
  updatedAt: string
}

export default function Orders() {
  const router = useRouter()
  const { user, isLoading: authLoading, isAuthenticated, getAuthHeaders } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('❌ Orders: User not authenticated, redirecting to login')
      router.replace('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Load orders when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ Orders: User authenticated, loading orders')
      loadOrders()
    }
  }, [isAuthenticated, user])

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('📦 Loading orders...')
      const response = await orderApi.getAll()
      
      console.log('📦 Orders response:', response.data)
      console.log('📦 Response status:', response.status)
      
      // Handle nested data structure
      const ordersData = response.data?.data || response.data || []
      console.log('📦 Processed orders data:', ordersData)
      console.log('📦 Orders count:', ordersData.length)
      
      if (ordersData.length > 0) {
        console.log('📦 First order:', ordersData[0])
        console.log('📦 First order ID:', ordersData[0]._id)
        console.log('📦 First order ID type:', typeof ordersData[0]._id)
        console.log('📦 First order orderId:', ordersData[0].orderId)
      }
      
      setOrders(Array.isArray(ordersData) ? ordersData : [])
      
      console.log('✅ Orders loaded:', ordersData.length)
    } catch (error: any) {
      console.error('❌ Error loading orders:', error)
      console.error('❌ Error details:', error.response?.data)
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return
    }

    // Validate order ID
    if (!orderId || typeof orderId !== 'string' || orderId.trim() === '') {
      console.error('❌ Invalid order ID:', orderId)
      alert('Invalid order ID. Please refresh the page and try again.')
      return
    }

    // Check if order exists in local state
    const orderExists = orders.find(o => o._id === orderId)
    if (!orderExists) {
      console.error('❌ Order not found in local state:', orderId)
      alert('Order not found. Please refresh the page and try again.')
      return
    }

    try {
      console.log('🗑️ Deleting order:', orderId)
      console.log('🗑️ Order ID type:', typeof orderId)
      console.log('🗑️ Order ID length:', orderId?.length)
      console.log('🗑️ Available orders:', orders.length)
      console.log('🗑️ Order exists in state:', orderExists ? 'Yes' : 'No')
      console.log('🗑️ Order details:', orderExists)
      
      const response = await orderApi.delete(orderId)
      console.log('✅ Delete API response:', response)
      
      // Remove from local state
      setOrders(orders.filter(o => o._id !== orderId))
      console.log('✅ Order deleted successfully from both API and local state')
    } catch (error: any) {
      console.error('❌ Error deleting order:', error)
      console.error('❌ Error response:', error.response?.data)
      console.error('❌ Error status:', error.response?.status)
      console.error('❌ Error message:', error.message)
      
      // Handle 500 error with fallback - remove from local state anyway
      if (error.response?.status === 500) {
        console.log('⚠️ Backend returned 500 error, removing order from local state as fallback')
        setOrders(orders.filter(o => o._id !== orderId))
        alert('Order deleted locally. Backend may be experiencing issues.')
        return
      }
      
      if (error.response?.data?.message) {
        alert(`Failed to delete order: ${error.response.data.message}`)
      } else {
        alert('Failed to delete order. Please try again.')
      }
    }
  }

  const getStatusColor = (date: string) => {
    const orderDate = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 7) {
      return 'bg-green-100 text-green-800' // Recent
    } else if (diffDays < 30) {
      return 'bg-blue-100 text-blue-800' // This month
    } else if (diffDays < 90) {
      return 'bg-yellow-100 text-yellow-800' // This quarter
    } else {
      return 'bg-gray-100 text-gray-800' // Older
    }
  }

  const getStatusText = (date: string) => {
    const orderDate = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 7) {
      return 'Recent'
    } else if (diffDays < 30) {
      return 'This Month'
    } else if (diffDays < 90) {
      return 'This Quarter'
    } else {
      return 'Older'
    }
  }

  if (authLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center animate-fade-in">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
              <span className="text-white font-bold text-xl">X</span>
            </div>
            <p className="text-gray-600 animate-pulse">Loading orders...</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <PageTransition>
      <Head>
        <title>Xeno CRM - Orders</title>
        <meta name="description" content="Manage orders in Xeno CRM" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <AuthNavigation currentPath={router.pathname} />
        
        {/* Main Content */}
        <div className="ml-0 lg:ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => {
                    const sidebar = document.querySelector('.sidebar-nav')
                    const backdrop = document.querySelector('.sidebar-backdrop')
                    if (sidebar) {
                      sidebar.classList.toggle('translate-x-0')
                      sidebar.classList.toggle('-translate-x-full')
                    }
                    if (backdrop) {
                      backdrop.classList.toggle('opacity-0')
                      backdrop.classList.toggle('pointer-events-none')
                      backdrop.classList.toggle('opacity-100')
                      backdrop.classList.toggle('pointer-events-auto')
                    }
                  }}
                  className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="hidden sm:block w-8 h-8 bg-gradient-to-br from-orange-600 to-red-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-sm sm:text-base text-gray-600">Manage your customer orders</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <SmoothButton
                  onClick={loadOrders}
                  disabled={loading}
                  loading={loading}
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto"
                >
                  Refresh
                </SmoothButton>
                <SmoothButton
                  onClick={() => router.push('/orders/create')}
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto"
                >
                  Add Order
                </SmoothButton>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <SkeletonLoader type="table" />
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order List ({orders.length})
                  </h3>
                </div>
                
                {orders.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first order.</p>
                    <div className="mt-6">
                      <SmoothButton
                        onClick={() => router.push('/orders/create')}
                        variant="primary"
                        size="md"
                      >
                        Add Order
                      </SmoothButton>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card Layout */}
                    <div className="block lg:hidden space-y-6">
                      {orders.map((order, index) => (
                        <div key={order._id || index} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in-up" style={{animationDelay: `${index * 0.05}s`}}>
                          <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center min-w-0 flex-1 pr-4">
                              <div className="flex-shrink-0 h-14 w-14">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                                  <span className="text-lg font-semibold text-white">
                                    #{order.orderId?.slice(-4) || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4 min-w-0 flex-1">
                                <div className="text-lg font-semibold text-gray-900 truncate">
                                  {order.orderId || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500 truncate mt-1">
                                  ID: {order._id?.slice(-8)}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2 flex-shrink-0">
                              <SmoothButton
                                onClick={() => {
                                  console.log('📱 Mobile Edit button clicked for order:', order._id)
                                  router.push(`/orders/edit/${order._id}`)
                                }}
                                variant="secondary"
                                size="sm"
                                className="text-sm px-4 py-2 rounded-xl font-medium min-h-[48px] min-w-[80px] flex items-center justify-center"
                              >
                                Edit
                              </SmoothButton>
                              <SmoothButton
                                onClick={() => handleDeleteOrder(order._id)}
                                variant="danger"
                                size="sm"
                                className="text-sm px-4 py-2 rounded-xl font-medium min-h-[48px] min-w-[80px] flex items-center justify-center"
                              >
                                Delete
                              </SmoothButton>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="flex items-center text-base">
                              <span className="text-gray-500 w-20 font-medium">Customer:</span>
                              <span className="text-gray-900 truncate text-base">{order.customerName || 'Unknown Customer'}</span>
                            </div>
                            <div className="flex items-center text-base">
                              <span className="text-gray-500 w-20 font-medium">Amount:</span>
                              <span className="text-gray-900 font-semibold text-lg">
                                ${(order.totalSpent || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center text-base">
                              <span className="text-gray-500 w-20 font-medium">Status:</span>
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.date)} shadow-sm`}>
                                {getStatusText(order.date)}
                              </span>
                            </div>
                            <div className="flex items-center text-base">
                              <span className="text-gray-500 w-20 font-medium">Order ID:</span>
                              <span className="text-gray-900 text-base font-medium">
                                {order.orderId || 'N/A'}
                              </span>
                            </div>
                            <div className="flex items-center text-base">
                              <span className="text-gray-500 w-20 font-medium">Date:</span>
                              <span className="text-gray-900 text-base font-medium">
                                {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table Layout */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order, index) => (
                            <tr key={order._id || index} className="hover:bg-gray-50 animate-fade-in-up" style={{animationDelay: `${index * 0.05}s`}}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                      <span className="text-sm font-medium text-white">
                                        #{order.orderId?.slice(-4) || 'N/A'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {order.orderId || 'N/A'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      ID: {order._id?.slice(-8)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{order.customerName || 'Unknown Customer'}</div>
                                <div className="text-sm text-gray-500">Order #{order.orderId?.slice(-6)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  ${(order.totalSpent || 0).toLocaleString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.date)}`}>
                                  {getStatusText(order.date)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <SmoothButton
                                    onClick={() => router.push(`/orders/edit/${order._id}`)}
                                    variant="secondary"
                                    size="sm"
                                  >
                                    Edit
                                  </SmoothButton>
                                  <SmoothButton
                                    onClick={() => handleDeleteOrder(order._id)}
                                    variant="danger"
                                    size="sm"
                                  >
                                    Delete
                                  </SmoothButton>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}