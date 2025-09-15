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
  updatedAt: string
  scheduledAt?: string
  completedAt?: string
}

export default function CampaignHistory() {
  const router = useRouter()
  const { user, isLoading: authLoading, isAuthenticated, getAuthHeaders } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      
      console.log('📧 Campaigns response:', response.data)
      
      // Handle nested data structure
      const campaignsData = response.data?.data || response.data || []
      setCampaigns(Array.isArray(campaignsData) ? campaignsData : [])
      
      console.log('✅ Campaigns loaded:', campaignsData.length)
    } catch (error: any) {
      console.error('❌ Error loading campaigns:', error)
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
                    Campaign History ({campaigns.length})
                  </h3>
                </div>
                
                {campaigns.length === 0 ? (
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
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Campaign
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Audience
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sent
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delivered
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Open Rate
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Click Rate
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
                        {campaigns.map((campaign, index) => (
                          <tr key={campaign._id || index} className="hover:bg-gray-50 animate-fade-in-up" style={{animationDelay: `${index * 0.05}s`}}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                    <span className="text-sm font-medium text-white">
                                      {campaign.name?.charAt(0)?.toUpperCase() || 'C'}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {campaign.name || 'Untitled Campaign'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {campaign.type || 'Email'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                {campaign.status ? campaign.status.toUpperCase() : 'UNKNOWN'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatNumber(campaign.audienceSize)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatNumber(campaign.sentCount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatNumber(campaign.deliveredCount)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {campaign.openRate ? `${campaign.openRate.toFixed(1)}%` : '0%'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {campaign.clickRate ? `${campaign.clickRate.toFixed(1)}%` : '0%'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatDate(campaign.createdAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <SmoothButton
                                  onClick={() => router.push(`/campaigns/view/${campaign._id}`)}
                                  variant="secondary"
                                  size="sm"
                                >
                                  View
                                </SmoothButton>
                                <SmoothButton
                                  onClick={() => router.push(`/campaigns/${campaign._id}`)}
                                  variant="secondary"
                                  size="sm"
                                >
                                  Edit
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