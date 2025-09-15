import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { campaignApi } from '@/lib/api'

interface Campaign {
  _id: string
  name: string
  description?: string
  type: string
  status: string
  targetSegment: string
  audienceSize: number
  sentCount: number
  deliveredCount: number
  failedCount: number
  deliveryRate: number
  openRate: number
  clickRate: number
  createdAt: string
  completedAt?: string
}

export default function CampaignHistory() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Simple authentication check
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('xeno-user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
          loadCampaigns()
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

  // Filter campaigns based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCampaigns(campaigns)
    } else {
      const filtered = campaigns.filter(campaign => {
        const searchLower = searchTerm.toLowerCase()
        return (
          campaign.name.toLowerCase().includes(searchLower) ||
          campaign.type.toLowerCase().includes(searchLower) ||
          campaign.status.toLowerCase().includes(searchLower) ||
          campaign.targetSegment.toLowerCase().includes(searchLower)
        )
      })
      setFilteredCampaigns(filtered)
    }
  }, [campaigns, searchTerm])

  const loadCampaigns = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Loading campaign history from API...')
      const response = await campaignApi.getAll()
      const rawCampaigns = response.data.data || response.data
      
      // Map API data to our expected format using real MongoDB data
      const apiCampaigns = rawCampaigns.map((campaign: any) => {
        const stats = campaign.stats || {}
        const sent = stats.sent || 0
        const delivered = stats.delivered || 0
        const failed = stats.failed || 0
        const totalRecipients = stats.totalRecipients || 0
        // Calculate delivery rate: delivered / (delivered + failed) or delivered / totalRecipients
        const totalProcessed = delivered + failed
        const deliveryRate = totalProcessed > 0 ? Math.round((delivered / totalProcessed) * 100) : 0
        
        return {
          _id: campaign._id,
          name: campaign.name,
          description: campaign.description || 'Marketing campaign',
          type: 'Email', // Default type since backend doesn't store type
          status: campaign.status,
          targetSegment: 'All Customers', // Default since we don't have segment info in this endpoint
          audienceSize: totalRecipients,
          sentCount: sent,
          deliveredCount: delivered,
          failedCount: failed,
          deliveryRate: deliveryRate,
          openRate: 0, // Not tracked in current backend
          clickRate: 0, // Not tracked in current backend
          createdAt: campaign.createdAt,
          completedAt: campaign.completedAt
        }
      })
      
      setCampaigns(apiCampaigns)
      setFilteredCampaigns(apiCampaigns)
      console.log('✅ Real campaign history loaded from MongoDB:', apiCampaigns.length)
      
    } catch (error: any) {
      console.error('❌ Error loading campaign history from API:', error)
      setError('Failed to load campaign data from database')
      setCampaigns([])
      setFilteredCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'running': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
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
          <p className="text-gray-600">Loading campaign history...</p>
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
          <p className="text-gray-600 mb-6">You need to be signed in to view campaign history.</p>
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
        <title>Xeno CRM - Campaign History</title>
        <meta name="description" content="View campaign history in Xeno CRM" />
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

            <nav className="space-y-2">
              <Link href="/" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                <span>Dashboard</span>
              </Link>
              
              <Link href="/customers" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>Customers</span>
              </Link>
              
              <Link href="/campaigns" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                <span>Campaigns</span>
              </Link>
              
              <Link href="/campaigns/history" className="flex items-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Campaign History</span>
              </Link>
              
              <Link href="/orders" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Orders</span>
              </Link>
              
              <Link href="/segments" className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>Segments</span>
              </Link>
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
                  <span>/campaigns/history</span>
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
                  <h1 className="text-3xl font-bold text-gray-900" style={{ fontSize: '1.875rem', margin: '0' }}>Campaign History</h1>
                  <p className="mt-2 text-gray-600">View completed and historical marketing campaigns</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={loadCampaigns}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                  <option>All Statuses</option>
                  <option>Running</option>
                  <option>Draft</option>
                  <option>Completed</option>
                </select>
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium">
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Campaigns Grid */}
            <div className="space-y-4">
              {loading && (
                <div className="flex justify-center py-12">
                  <div className="text-gray-500">Loading campaign history...</div>
                </div>
              )}

              {!loading && filteredCampaigns.length === 0 && campaigns.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No campaign history found</h3>
                  <p className="text-gray-500 mb-6">
                    Campaign history will appear here as campaigns are completed.
                  </p>
                  <Link
                    href="/campaigns"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    View Active Campaigns
                  </Link>
                </div>
              )}

              {!loading && filteredCampaigns.length === 0 && campaigns.length > 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                  <p className="text-gray-500 mb-6">
                    No campaigns match your search criteria. Try adjusting your search terms.
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear search
                  </button>
                </div>
              )}

              {!loading && filteredCampaigns.length > 0 && (
                <div className="grid gap-4">
                  {filteredCampaigns.map((campaign: Campaign) => (
                    <div key={campaign._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                              {campaign.status ? campaign.status.toUpperCase() : 'UNKNOWN'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>
                          
                          {/* Metrics Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{campaign.audienceSize}</div>
                              <div className="text-xs text-gray-500">Audience Size</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">{campaign.sentCount}</div>
                              <div className="text-xs text-gray-500">Sent</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">{campaign.deliveredCount}</div>
                              <div className="text-xs text-gray-500">Delivered</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">{campaign.failedCount}</div>
                              <div className="text-xs text-gray-500">Failed</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">{campaign.deliveryRate}%</div>
                              <div className="text-xs text-gray-500">Delivery Rate</div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Created: {new Date(campaign.createdAt).toLocaleString()}</span>
                            <Link href={`/campaigns/${campaign._id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}