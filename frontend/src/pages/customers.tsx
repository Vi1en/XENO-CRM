import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { customerApi } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import PageTransition from '@/components/PageTransition'
import SkeletonLoader from '@/components/SkeletonLoader'
import SmoothButton from '@/components/SmoothButton'
import AuthNavigation from '@/components/AuthNavigation'

export default function Customers() {
  const router = useRouter()
  const { user, isLoading: authLoading, isAuthenticated, getAuthHeaders } = useAuth()
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('❌ Customers: User not authenticated, redirecting to login')
      router.replace('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Load customers when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ Customers: User authenticated, loading customers')
      loadCustomers()
    }
  }, [isAuthenticated, user])

  const loadCustomers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('📋 Loading customers...')
      const response = await customerApi.getAll()
      
      console.log('📋 Customers response:', response.data)
      
      // Handle nested data structure
      const customersData = response.data?.data || response.data || []
      setCustomers(Array.isArray(customersData) ? customersData : [])
      
      console.log('✅ Customers loaded:', customersData.length)
    } catch (error: any) {
      console.error('❌ Error loading customers:', error)
      setError('Failed to load customers. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) {
      return
    }

    try {
      console.log('🗑️ Deleting customer:', customerId)
      await customerApi.delete(customerId)
      
      // Remove from local state
      setCustomers(customers.filter(c => c._id !== customerId))
      console.log('✅ Customer deleted successfully')
    } catch (error: any) {
      console.error('❌ Error deleting customer:', error)
      alert('Failed to delete customer. Please try again.')
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
            <p className="text-gray-600 animate-pulse">Loading customers...</p>
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
        <title>Xeno CRM - Customers</title>
        <meta name="description" content="Manage your customers in Xeno CRM" />
      </Head>
      
      <div className="min-h-screen bg-gray-50">
        <AuthNavigation currentPath={router.pathname} />
        
        {/* Main Content */}
        <div className="ml-0 lg:ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
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
                  <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
                  <p className="text-gray-600">Manage your customer relationships</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <SmoothButton
                  onClick={loadCustomers}
                  disabled={loading}
                  loading={loading}
                  variant="primary"
                  size="md"
                >
                  Refresh
                </SmoothButton>
                <SmoothButton
                  onClick={() => router.push('/customers/create')}
                  variant="secondary"
                  size="md"
                >
                  Add Customer
                </SmoothButton>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
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
                    Customer List ({customers.length})
                  </h3>
                </div>
                
                {customers.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No customers</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first customer.</p>
                    <div className="mt-6">
                      <SmoothButton
                        onClick={() => router.push('/customers/create')}
                        variant="primary"
                        size="md"
                      >
                        Add Customer
                      </SmoothButton>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phone
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Spend
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Visits
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tags
                          </th>
                          <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {customers.map((customer, index) => (
                          <tr key={customer._id || index} className="hover:bg-gray-50 animate-fade-in-up" style={{animationDelay: `${index * 0.05}s`}}>
                            <td className="px-3 py-4">
                              <div className="flex items-center min-w-0">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                    <span className="text-xs font-medium text-white">
                                      {customer.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-3 min-w-0 flex-1">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {customer.firstName} {customer.lastName}
                                  </div>
                                  <div className="text-xs text-gray-500 truncate">
                                    ID: {customer.externalId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-4">
                              <div className="text-sm text-gray-900 max-w-[150px] truncate">{customer.email}</div>
                            </td>
                            <td className="px-3 py-4">
                              <div className="text-sm text-gray-900">{customer.phone || 'N/A'}</div>
                            </td>
                            <td className="px-3 py-4">
                              <div className="text-sm text-gray-900">
                                ${(customer.totalSpend || 0).toLocaleString()}
                              </div>
                            </td>
                            <td className="px-3 py-4">
                              <div className="text-sm text-gray-900">{customer.visits || 0}</div>
                            </td>
                            <td className="px-3 py-4">
                              <div className="flex flex-wrap gap-1 max-w-[120px]">
                                {customer.tags?.slice(0, 2).map((tag: string, tagIndex: number) => (
                                  <span
                                    key={tagIndex}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {customer.tags?.length > 2 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    +{customer.tags.length - 2}
                                  </span>
                                )}
                                {(!customer.tags || customer.tags.length === 0) && (
                                  <span className="text-xs text-gray-500">No tags</span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm font-medium">
                              <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                                <SmoothButton
                                  onClick={() => router.push(`/customers/${customer._id}`)}
                                  variant="secondary"
                                  size="sm"
                                >
                                  Edit
                                </SmoothButton>
                                <SmoothButton
                                  onClick={() => handleDeleteCustomer(customer._id)}
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
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}