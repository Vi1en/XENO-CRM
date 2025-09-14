import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { campaignApi, segmentApi } from '@/lib/api'
import { useRouter } from 'next/router'
import Link from 'next/link'

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

// Error boundary component
function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('Edit page error:', error)
      setHasError(true)
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">There was an error loading the edit page.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium mr-2"
          >
            Reload Page
          </button>
          <Link
            href="/campaigns"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Back to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function EditCampaignContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [segments, setSegments] = useState<Segment[]>([])

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    segmentId: '',
    message: ''
  })

  useEffect(() => {
    if (session && id) {
      loadCampaignData(id as string)
      loadSegments()
    }
  }, [session, id])

  // Add error boundary for client-side errors
  if (typeof window !== 'undefined' && error) {
    console.error('Edit page error:', error)
  }

  const loadSegments = async () => {
    try {
      console.log('Loading segments...')
      const response = await segmentApi.getAll()
      console.log('Segments API response:', response)
      setSegments(response.data || [])
    } catch (err) {
      console.error('Error loading segments:', err)
      setError(`Failed to load segments: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const loadCampaignData = async (campaignId: string) => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading campaign data for ID:', campaignId)
      const response = await campaignApi.getById(campaignId)
      console.log('Campaign API response:', response)
      
      if (!response.data || !response.data.data || !response.data.data.campaign) {
        throw new Error('Invalid response structure from API')
      }
      
      const campaign = response.data.data.campaign
      console.log('Campaign data:', campaign)

      setFormData({
        name: campaign.name || '',
        description: campaign.description || '',
        segmentId: campaign.segmentId || '',
        message: campaign.message || ''
      })
    } catch (err) {
      console.error('Error loading campaign data:', err)
      setError(`Failed to load campaign data: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const campaignData = {
        name: formData.name,
        description: formData.description,
        segmentId: formData.segmentId,
        message: formData.message
      }

      await campaignApi.update(id as string, campaignData)
      setSuccess(true)

      setTimeout(() => {
        router.push('/campaigns')
      }, 2000)
    } catch (err) {
      console.error('Error updating campaign:', err)
      setError('Failed to update campaign. Please check your input.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
          <p className="text-gray-600">You need to be signed in to edit campaigns.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Campaign</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => router.push('/campaigns')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Xeno CRM - Edit Campaign</title>
        <meta name="description" content="Edit marketing campaign in Xeno CRM" />
      </Head>
      
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Campaign</h1>
          
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              Campaign updated successfully! Redirecting...
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Summer Sale 2024"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe this campaign..."
              />
            </div>

            <div>
              <label htmlFor="segmentId" className="block text-sm font-medium text-gray-700 mb-2">
                Target Segment *
              </label>
              <select
                id="segmentId"
                name="segmentId"
                value={formData.segmentId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a segment</option>
                {segments.map((segment) => (
                  <option key={segment._id} value={segment._id}>
                    {segment.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your campaign message..."
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/campaigns')}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Campaign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function EditCampaign() {
  return (
    <ErrorBoundary>
      <EditCampaignContent />
    </ErrorBoundary>
  )
}

