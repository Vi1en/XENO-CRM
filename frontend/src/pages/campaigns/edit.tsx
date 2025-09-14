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

export default function EditCampaign() {
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

  // Load data when component mounts
  useEffect(() => {
    const loadData = async () => {
      if (!id || typeof id !== 'string') {
        setError('Invalid campaign ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Load campaign data
        console.log('Loading campaign:', id)
        const campaignResponse = await campaignApi.getById(id)
        console.log('Campaign response:', campaignResponse)
        
        if (campaignResponse?.data?.data?.campaign) {
          const campaign = campaignResponse.data.data.campaign
          setFormData({
            name: campaign.name || '',
            description: campaign.description || '',
            segmentId: campaign.segmentId || '',
            message: campaign.message || ''
          })
        } else {
          throw new Error('Campaign not found')
        }

        // Load segments
        console.log('Loading segments...')
        const segmentsResponse = await segmentApi.getAll()
        console.log('Segments response:', segmentsResponse)
        
        if (segmentsResponse?.data) {
          setSegments(Array.isArray(segmentsResponse.data) ? segmentsResponse.data : [])
        }

      } catch (err) {
        console.error('Error loading data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    if (session && id) {
      loadData()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [session, id, status])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!id || typeof id !== 'string') {
      setError('Invalid campaign ID')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('Updating campaign:', id, formData)
      await campaignApi.update(id, formData)
      
      setSuccess(true)
      setTimeout(() => {
        router.push('/campaigns')
      }, 1500)
    } catch (err) {
      console.error('Error updating campaign:', err)
      setError(err instanceof Error ? err.message : 'Failed to update campaign')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to edit campaigns.</p>
          <Link
            href="/api/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Retry
            </button>
            <Link
              href="/campaigns"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Back to Campaigns
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Updated!</h2>
          <p className="text-gray-600">Redirecting to campaigns...</p>
        </div>
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Xeno CRM - Edit Campaign</title>
        <meta name="description" content="Edit marketing campaign in Xeno CRM" />
      </Head>
      
      <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Campaign</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter campaign name..."
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
                placeholder="Enter campaign description..."
              />
            </div>

            <div>
              <label htmlFor="segmentId" className="block text-sm font-medium text-gray-700 mb-2">
                Target Segment
              </label>
              <select
                id="segmentId"
                name="segmentId"
                value={formData.segmentId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a segment...</option>
                {segments.map((segment) => (
                  <option key={segment._id} value={segment._id}>
                    {segment.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                required
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