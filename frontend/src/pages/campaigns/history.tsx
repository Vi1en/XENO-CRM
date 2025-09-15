import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { campaignApi } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import PageTransition from '@/components/PageTransition'
import SkeletonLoader from '@/components/SkeletonLoader'
import SmoothButton from '@/components/SmoothButton'
import AuthNavigation from '@/components/AuthNavigation'

interface Campaign {
  _id: string
  name: string
  description?: string
  type?: string
  status: string
  targetSegment?: string
  audienceSize?: number
  sentCount?: number
  deliveredCount?: number
  failedCount?: number
  deliveryRate?: number
  openRate?: number
  clickRate?: number
  createdAt: string
  updatedAt?: string
  scheduledAt?: string
  completedAt?: string
  stats?: {
    totalRecipients: number
    sent: number
    failed: number
    delivered: number
    bounced: number
  }
}

export default function CampaignHistory() {
  const router = useRouter()
  const { user, isLoading: authLoading, isAuthenticated, getAuthHeaders } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('❌ Campaign History: User not authenticated, redirecting to login')
      router.replace('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Load campaigns when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ Campaign History: User authenticated, loading campaigns')
      loadCampaigns()
    }
  }, [isAuthenticated, user])

  const loadCampaigns = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('📧 Loading campaigns...')
      const response = await campaignApi.getAll()
      
      console.log('📧 Campaigns response:', response)
      console.log('📧 Response data:', response.data)
      console.log('📧 Response data type:', typeof response.data)
      console.log('📧 Response data keys:', Object.keys(response.data || {}))
      
      // Handle nested data structure
      let campaignsData
      if (response.data && response.data.success && response.data.data) {
        console.log('🔍 Found nested structure: response.data.data')
        campaignsData = response.data.data
      } else if (response.data && Array.isArray(response.data)) {
        console.log('🔍 Found direct array: response.data')
        campaignsData = response.data
      } else {
        console.log('🔍 Using fallback structure')
        campaignsData = response.data?.data || response.data || []
      }
      
      console.log('📧 Final campaigns data:', campaignsData)
      console.log('📧 Campaigns data length:', campaignsData?.length || 0)
      
      if (campaignsData && campaignsData.length > 0) {
        console.log('📧 First campaign sample:', campaignsData[0])
        console.log('📧 First campaign keys:', Object.keys(campaignsData[0] || {}))
      }
      
      setCampaigns(Array.isArray(campaignsData) ? campaignsData : [])
      
      console.log('✅ Campaigns loaded:', campaignsData?.length || 0)
    } catch (error: any) {
      console.error('❌ Error loading campaigns:', error)
      console.error('❌ Error details:', error.response?.data)
      setError('Failed to load campaigns. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return '0'
    return num.toLocaleString()
  }

  // Filter campaigns based on search and status
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status?.toLowerCase() === statusFilter.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  if (authLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center animate-fade-in">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
              <span className="text-white font-bold text-xl">X</span>
            </div>
            <p className="text-gray-600 animate-pulse">Loading campaign history...</p>
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
        <title>Xeno CRM - Campaign History</title>
        <meta name="description" content="View campaign history in Xeno CRM" />
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
                  <h1 className="text-2xl font-bold text-gray-900">Campaign History</h1>
                  <p className="text-gray-600">View all your past and current campaigns</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <SmoothButton
                  onClick={loadCampaigns}
                  disabled={loading}
                  loading={loading}
                  variant="primary"
                  size="md"
                >
                  Refresh
                </SmoothButton>
                <SmoothButton
                  onClick={() => router.push('/campaigns')}
                  variant="secondary"
                  size="md"
                >
                  View Active Campaigns
                </SmoothButton>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {/* Search and Filter Controls */}
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="sm:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="running">Running</option>
                    <option value="completed">Completed</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="draft">Draft</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <SmoothButton
                    onClick={clearFilters}
                    variant="secondary"
                    size="md"
                    disabled={searchTerm === '' && statusFilter === 'all'}
                  >
                    Clear Filters
                  </SmoothButton>
                </div>
              </div>
            </div>

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
                    Campaign History ({filteredCampaigns.length} of {campaigns.length})
                  </h3>
                </div>
                
                {filteredCampaigns.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No campaigns found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first campaign.</p>
                    <div className="mt-6">
                      <SmoothButton
                        onClick={() => router.push('/campaigns')}
                        variant="primary"
                        size="md"
                      >
                        View Campaigns
                      </SmoothButton>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 p-6">
                    {filteredCampaigns.map((campaign, index) => (
                      <div key={campaign._id || index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 animate-fade-in-up" style={{animationDelay: `${index * 0.1}s`}}>
                        {/* Campaign Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {campaign.name || 'Untitled Campaign'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                              {campaign.description || 'No description available'}
                            </p>
                            <div className="flex items-center space-x-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                {campaign.status ? campaign.status.toUpperCase() : 'UNKNOWN'}
                              </span>
                              <span className="text-sm text-gray-500">
                                Created: {formatDate(campaign.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Campaign Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {formatNumber(campaign.stats?.totalRecipients || campaign.audienceSize || 0)}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Audience Size</div>
                          </div>
                          
                          <div className="bg-green-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {formatNumber(campaign.stats?.sent || campaign.sentCount || 0)}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Sent</div>
                          </div>
                          
                          <div className="bg-blue-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {formatNumber(campaign.stats?.delivered || campaign.deliveredCount || 0)}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Delivered</div>
                          </div>
                          
                          <div className="bg-red-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {formatNumber(campaign.stats?.failed || campaign.failedCount || 0)}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Failed</div>
                          </div>
                          
                          <div className="bg-purple-50 rounded-lg p-3 text-center">
                            <div className="text-2xl font-bold text-purple-600">
                              {(() => {
                                const totalRecipients = campaign.stats?.totalRecipients || campaign.audienceSize || 0
                                const delivered = campaign.stats?.delivered || campaign.deliveredCount || 0
                                const rate = totalRecipients > 0 ? (delivered / totalRecipients) * 100 : 0
                                return `${rate.toFixed(0)}%`
                              })()}
                            </div>
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Delivery Rate</div>
                          </div>
                        </div>

                        {/* Campaign Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex space-x-2">
                            <SmoothButton
                              onClick={() => router.push(`/campaigns/view/${campaign._id}`)}
                              variant="secondary"
                              size="sm"
                            >
                              View Details
                            </SmoothButton>
                            <SmoothButton
                              onClick={() => router.push(`/campaigns/${campaign._id}`)}
                              variant="secondary"
                              size="sm"
                            >
                              Edit
                            </SmoothButton>
                          </div>
                          <div className="text-sm text-gray-500">
                            Email Campaign
                          </div>
                        </div>
                      </div>
                    ))}
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