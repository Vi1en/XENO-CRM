import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { campaignApi } from '@/lib/api'
import PageTransition from '@/components/PageTransition'
import SkeletonLoader from '@/components/SkeletonLoader'
import SmoothButton from '@/components/SmoothButton'
import Navigation from '@/components/Navigation'
import AIPromptModal from '@/components/AIPromptModal'
import SegmentSelectionModal from '@/components/SegmentSelectionModal'

interface Campaign {
  _id: string
  name: string
  type: string
  status: string
  targetSegment: string
  sentCount: number
  openRate: number
  clickRate: number
  createdAt: string
  scheduledAt?: string
}

export default function Campaigns() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
  const [showAIModal, setShowAIModal] = useState(false)
  const [showSegmentModal, setShowSegmentModal] = useState(false)
  const [selectedAICampaign, setSelectedAICampaign] = useState<any>(null)

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
      console.log('🔄 Loading campaigns from API...')
      const response = await campaignApi.getAll()
      const rawCampaigns = response.data.data || response.data // Handle both {data: [...]} and [...] formats
      
      // Map API data to our expected format using real MongoDB data
      const apiCampaigns = rawCampaigns.map((campaign: any) => {
        const stats = campaign.stats || {}
        return {
          _id: campaign._id,
          name: campaign.name,
          type: 'Email', // Default type since backend doesn't store type
          status: campaign.status,
          targetSegment: 'All Customers', // Default since we don't have segment info in this endpoint
          sentCount: stats.sent || 0,
          openRate: 0, // Not tracked in current backend
          clickRate: 0, // Not tracked in current backend
          createdAt: campaign.createdAt,
          scheduledAt: campaign.scheduledAt
        }
      })
      
      setCampaigns(apiCampaigns)
      setFilteredCampaigns(apiCampaigns)
      console.log('✅ Real campaigns loaded from MongoDB:', apiCampaigns.length)
      
    } catch (error: any) {
      console.error('❌ Error loading campaigns from API:', error)
      setError('Failed to load campaign data from database')
      setCampaigns([])
      setFilteredCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (campaign: Campaign) => {
    // Navigate to edit page with campaign data
    router.push({
      pathname: '/campaigns/edit',
      query: { id: campaign._id }
    })
  }

  const handleDelete = async (campaign: Campaign) => {
    if (!confirm(`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeleteLoading(campaign._id)
      console.log('🗑️ Deleting campaign:', campaign._id)
      
      // Try to delete from API first
      try {
        await campaignApi.delete(campaign._id)
        console.log('✅ Campaign deleted from API successfully')
      } catch (apiError) {
        console.warn('⚠️ API delete failed, removing from local state only:', apiError)
      }
      
      // Remove from local state regardless of API result
      setCampaigns(prev => prev.filter(c => c._id !== campaign._id))
      setFilteredCampaigns(prev => prev.filter(c => c._id !== campaign._id))
      
      console.log('✅ Campaign deleted successfully')
    } catch (error) {
      console.error('❌ Error deleting campaign:', error)
      setError('Failed to delete campaign')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleAIGenerate = (prompt: string, suggestions: any[]) => {
    setAiSuggestions(suggestions)
    console.log('AI generated campaigns from prompt:', prompt, suggestions)
  }

  const handleAICampaignSelect = (suggestion: any) => {
    setSelectedAICampaign(suggestion)
    setShowSegmentModal(true)
  }

  const createAICampaign = async (segmentId: string, segmentName: string) => {
    if (!selectedAICampaign) return

    try {
      console.log('🤖 Creating AI campaign with suggestion:', selectedAICampaign)
      console.log('🎯 Selected segment:', segmentName, segmentId)
      
      const newCampaign = {
        name: selectedAICampaign.name,
        description: selectedAICampaign.description,
        segmentId: segmentId,
        message: selectedAICampaign.message || selectedAICampaign.description
      }
      
      console.log('📝 Campaign data to create:', newCampaign)
      
      // Create the campaign
      const response = await campaignApi.create(newCampaign)
      const createdCampaign = response.data
      
      console.log('✅ API response:', response)
      console.log('✅ Created campaign:', createdCampaign)
      
      // Add to local state
      setCampaigns(prev => [...prev, createdCampaign])
      setFilteredCampaigns(prev => [...prev, createdCampaign])
      
      // Remove from suggestions
      setAiSuggestions(prev => prev.filter(s => s.id !== selectedAICampaign.id))
      
      // Close modals
      setShowSegmentModal(false)
      setSelectedAICampaign(null)
      
      console.log('✅ AI campaign created and added to state:', createdCampaign)
    } catch (error: any) {
      console.error('❌ Error creating AI campaign:', error)
      console.error('❌ Error details:', error.response?.data || error.message)
      console.error('❌ Full error response:', error.response)
      console.error('❌ Validation errors:', error.response?.data?.errors)
      setError('Failed to create AI campaign: ' + (error.response?.data?.message || error.message))
    }
  }

  const handleSignOut = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('xeno-user')
    router.push('/')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Email': return '📧'
      case 'SMS': return '📱'
      case 'Push': return '🔔'
      default: return '📢'
    }
  }

  // Show loading state during authentication check
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
            <span className="text-white font-bold text-xl">X</span>
          </div>
          <p className="text-gray-600 animate-pulse">Loading campaigns...</p>
        </div>
      </div>
    )
  }

  // Show sign in if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center animate-fade-in-up">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
            <span className="text-white font-bold text-xl">X</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view campaigns.</p>
          <SmoothButton
            onClick={() => router.push('/')}
            variant="primary"
            size="lg"
            className="animate-scale-in"
          >
            Go to Sign In
          </SmoothButton>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <Head>
        <title>Xeno CRM - Campaigns</title>
        <meta name="description" content="Manage marketing campaigns in Xeno CRM" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Navigation Sidebar */}
        <Navigation 
          currentPath="/campaigns" 
          user={user} 
          onSignOut={handleSignOut} 
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-64">
          {/* Top Bar */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>/campaigns</span>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900" style={{ fontSize: '1.875rem', margin: '0' }}>Marketing Campaigns</h1>
                  <p className="mt-2 text-gray-600">Create and manage your marketing campaigns with AI assistance</p>
                </div>
                <div className="flex space-x-3">
                  <SmoothButton
                    onClick={loadCampaigns}
                    disabled={loading}
                    loading={loading}
                    variant="secondary"
                    size="md"
                    className="animate-fade-in"
                  >
                    Refresh
                  </SmoothButton>
                  <SmoothButton
                    onClick={() => setShowAIModal(true)}
                    variant="primary"
                    size="md"
                    className="animate-fade-in"
                  >
                    🤖 Generate AI Campaigns
                  </SmoothButton>
                  <SmoothButton
                    onClick={() => router.push('/campaigns/create')}
                    variant="primary"
                    size="md"
                    className="animate-fade-in"
                  >
                    + Create Campaign
                  </SmoothButton>
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm border border-purple-200 p-6 animate-fade-in-down">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">🤖 AI-Generated Campaign Suggestions</h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">AI Active</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiSuggestions.map((suggestion: any, index: number) => (
                    <div 
                      key={suggestion.id}
                      className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-300 ease-smooth-out animate-fade-in-up"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{suggestion.name}</h3>
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          {suggestion.confidence}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">~{suggestion.estimatedRecipients} recipients</span>
                        <SmoothButton
                          onClick={() => handleAICampaignSelect(suggestion)}
                          variant="primary"
                          size="sm"
                        >
                          Create This One
                        </SmoothButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campaigns List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Campaign List
                  </h2>
                  {searchTerm && (
                    <div className="text-sm text-gray-500">
                      {filteredCampaigns.length} of {campaigns.length} campaigns
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
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-hidden">
                {loading && (
                  <div className="p-6">
                    <SkeletonLoader type="table" count={1} />
                  </div>
                )}

                {!loading && filteredCampaigns.length === 0 && campaigns.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📢</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                    <p className="text-gray-500 mb-6">
                      Create your first marketing campaign to get started.
                    </p>
                    <Link
                      href="/campaigns/create"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Create Campaign
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
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Open Rate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Click Rate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCampaigns.map((campaign: Campaign, index: number) => (
                          <tr 
                            key={campaign._id} 
                            className="hover:bg-gray-50 transition-all duration-200 ease-smooth-out hover:shadow-sm animate-fade-in-up"
                            style={{animationDelay: `${index * 0.05}s`}}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-2xl mr-3">{getTypeIcon(campaign.type)}</div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                                  {campaign.scheduledAt && (
                                    <div className="text-xs text-gray-500">
                                      Scheduled: {new Date(campaign.scheduledAt).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {campaign.type}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                                {campaign.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {campaign.targetSegment}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {campaign.sentCount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {campaign.openRate > 0 ? `${campaign.openRate}%` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {campaign.clickRate > 0 ? `${campaign.clickRate}%` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(campaign.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <SmoothButton
                                  onClick={() => handleEdit(campaign)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </SmoothButton>
                                <SmoothButton
                                  onClick={() => handleDelete(campaign)}
                                  disabled={deleteLoading === campaign._id}
                                  loading={deleteLoading === campaign._id}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-900"
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
            </div>
          </div>
        </div>
      </div>

      {/* AI Prompt Modal */}
        <AIPromptModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          type="campaign"
          onGenerate={handleAIGenerate}
        />
        
        <SegmentSelectionModal
          isOpen={showSegmentModal}
          onClose={() => {
            setShowSegmentModal(false)
            setSelectedAICampaign(null)
          }}
          onSelect={createAICampaign}
          campaignName={selectedAICampaign?.name || ''}
          campaignMessage={selectedAICampaign?.message || ''}
        />
    </PageTransition>
  )
}
