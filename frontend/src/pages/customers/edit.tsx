import { useState, useEffect } from 'react'
import Head from 'next/head'
import { customerApi } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function EditCustomer() {
  const router = useRouter()
  const { id } = router.query
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    visits: '',
    tags: '',
    lastOrderAt: ''
  })

  // Simple authentication check
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('xeno-user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleSignOut = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('xeno-user')
    router.push('/')
  }

  const loadCustomer = async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    try {
      console.log('🔄 Loading customer with ID:', id)
      console.log('🔍 ID type:', typeof id)
      console.log('📏 ID length:', id?.length)
      
      // Validate ID format (MongoDB ObjectIds are 24 characters)
      if (typeof id === 'string' && id.length !== 24) {
        throw new Error(`Invalid customer ID format. Expected 24 characters, got ${id.length}. ID: "${id}"`)
      }
      
      const response = await customerApi.getById(id as string)
      console.log('✅ Customer API response:', response)
      
      const customer = response.data
      console.log('📋 Customer data:', customer)
      
      // Handle both array and object response formats
      const customerData = Array.isArray(customer) ? customer[0] : customer
      console.log('📋 Processed customer data:', customerData)
      
      // Format lastOrderAt for date input
      let formattedLastOrderAt = ''
      if (customerData.lastOrderAt) {
        try {
          const date = new Date(customerData.lastOrderAt)
          formattedLastOrderAt = date.toISOString().split('T')[0]
        } catch (e) {
          console.warn('⚠️ Error formatting lastOrderAt:', e)
        }
      }
      
      // Format tags for textarea (convert array to comma-separated string)
      let formattedTags = ''
      if (customerData.tags) {
        if (Array.isArray(customerData.tags)) {
          formattedTags = customerData.tags.join(', ')
        } else {
          formattedTags = customerData.tags
        }
      }
      
      setFormData({
        email: customerData.email || '',
        firstName: customerData.firstName || '',
        lastName: customerData.lastName || '',
        phone: customerData.phone || '',
        visits: customerData.visits?.toString() || '0',
        tags: formattedTags,
        lastOrderAt: formattedLastOrderAt
      })
      console.log('✅ Form data set successfully')
    } catch (error: any) {
      console.error('❌ Error loading customer:', error)
      console.error('❌ Error details:', error.response?.data)
      console.error('❌ Error status:', error.response?.status)
      console.error('❌ Error message:', error.message)
      
      if (error.message?.includes('Invalid customer ID format')) {
        setError(`Invalid customer ID: "${id}". Please go back to the customers list and try editing again.`)
      } else if (error.response?.status === 404) {
        setError(`Customer with ID "${id}" not found. Please check the customer ID and try again.`)
      } else if (error.response?.status === 500) {
        setError('Server error occurred while loading customer. Please try again later.')
      } else {
        setError(`Failed to load customer details: ${error.response?.data?.message || error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && id) {
      loadCustomer()
    }
  }, [isAuthenticated, id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    let numericValue = value
    
    if (value !== '' && value !== '0') {
      numericValue = value.replace(/^0+/, '') || '0'
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const customerData = {
        ...formData,
        visits: formData.visits ? parseInt(formData.visits) : 0,
        lastOrderAt: formData.lastOrderAt ? new Date(formData.lastOrderAt).toISOString() : undefined
      }

      await customerApi.update(id as string, customerData)
      setSuccess(true)
      
      setTimeout(() => {
        router.push('/customers')
      }, 2000)
    } catch (error: any) {
      console.error('Error updating customer:', error)
      setError(error.response?.data?.message || 'Failed to update customer')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-white font-bold text-xl">X</span>
          </div>
          <p className="text-gray-600">Loading customer details...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the customer information</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">X</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to edit customers.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Xeno CRM - Edit Customer</title>
        <meta name="description" content="Edit customer information in Xeno CRM" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
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
                <Link href="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
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
                <Link href="/customers" className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
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
              </div>
            </nav>

            {/* User Info */}
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
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
        <div className="pl-64">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link href="/customers" className="text-blue-600 hover:text-blue-800 mr-4">
                  ← Back to Customers
                </Link>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>/customers/edit/{id}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900" style={{ fontSize: '1.875rem', margin: '0' }}>Edit Customer</h1>
                <p className="mt-2 text-gray-600">Update customer information and details</p>
              </div>

              {success && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">
                        Customer updated successfully! Redirecting to customers list...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                      <div className="mt-3">
                        <Link
                          href="/customers"
                          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          ← Back to Customers List
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter first name"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter last name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label htmlFor="visits" className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Visits
                      </label>
                      <input
                        type="number"
                        id="visits"
                        name="visits"
                        value={formData.visits}
                        onChange={handleNumberChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter number of visits"
                      />
                    </div>

                    <div>
                      <label htmlFor="lastOrderAt" className="block text-sm font-medium text-gray-700 mb-2">
                        Last Order Date
                      </label>
                      <input
                        type="date"
                        id="lastOrderAt"
                        name="lastOrderAt"
                        value={formData.lastOrderAt}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <textarea
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter tags (comma-separated)"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Separate multiple tags with commas
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Link
                    href="/customers"
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Updating...' : 'Update Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}