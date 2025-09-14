import { useSession } from 'next-auth/react'
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
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // AI Summary states
  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [showAiSummary, setShowAiSummary] = useState(false)

  useEffect(() => {
    if (session && id) {
      loadCampaign()
    }
  }, [session, id])

  const loadCampaign = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await campaignApi.getById(id as string)
      setCampaign(response.data.data.campaign)
    } catch (error) {
      console.error('Error loading campaign:', error)
      setError('Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  // AI Summary generation function
  const generateAISummary = async () => {
    if (!campaign) return

    setAiSummaryLoading(true)
    setError(null)

    try {
      const response = await campaignApi.getSummary(campaign._id)
      setAiSummary(response.data.summary)
      setShowAiSummary(true)
    } catch (err) {
      console.error('AI summary error:', err)
      setError('Failed to generate AI summary. Please try again.')
    } finally {
      setAiSummaryLoading(false)
    }
  }

  // Delete campaign function
  const handleDelete = async () => {
    console.log('handleDelete called for campaign:', campaign?._id, campaign?.name)
    
    if (!campaign) {
      console.log('No campaign found, cannot delete')
      return
    }
    
    console.log('Showing confirmation dialog...')
    if (!confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
      console.log('Delete cancelled by user')
      return
    }

    try {
      console.log('Calling campaignApi.delete for:', campaign._id)
      await campaignApi.delete(campaign._id)
      console.log('Campaign deleted successfully, redirecting to /campaigns')
      router.push('/campaigns')
    } catch (error) {
      console.error('Error deleting campaign:', error)
      setError('Failed to delete campaign')
    }
  }

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800'
      case 'running':
        return 'bg-blue-100 text-blue-800'
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
          <p className="text-gray-600">You need to be signed in to view campaign details.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading campaign details...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Campaign</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/campaigns"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Back to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h2>
          <p className="text-gray-600 mb-4">The campaign you're looking for doesn't exist or has been deleted.</p>
          <Link
            href="/campaigns"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Back to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-semibold text-gray-900">
                Xeno CRM
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {session.user?.name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{campaign.name || 'Untitled Campaign'}</h1>
                <p className="mt-2 text-gray-600">{campaign.description || 'No description provided'}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                {campaign.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Message</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{campaign.message || 'No message provided'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Details</h3>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Campaign ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">{campaign._id}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Segment ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">{campaign.segmentId}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(campaign.createdAt)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatDate(campaign.updatedAt)}</dd>
                    </div>
                    {campaign.scheduledAt && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Scheduled For</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(campaign.scheduledAt)}</dd>
                      </div>
                    )}
                    {campaign.sentAt && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Sent At</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(campaign.sentAt)}</dd>
                      </div>
                    )}
                    {campaign.startedAt && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Started At</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatDate(campaign.startedAt)}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                  <div className="space-y-3">
                    {campaign.status === 'draft' && (
                      <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        Send Campaign
                      </button>
                    )}
                    {campaign.status === 'scheduled' && (
                      <button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                        Cancel Schedule
                      </button>
                    )}
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        console.log('Edit button clicked for campaign:', campaign._id)
                        router.push(`/campaigns/edit?id=${campaign._id}`)
                      }}
                      className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Edit Campaign
                    </button>
                    <button 
                      onClick={(e) => {
                        e.preventDefault()
                        console.log('Delete button clicked for campaign:', campaign._id)
                        handleDelete()
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Delete Campaign
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Created</span>
                      <span className="text-sm text-gray-900">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Message Length</span>
                      <span className="text-sm text-gray-900">
                        {(campaign.message || '').length} characters
                      </span>
                    </div>
                    {campaign.stats && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Total Recipients</span>
                          <span className="text-sm text-gray-900 font-medium">
                            {campaign.stats.totalRecipients}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Sent</span>
                          <span className="text-sm text-green-600 font-medium">
                            {campaign.stats.sent}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Delivered</span>
                          <span className="text-sm text-blue-600 font-medium">
                            {campaign.stats.delivered}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Failed</span>
                          <span className="text-sm text-red-600 font-medium">
                            {campaign.stats.failed}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Summary Section */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Campaign Analysis</h3>
                  <p className="text-sm text-gray-600">Get AI-powered insights about your campaign performance</p>
                </div>
              </div>
              <button
                onClick={generateAISummary}
                disabled={aiSummaryLoading}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiSummaryLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </div>
                ) : (
                  'Generate AI Summary'
                )}
              </button>
            </div>

            {aiSummary && (
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">AI Analysis:</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{aiSummary}</p>
              </div>
            )}

            {showAiSummary && !aiSummary && !aiSummaryLoading && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Click "Generate AI Summary" to get AI-powered insights about this campaign.</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between">
            <Link
              href="/campaigns"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
            >
              ← Back to Campaigns
            </Link>
            <div className="flex space-x-3">
              <button
                onClick={loadCampaign}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
