import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { segmentApi } from '@/lib/api'
import { useRouter } from 'next/router'

interface SegmentFormData {
  name: string
  description: string
  rules: string
}

export default function EditSegment() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<SegmentFormData>({
    name: '',
    description: '',
    rules: ''
  })

  useEffect(() => {
    if (session && id) {
      loadSegmentData(id as string)
    }
  }, [session, id])

  const loadSegmentData = async (segmentId: string) => {
    try {
      setLoading(true)
      setError(null)
      const response = await segmentApi.getById(segmentId)
      const segment = response.data.data

      setFormData({
        name: segment.name,
        description: segment.description || '',
        rules: JSON.stringify(segment.rules, null, 2)
      })
    } catch (err) {
      console.error('Error loading segment data:', err)
      setError('Failed to load segment data.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      let parsedRules
      try {
        parsedRules = JSON.parse(formData.rules)
      } catch (parseError) {
        setError('Invalid JSON format for rules. Please check your syntax.')
        setLoading(false)
        return
      }

      const segmentData = {
        name: formData.name,
        description: formData.description,
        rules: parsedRules
      }

      await segmentApi.update(id as string, segmentData)
      setSuccess(true)

      setTimeout(() => {
        router.push('/segments')
      }, 2000)
    } catch (err) {
      console.error('Error updating segment:', err)
      setError('Failed to update segment. Please check your input.')
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
          <p className="text-gray-600">You need to be signed in to edit segments.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Xeno CRM - Edit Segment</title>
        <meta name="description" content="Edit customer segment in Xeno CRM" />
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Segment</h1>
          
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
              Segment updated successfully! Redirecting...
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
                Segment Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., High Value Customers"
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
                placeholder="Describe this segment..."
              />
            </div>

            <div>
              <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-2">
                Rules (JSON) *
              </label>
              <textarea
                id="rules"
                name="rules"
                value={formData.rules}
                onChange={handleChange}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder='[{"field": "totalSpend", "operator": "gte", "value": 1000}]'
              />
              <p className="mt-1 text-sm text-gray-500">
                Enter valid JSON format for segment rules.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/segments')}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Segment'}
              </button>
            </div>
          </form>
        </div>
      </div>
      </div>
    </>
  )
}