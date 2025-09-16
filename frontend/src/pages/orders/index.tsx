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
  customerId: string
  customerName: string
  totalAmount: number
  status: string
  createdAt: string
  items: Array<{
    productId: string
    productName: string
    quantity: number
    price: number
  }>
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
      
      // Handle nested data structure
      const ordersData = response.data?.data || response.data || []
      setOrders(Array.isArray(ordersData) ? ordersData : [])
      
      console.log('✅ Orders loaded:', ordersData.length)
    } catch (error: any) {
      console.error('❌ Error loading orders:', error)
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return
    }

    try {
      console.log('🗑️ Deleting order:', orderId)
      await orderApi.delete(orderId)
      
      // Remove from local state
      setOrders(orders.filter(o => o._id !== orderId))
      console.log('✅ Order deleted successfully')
    } catch (error: any) {
      console.error('❌ Error deleting order:', error)
      alert('Failed to delete order. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Orders</h1>
                  <p className="text-sm sm:text-base text-gray-600">Manage your customer orders</p>
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
                    <div className="block lg:hidden space-y-4">
                      {orders.map((order, index) => (
                        <div key={order._id || index} className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up" style={{animationDelay: `${index * 0.05}s`}}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center min-w-0 flex-1">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    #{order.orderId?.slice(-4) || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3 min-w-0 flex-1">
                                <div className="text-base font-medium text-gray-900 truncate">
                                  {order.orderId || 'N/A'}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  ID: {order._id?.slice(-8)}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <SmoothButton
                                onClick={() => router.push(`/orders/edit/${order._id}`)}
                                variant="secondary"
                                size="sm"
                                className="text-xs px-2 py-1"
                              >
                                Edit
                              </SmoothButton>
                              <SmoothButton
                                onClick={() => handleDeleteOrder(order._id)}
                                variant="danger"
                                size="sm"
                                className="text-xs px-2 py-1"
                              >
                                Delete
                              </SmoothButton>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Customer:</span>
                              <span className="text-sm text-gray-900 truncate">{order.customerName || 'Unknown Customer'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Amount:</span>
                              <span className="text-sm text-gray-900 font-medium">
                                ${(order.totalAmount || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Status:</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {order.status || 'Unknown'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Items:</span>
                              <span className="text-sm text-gray-900">
                                {order.items?.length || 0} items
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Date:</span>
                              <span className="text-sm text-gray-900">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
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
                              Order
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
                              Items
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
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
                                <div className="text-sm text-gray-500">{order.customerId}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  ${(order.totalAmount || 0).toLocaleString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                  {order.status || 'Unknown'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {order.items?.length || 0} items
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