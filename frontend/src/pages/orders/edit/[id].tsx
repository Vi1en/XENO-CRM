import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { orderApi } from '@/lib/api'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import AuthNavigation from '@/components/AuthNavigation'
import PageTransition from '@/components/PageTransition'
import SmoothButton from '@/components/SmoothButton'

interface OrderFormData {
  orderNumber: string
  customerName: string
  total: number
  status: string
  items: string
}

interface Order {
  _id: string
  orderNumber?: string
  orderId?: string
  customerId: string
  customerName: string
  total?: number
  totalSpent?: number
  status: string
  createdAt: string
  items: any[]
}

export default function EditOrder() {
  const router = useRouter()
  const { id } = router.query
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<OrderFormData>()

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('🔐 Order Edit: User not authenticated, redirecting to login')
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Load order data
  useEffect(() => {
    if (isAuthenticated && id) {
      loadOrder()
    }
  }, [isAuthenticated, id])

  const loadOrder = async () => {
    if (!id) return

    setLoading(true)
    setError(null)

    try {
      console.log('🔄 Loading order with ID:', id)
      
      const response = await orderApi.getById(id as string)
      console.log('✅ Order API response:', response)
      
      // Extract order data from nested API response
      let orderData: Order
      if (response.data && response.data.success && response.data.data) {
        orderData = response.data.data
      } else if (response.data) {
        orderData = response.data
      } else {
        throw new Error('Invalid response format')
      }

      console.log('📋 Order data loaded:', orderData)
      setOrder(orderData)

      // Format data for form
      const formattedData: OrderFormData = {
        orderNumber: orderData.orderNumber || orderData.orderId || '',
        customerName: orderData.customerName || '',
        total: orderData.total || orderData.totalSpent || 0,
        status: orderData.status || 'completed',
        items: orderData.items ? JSON.stringify(orderData.items, null, 2) : ''
      }

      console.log('📝 Formatted data for form:', formattedData)
      
      // Reset form with order data
      reset(formattedData)
      
    } catch (error: any) {
      console.error('❌ Error loading order:', error)
      setError(`Failed to load order: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: OrderFormData) => {
    if (!id) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log('💾 Updating order with data:', data)
      
      // Format data for API
      const updateData = {
        orderNumber: data.orderNumber,
        customerName: data.customerName,
        total: Number(data.total),
        status: data.status,
        items: data.items ? JSON.parse(data.items) : []
      }

      console.log('📤 Sending update data:', updateData)
      
      await orderApi.update(id as string, updateData)
      
      setSuccess(true)
      console.log('✅ Order updated successfully')
      
      // Redirect to orders list after 2 seconds
      setTimeout(() => {
        router.push('/orders')
      }, 2000)

    } catch (error: any) {
      console.error('❌ Error updating order:', error)
      setError(`Failed to update order: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }


  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order data...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to edit orders.</p>
          <SmoothButton onClick={() => router.push('/')} variant="primary">
            Go to Dashboard
          </SmoothButton>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <Head>
        <title>Edit Order - Xeno CRM</title>
        <meta name="description" content="Edit order information" />
      </Head>

      <div className="min-h-screen bg-gray-100">
        <AuthNavigation currentPath={router.pathname} />

        {/* Main Content */}
        <div className="ml-0 lg:ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
          {/* Mobile Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => {
                    const sidebar = document.querySelector('.sidebar-nav')
                    const backdrop = document.querySelector('.sidebar-backdrop')
                    if (sidebar) {
                      sidebar.classList.toggle('-translate-x-full')
                      sidebar.classList.toggle('translate-x-0')
                    }
                    if (backdrop) {
                      backdrop.classList.toggle('opacity-0')
                      backdrop.classList.toggle('opacity-100')
                      backdrop.classList.toggle('pointer-events-none')
                      backdrop.classList.toggle('pointer-events-auto')
                    }
                  }}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  aria-label="Open sidebar"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <div className="flex items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>/orders/edit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Link 
                    href="/orders" 
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Orders
                  </Link>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Order</h1>
                <p className="mt-2 text-gray-600">Update order information and details</p>
              </div>

              {/* Success Message */}
              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Order updated successfully!</h3>
                      <p className="mt-1 text-sm text-green-700">Redirecting to orders list...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="bg-white shadow-sm rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Order Information</h3>
                </div>

                <div className="px-6 py-4 space-y-6">
                  {/* Order Number */}
                  <div>
                    <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Order Number *
                    </label>
                    <input
                      type="text"
                      id="orderNumber"
                      {...register('orderNumber', { required: 'Order number is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter order number"
                    />
                    {errors.orderNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.orderNumber.message}</p>
                    )}
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      id="customerName"
                      {...register('customerName', { required: 'Customer name is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter customer name"
                    />
                    {errors.customerName && (
                      <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
                    )}
                  </div>

                  {/* Total */}
                  <div>
                    <label htmlFor="total" className="block text-sm font-medium text-gray-700 mb-1">
                      Total Amount *
                    </label>
                    <input
                      type="number"
                      id="total"
                      step="0.01"
                      {...register('total', { 
                        required: 'Total amount is required',
                        min: { value: 0, message: 'Total must be 0 or greater' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter total amount"
                    />
                    {errors.total && (
                      <p className="mt-1 text-sm text-red-600">{errors.total.message}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      id="status"
                      {...register('status', { required: 'Status is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                    )}
                  </div>

                  {/* Items */}
                  <div>
                    <label htmlFor="items" className="block text-sm font-medium text-gray-700 mb-1">
                      Items (JSON)
                    </label>
                    <textarea
                      id="items"
                      rows={6}
                      {...register('items')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder='[{"name": "Product 1", "quantity": 1, "price": 10.00}]'
                    />
                    <p className="mt-1 text-sm text-gray-500">Enter items as JSON array</p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                  <Link href="/orders">
                    <SmoothButton type="button" variant="secondary">
                      Cancel
                    </SmoothButton>
                  </Link>
                  <SmoothButton 
                    type="submit" 
                    variant="primary"
                    loading={isSubmitting || loading}
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? 'Updating...' : 'Update Order'}
                  </SmoothButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
