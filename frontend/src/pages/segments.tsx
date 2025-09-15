import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { segmentApi } from '@/lib/api'

interface Segment {
  _id: string
  name: string
  description: string
  rules: any[]
  customerCount: number
  createdAt: string
  updatedAt: string
}

export default function Segments() {
  const router = useRouter()
  const [segments, setSegments] = useState<Segment[]>([])
  const [filteredSegments, setFilteredSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Simple authentication check
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('xeno-user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
          loadSegments()
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

  // Filter segments based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSegments(segments)
    } else {
      const filtered = segments.filter(segment => {
        const searchLower = searchTerm.toLowerCase()
        return (
          segment.name.toLowerCase().includes(searchLower) ||
          segment.description.toLowerCase().includes(searchLower)
        )
      })
      setFilteredSegments(filtered)
    }
  }, [segments, searchTerm])

  const loadSegments = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Loading segments from API...')
      const response = await segmentApi.getAll()
      const apiSegments = response.data.data || response.data // Handle both {data: [...]} and [...] formats
      
      setSegments(apiSegments)
      setFilteredSegments(apiSegments)
      console.log('✅ Real segments loaded from API:', apiSegments.length)
      
    } catch (error: any) {
      console.error('❌ Error loading segments from API:', error)
      setError('Failed to load segment data from database')
      setSegments([])
      setFilteredSegments([])
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('xeno-user')
    router.push('/')
  }

  const handleDelete = async (segmentId: string) => {
    if (!confirm('Are you sure you want to delete this segment?')) {
      return
    }

    try {
      await segmentApi.delete(segmentId)
      // Remove from local state
      setSegments(prev => prev.filter(segment => segment._id !== segmentId))
      setFilteredSegments(prev => prev.filter(segment => segment._id !== segmentId))
    } catch (error: any) {
      console.error('Error deleting segment:', error)
      setError('Failed to delete segment')
    }
  }

  // Show loading state during authentication check
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">X</span>
          </div>
          <p className="text-gray-600">Loading segments...</p>
        </div>
      </div>
    )
  }

  // Show sign in if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">X</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view segments.</p>
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
        <title>Xeno CRM - Segments</title>
        <meta name="description" content="Manage customer segments in Xeno CRM" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center px-6 py-4 border-b border-gray-700">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">X</span>
                </div>
                <div className="ml-3">
                  <span className="text-xl font-semibold text-white">Xeno CRM</span>
                  <p className="text-sm text-gray-400">Dashboard v2.1</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Navigation
                </div>
                <Link href="/" className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                  </svg>
                  Dashboard
                </Link>
                <Link href="/orders" className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Orders
                </Link>
                <Link href="/customers" className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Customers
                </Link>
                <Link href="/segments" className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Segments
                </Link>
                <Link href="/campaigns" className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Campaigns
                </Link>
                <Link href="/campaigns/history" className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Campaign History
                </Link>
              </div>
            </nav>

            {/* EXTERNAL Section */}
            <div className="mt-8">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">EXTERNAL</h3>
              <nav className="space-y-2">
                <a 
                  href="https://backend-production-05a7e.up.railway.app/api/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>API Documentation</span>
                  <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </nav>
            </div>
          </div>
          
          {/* User Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1 text-gray-400 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
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
                  <span>/segments</span>
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
                  <h1 className="text-3xl font-bold text-gray-900" style={{ fontSize: '1.875rem', margin: '0' }}>Customer Segments</h1>
                  <p className="mt-2 text-gray-600">Organize customers into targeted groups</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={loadSegments}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                  <Link
                    href="/segments/create"
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Create Segment
                  </Link>
                </div>
              </div>
            </div>

            {/* Segments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading && (
                <div className="col-span-full flex justify-center py-12">
                  <div className="text-gray-500">Loading segments...</div>
                </div>
              )}

              {!loading && filteredSegments.length === 0 && segments.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🎯</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No segments found</h3>
                  <p className="text-gray-500 mb-6">
                    Create your first customer segment to get started.
                  </p>
                  <Link
                    href="/segments/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Create Segment
                  </Link>
                </div>
              )}

              {!loading && filteredSegments.length === 0 && segments.length > 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No segments found</h3>
                  <p className="text-gray-500 mb-6">
                    No segments match your search criteria. Try adjusting your search terms.
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear search
                  </button>
                </div>
              )}

              {!loading && filteredSegments.length > 0 && (
                <>
                  {/* Search Bar */}
                  <div className="col-span-full mb-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search segments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Segment Cards */}
                  {filteredSegments.map((segment: Segment) => (
                    <div key={segment._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{segment.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{segment.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/segments/edit?id=${segment._id}`}
                            className="p-2 text-gray-400 hover:text-blue-600"
                            title="Edit segment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>
                          <button
                            onClick={() => handleDelete(segment._id)}
                            className="p-2 text-gray-400 hover:text-red-600"
                            title="Delete segment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-blue-600">{segment.customerCount}</div>
                          <div className="text-sm text-gray-500">customers</div>
                        </div>
                        <div className="text-xs text-gray-400">
                          Created {new Date(segment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
