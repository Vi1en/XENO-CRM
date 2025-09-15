import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Head from 'next/head'
// Removed API import - using demo mode
import Link from 'next/link'
import { useRouter } from 'next/router'

interface Customer {
  _id: string
  externalId: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  totalSpend: number
  visits: number
  lastOrderAt?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export default function Customers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Mobile detection
    const checkMobile = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const userAgent = navigator.userAgent
      
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = width < 768 || height < 600
      const isMobileUserAgent = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      
      setIsMobile(isSmallScreen || isMobileUserAgent || (isTouch && (isMobileUserAgent)))
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    if (session) {
      loadCustomers()
    }
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [session])

  // Filter customers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCustomers(customers)
    } else {
      const filtered = customers.filter(customer => {
        const searchLower = searchTerm.toLowerCase()
        return (
          customer.firstName.toLowerCase().includes(searchLower) ||
          customer.lastName.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower) ||
          customer.externalId.toLowerCase().includes(searchLower) ||
          (customer.phone && customer.phone.toLowerCase().includes(searchLower)) ||
          customer.tags.some(tag => tag.toLowerCase().includes(searchLower))
        )
      })
      setFilteredCustomers(filtered)
    }
  }, [customers, searchTerm])

  const loadCustomers = async () => {
    setLoading(true)
    setError(null)
    console.log('Loading demo customers...')
    
    // Use demo data instead of API calls
    const demoCustomers = [
      { _id: '1', externalId: 'ext1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', totalSpend: 1500, visits: 5, tags: ['VIP'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { _id: '2', externalId: 'ext2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', totalSpend: 800, visits: 3, tags: ['Premium'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { _id: '3', externalId: 'ext3', firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com', totalSpend: 300, visits: 2, tags: ['Regular'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { _id: '4', externalId: 'ext4', firstName: 'Alice', lastName: 'Brown', email: 'alice@example.com', totalSpend: 1200, visits: 4, tags: ['VIP'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { _id: '5', externalId: 'ext5', firstName: 'Charlie', lastName: 'Wilson', email: 'charlie@example.com', totalSpend: 600, visits: 3, tags: ['Premium'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]
    
    setCustomers(demoCustomers)
    setFilteredCustomers(demoCustomers)
    console.log('Demo customers loaded:', demoCustomers.length)
    
    setLoading(false)
  }

  const handleEdit = (customer: Customer) => {
    // Navigate to edit page with customer data
    router.push({
      pathname: '/customers/edit',
      query: { id: customer._id }
    })
  }

  const handleDelete = async (customer: Customer) => {
    if (!confirm(`Are you sure you want to delete ${customer.firstName} ${customer.lastName}? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleteLoading(customer._id)
      console.log('Deleting customer (demo mode):', customer._id)
      
      // In demo mode, just remove from local state
      setCustomers(prev => prev.filter(c => c._id !== customer._id))
      setFilteredCustomers(prev => prev.filter(c => c._id !== customer._id))
      
      // Show success message (you could add a toast notification here)
      console.log('Customer deleted successfully (demo mode)')
    } catch (error) {
      console.error('Error deleting customer:', error)
      setError('Failed to delete customer')
    } finally {
      setDeleteLoading(null)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
          <p className="text-gray-600">You need to be signed in to view customers.</p>
        </div>
      </div>
    )
  }

  // Mobile interface
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Head>
          <title>Customers - Xeno CRM</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        
        {/* Mobile Header */}
        <div className="bg-white shadow-lg border-b border-gray-200">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => router.back()}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Customers</h1>
                  <p className="text-xs text-gray-500">{filteredCustomers.length} customers</p>
                  <p className="text-xs text-orange-600 font-medium">📊 Demo Mode</p>
                </div>
              </div>
              <Link
                href="/customers/create"
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Customer List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first customer</p>
                <Link
                  href="/customers/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Customer
                </Link>
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div key={customer._id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>${customer.totalSpend.toFixed(2)}</span>
                        <span>{customer.visits} visits</span>
                        <span>{customer.tags.length} tags</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/customers/edit?id=${customer._id}`}
                        className="p-2 text-gray-400 hover:text-blue-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(customer)}
                        disabled={deleteLoading === customer._id}
                        className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                      >
                        {deleteLoading === customer._id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Xeno CRM - Customers</title>
        <meta name="description" content="Manage your customers in Xeno CRM" />
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
        <div className="pl-64">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>/customers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
                  <p className="mt-2 text-gray-600">Manage your customer database and relationships</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={loadCustomers}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <Link
                    href="/customers/create"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Customer
                  </Link>
                </div>
              </div>
            </div>

            {/* Customer List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Customer List
                  </h2>
                  {searchTerm && (
                    <div className="text-sm text-gray-500">
                      {filteredCustomers.length} of {customers.length} customers
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-hidden">
                {loading && (
                  <div className="flex justify-center py-12">
                    <div className="text-gray-500">Loading customers...</div>
                  </div>
                )}

                {error && (
                  <div className="px-6 py-4 bg-red-50 border-l-4 border-red-400">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!loading && !error && filteredCustomers.length === 0 && customers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">👥</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                    <p className="text-gray-500 mb-6">
                      Get started by adding your first customer through the API.
                    </p>
                    <a
                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/docs/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      View API Documentation
                    </a>
                  </div>
                )}

                {!loading && !error && filteredCustomers.length === 0 && customers.length > 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                    <p className="text-gray-500 mb-6">
                      No customers match your search criteria. Try adjusting your search terms.
                    </p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Clear search
                    </button>
                  </div>
                )}

                {!loading && !error && filteredCustomers.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spend</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visits</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCustomers.map((customer: Customer) => (
                          <tr key={customer._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-700">
                                    {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                                  </span>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {customer.firstName} {customer.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">{customer.phone || 'No phone'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {customer.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {customer.totalSpend > 0 ? `$${customer.totalSpend.toLocaleString()}` : 'No purchases'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {customer.visits}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {customer.lastOrderAt ? new Date(customer.lastOrderAt).toLocaleDateString() : 'Never'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-1">
                                {customer.tags && customer.tags.length > 0 ? (
                                  customer.tags.slice(0, 2).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {tag}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-400">No tags</span>
                                )}
                                {customer.tags && customer.tags.length > 2 && (
                                  <span className="text-xs text-gray-400">+{customer.tags.length - 2} more</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => handleEdit(customer)}
                                className="text-blue-600 hover:text-blue-900 mr-4 transition-colors"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDelete(customer)}
                                disabled={deleteLoading === customer._id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {deleteLoading === customer._id ? 'Deleting...' : 'Delete'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}