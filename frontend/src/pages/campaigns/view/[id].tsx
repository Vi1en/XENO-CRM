import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { campaignApi, aiApi } from '@/lib/api'
import Link from 'next/link'

interface Campaign {
  _id: string
  name: string
  description: string
  segmentId: string
  message: string
  status: 'draft' | 'scheduled' | 'sent' | 'failed' | 'running'
  scheduledAt?: string
  sentAt?: string
  startedAt?: string
  createdAt: string
  updatedAt: string
  stats?: {
    totalRecipients: number
    sent: number
    failed: number
    delivered: number
    bounced: number
  }
}

export default function CampaignDetails() {
  const router = useRouter()
  const { id } = router.query
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // AI Summary states
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [showAiSummary, setShowAiSummary] = useState(false)

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

  const loadCampaign = async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Loading campaign with ID:', id)
      console.log('🔗 API URL:', `/campaigns/${id}`)
      
      const response = await campaignApi.getById(id as string)
      console.log('✅ Campaign API response:', response)
      console.log('📊 Response status:', response.status)
      console.log('📊 Response data:', response.data)
      console.log('📊 Response data type:', typeof response.data)
      console.log('📊 Response data keys:', response.data ? Object.keys(response.data) : 'No data')
      
      // Extract campaign data from nested API response
      let campaignData: any
      if (response.data && response.data.success && response.data.data && response.data.data.campaign) {
        console.log('🔍 Found campaign in nested structure: response.data.data.campaign')
        campaignData = response.data.data.campaign
      } else if (response.data && response.data.success && response.data.data) {
        console.log('🔍 Found nested data structure: response.data.data')
        campaignData = response.data.data
      } else if (response.data) {
        console.log('🔍 Using direct data structure: response.data')
        campaignData = response.data
      } else {
        console.log('❌ No data found in response')
        throw new Error('Invalid response format')
      }

      console.log('📋 Campaign data loaded:', campaignData)
      console.log('📋 Campaign data type:', typeof campaignData)
      console.log('📋 Campaign data keys:', campaignData ? Object.keys(campaignData) : 'No campaign data')
      console.log('📋 Campaign name:', campaignData?.name)
      console.log('📋 Campaign description:', campaignData?.description)
      console.log('📋 Campaign status:', campaignData?.status)
      console.log('Loaded record:', campaignData)
      setCampaign(campaignData)
      
    } catch (error: any) {
      console.error('❌ Error loading campaign:', error)
      setError(`Failed to load campaign details: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const generateAiSummary = async () => {
    if (!campaign) return
    
    setAiSummaryLoading(true)
    try {
      console.log('🤖 Generating AI summary for campaign:', campaign._id)
      const response = await campaignApi.getSummary(campaign._id)
      console.log('🤖 AI Summary response:', response.data)
      setAiSummary(response.data?.data?.summary || response.data?.summary || 'AI summary not available')
      setShowAiSummary(true)
    } catch (error: any) {
      console.error('Error generating AI summary:', error)
      setAiSummary('Failed to generate AI summary. Using fallback response.')
      setShowAiSummary(true)
    } finally {
      setAiSummaryLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && id) {
      loadCampaign()
    }
  }, [isAuthenticated, id])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">X</span>
          </div>
          <p className="text-gray-600">Loading campaign details...</p>
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
          <p className="text-gray-600 mb-6">You need to be signed in to view campaign details.</p>
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">!</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/campaigns')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">?</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign not found</h1>
          <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/campaigns')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    )
  }

  return (
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
              <Link href="/customers" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
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
              <Link href="/campaigns" className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
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
              <Link href="/campaigns" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Campaigns
              </Link>
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>/campaigns/{id}</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={generateAiSummary}
                disabled={aiSummaryLoading}
                className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {aiSummaryLoading ? 'Generating...' : 'Generate AI Summary'}
              </button>
              <Link
                href={`/campaigns/${campaign._id}`}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Campaign
              </Link>
            </div>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.name || 'Untitled Campaign'}</h1>
                <p className="text-gray-600">{campaign.description || 'No description available'}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                campaign.status === 'running' ? 'bg-green-100 text-green-800' :
                campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                campaign.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                'bg-red-100 text-red-800'
              }`}>
                {campaign.status ? campaign.status.toUpperCase() : 'UNKNOWN'}
              </span>
            </div>

            {/* Campaign Stats */}
            {campaign.stats && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{campaign.stats.totalRecipients || 0}</div>
                  <div className="text-sm text-gray-500">Total Recipients</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{campaign.stats.sent || 0}</div>
                  <div className="text-sm text-gray-500">Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{campaign.stats.delivered || 0}</div>
                  <div className="text-sm text-gray-500">Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{campaign.stats.failed || 0}</div>
                  <div className="text-sm text-gray-500">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {(campaign.stats.sent && campaign.stats.sent > 0) ? Math.round(((campaign.stats.delivered || 0) / campaign.stats.sent) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-500">Delivery Rate</div>
                </div>
              </div>
            )}

            {/* Campaign Message */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Campaign Message</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{campaign.message || 'No message available'}</p>
              </div>
            </div>

            {/* AI Summary */}
            {showAiSummary && aiSummary && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Summary</h3>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-gray-700">{aiSummary}</p>
                </div>
              </div>
            )}

            {/* Campaign Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Campaign Information</h3>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Campaign ID</dt>
                    <dd className="text-sm text-gray-900">{campaign._id || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Segment ID</dt>
                    <dd className="text-sm text-gray-900">{campaign.segmentId || 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                    <dd className="text-sm text-gray-900">{campaign.createdAt ? new Date(campaign.createdAt).toLocaleString() : 'N/A'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                    <dd className="text-sm text-gray-900">{campaign.updatedAt ? new Date(campaign.updatedAt).toLocaleString() : 'N/A'}</dd>
                  </div>
                  {campaign.scheduledAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Scheduled For</dt>
                      <dd className="text-sm text-gray-900">{new Date(campaign.scheduledAt).toLocaleString()}</dd>
                    </div>
                  )}
                  {campaign.sentAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Sent At</dt>
                      <dd className="text-sm text-gray-900">{new Date(campaign.sentAt).toLocaleString()}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
