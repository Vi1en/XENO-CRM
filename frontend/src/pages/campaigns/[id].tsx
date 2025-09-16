import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useForm } from 'react-hook-form'
import { campaignApi, segmentApi } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'
import { useRouter } from 'next/router'
import Link from 'next/link'
import AuthNavigation from '@/components/AuthNavigation'
import PageTransition from '@/components/PageTransition'
import SmoothButton from '@/components/SmoothButton'

interface CampaignFormData {
  name: string
  description: string
  segmentId: string
  message: string
}

interface Segment {
  _id: string
  name: string
}

export default function EditCampaign() {
  const router = useRouter()
  const { id } = router.query
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [segments, setSegments] = useState<Segment[]>([])
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch
  } = useForm<CampaignFormData>({
    defaultValues: {
      name: '',
      description: '',
      segmentId: '',
      message: ''
    }
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('❌ Edit Campaign: User not authenticated, redirecting to login')
      router.replace('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Load campaign and segments when authenticated
  useEffect(() => {
    if (isAuthenticated && user && id) {
      console.log('✅ Edit Campaign: User authenticated, loading campaign and segments')
      loadCampaign()
      loadSegments()
    }
  }, [isAuthenticated, user, id])


  const loadCampaign = async () => {
    if (!id) return
    
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
      let campaign: any
      if (response.data && response.data.success && response.data.data && response.data.data.campaign) {
        console.log('🔍 Found campaign in nested structure: response.data.data.campaign')
        campaign = response.data.data.campaign
      } else if (response.data && response.data.success && response.data.data) {
        console.log('🔍 Found nested data structure: response.data.data')
        campaign = response.data.data
      } else if (response.data) {
        console.log('🔍 Using direct data structure: response.data')
        campaign = response.data
      } else {
        console.log('❌ No data found in response')
        throw new Error('Invalid response format')
      }

      console.log('📋 Campaign data loaded:', campaign)
      console.log('📋 Campaign data type:', typeof campaign)
      console.log('📋 Campaign data keys:', campaign ? Object.keys(campaign) : 'No campaign data')
      console.log('📋 Campaign name:', campaign?.name)
      console.log('📋 Campaign description:', campaign?.description)
      console.log('📋 Campaign status:', campaign?.status)
      console.log('Loaded record:', campaign)
      
      const formattedData = {
        name: campaign.name || '',
        description: campaign.description || '',
        segmentId: campaign.segmentId || '',
        message: campaign.message || ''
      }
      
      console.log('📝 Formatted data for form:', formattedData)
      
      // Reset form with campaign data
      reset(formattedData)
      
    } catch (error: any) {
      console.error('❌ Error loading campaign:', error)
      setError(`Failed to load campaign details: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadSegments = async () => {
    try {
      const response = await segmentApi.getAll()
      setSegments(response.data.data || response.data)
    } catch (error) {
      console.error('Error loading segments:', error)
    }
  }

  useEffect(() => {
    if (isAuthenticated && id) {
      loadCampaign()
      loadSegments()
    }
  }, [isAuthenticated, id])

  const onSubmit = async (data: CampaignFormData) => {
    if (!id) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      console.log('💾 Updating campaign with data:', data)
      await campaignApi.update(id as string, data)
      setSuccess(true)
      console.log('✅ Campaign updated successfully')
      
      // Redirect to campaigns list after 2 seconds
      setTimeout(() => {
        router.push('/campaigns')
      }, 2000)
    } catch (error: any) {
      console.error('❌ Error updating campaign:', error)
      setError(error.response?.data?.message || 'Failed to update campaign')
    } finally {
      setLoading(false)
    }
  }

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
          <p className="text-gray-600 mb-6">You need to be signed in to edit campaigns.</p>
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
    <PageTransition>
      <Head>
        <title>Xeno CRM - Edit Campaign</title>
        <meta name="description" content="Edit marketing campaign in Xeno CRM" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <AuthNavigation currentPath={router.pathname} />

        {/* Main Content */}
        <div className="ml-0 lg:ml-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
          {/* Mobile Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4 lg:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => {
                    const sidebar = document.querySelector('.sidebar-nav')
                    const backdrop = document.querySelector('.sidebar-backdrop')
                    if (sidebar) {
                      sidebar.classList.toggle('-translate-x-full')
                      sidebar.classList.toggle('translate-x-0')
                    }
                    if (backdrop) {
                      backdrop.classList.toggle('opacity-0')
                      backdrop.classList.toggle('opacity-100')
                      backdrop.classList.toggle('pointer-events-none')
                      backdrop.classList.toggle('pointer-events-auto')
                    }
                  }}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  aria-label="Open sidebar"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <div className="flex items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>/campaigns/edit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Link 
                    href="/campaigns" 
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Campaigns
                  </Link>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Campaign</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">Update your marketing campaign details</p>
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
                        Campaign updated successfully! Redirecting to campaigns list...
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
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Campaign Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        {...register('name', { required: 'Campaign name is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter campaign name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="segmentId" className="block text-sm font-medium text-gray-700 mb-2">
                        Target Segment *
                      </label>
                      <select
                        id="segmentId"
                        {...register('segmentId', { required: 'Target segment is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select a segment</option>
                        {segments.map((segment) => (
                          <option key={segment._id} value={segment._id}>
                            {segment.name}
                          </option>
                        ))}
                      </select>
                      {errors.segmentId && (
                        <p className="mt-1 text-sm text-red-600">{errors.segmentId.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      {...register('description')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe your campaign"
                    />
                  </div>

                  <div className="mt-6">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Message *
                    </label>
                    <textarea
                      id="message"
                      {...register('message', { required: 'Campaign message is required' })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Write your campaign message here..."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                  <Link
                    href="/campaigns"
                    className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting || loading}
                    className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting || loading ? 'Updating...' : 'Update Campaign'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}