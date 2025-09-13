import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { campaignApi, segmentApi, aiApi } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface Segment {
  _id: string
  name: string
  description: string
  customerCount: number
  createdAt: string
}

export default function CreateCampaign() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [campaignName, setCampaignName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedSegmentId, setSelectedSegmentId] = useState('')
  const [message, setMessage] = useState('')
  
  // AI Message Generator states
  const [aiObjective, setAiObjective] = useState('')
  const [aiTone, setAiTone] = useState('friendly')
  const [aiOffer, setAiOffer] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [messageVariants, setMessageVariants] = useState<string[]>([])
  const [showAiGenerator, setShowAiGenerator] = useState(false)

  useEffect(() => {
    if (session) {
      loadSegments()
    }
  }, [session])

  const loadSegments = async () => {
    try {
      setLoading(true)
      const response = await segmentApi.getAll()
      setSegments(response.data.data)
    } catch (error) {
      console.error('Error loading segments:', error)
      setError('Failed to load segments')
    } finally {
      setLoading(false)
    }
  }

  // AI Message Generation function
  const generateMessageVariants = async () => {
    if (!aiObjective.trim()) {
      setError('Please enter a campaign objective')
      return
    }

    setAiLoading(true)
    setError(null)

    try {
      const response = await aiApi.messageVariants({
        objective: aiObjective,
        tone: aiTone,
        offer: aiOffer || undefined
      })
      
      const { name, description, message, variants } = response.data.data
      
      // Set AI-generated campaign details
      setCampaignName(name)
      setDescription(description)
      setMessage(message)
      setMessageVariants(variants)
      setShowAiGenerator(false)
      setSuccess('AI has generated campaign name, description, message, and variants!')
    } catch (err) {
      console.error('AI generation error:', err)
      setError('Failed to generate campaign content. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const selectMessageVariant = (variant: string) => {
    setMessage(variant)
    setShowAiGenerator(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!campaignName.trim()) {
      setError('Please enter a campaign name')
      return
    }
    
    if (!selectedSegmentId) {
      setError('Please select a segment')
      return
    }
    
    if (!message.trim()) {
      setError('Please enter a message')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const campaignData = {
        name: campaignName,
        description: description || `Campaign: ${campaignName}`,
        segmentId: selectedSegmentId,
        message: message,
      }

      const response = await campaignApi.create(campaignData)
      setSuccess('Campaign created successfully!')
      
      // Reset form
      setCampaignName('')
      setDescription('')
      setSelectedSegmentId('')
      setMessage('')
      
      // Redirect to campaigns list after a short delay
      setTimeout(() => {
        router.push('/campaigns')
      }, 2000)
      
    } catch (error) {
      console.error('Error creating campaign:', error)
      setError('Failed to create campaign')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to create campaigns.</p>
          <Link
            href="/"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Xeno CRM - Create Campaign</title>
        <meta name="description" content="Create a new marketing campaign in Xeno CRM" />
      </Head>
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
                <button
                  onClick={() => router.push('/campaigns')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Back to Campaigns
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
              <p className="mt-2 text-gray-600">
                Create a new marketing campaign to target specific customer segments.
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-red-400">⚠️</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-green-400">✅</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Success</h3>
                    <div className="mt-2 text-sm text-green-700">{success}</div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Campaign Details</h3>
                  
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700">
                        Campaign Name *
                      </label>
                      <input
                        type="text"
                        id="campaignName"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                        placeholder="Enter campaign name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                        placeholder="Enter campaign description (optional)"
                      />
                    </div>

                    <div>
                      <label htmlFor="segment" className="block text-sm font-medium text-gray-700">
                        Target Segment *
                      </label>
                      <select
                        id="segment"
                        value={selectedSegmentId}
                        onChange={(e) => setSelectedSegmentId(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                        required
                      >
                        <option value="">Select a segment</option>
                        {segments.map((segment) => (
                          <option key={segment._id} value={segment._id}>
                            {segment.name} ({segment.customerCount} customers)
                          </option>
                        ))}
                      </select>
                      {segments.length === 0 && (
                        <p className="mt-1 text-sm text-gray-500">
                          No segments available. <Link href="/segments/create" className="text-indigo-600 hover:text-indigo-500">Create a segment first</Link>.
                        </p>
                      )}
                    </div>

                    {/* AI Message Generator */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900">AI Message Generator</h4>
                            <p className="text-sm text-gray-600">Generate compelling message variants with AI</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowAiGenerator(!showAiGenerator)}
                          className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700"
                        >
                          {showAiGenerator ? 'Hide' : 'Generate Messages'}
                        </button>
                      </div>

                      {showAiGenerator && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label htmlFor="aiObjective" className="block text-sm font-medium text-gray-700 mb-2">
                                Campaign Objective
                              </label>
                              <input
                                id="aiObjective"
                                value={aiObjective}
                                onChange={(e) => setAiObjective(e.target.value)}
                                placeholder="e.g., Increase sales of winter jackets"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              />
                            </div>
                            <div>
                              <label htmlFor="aiTone" className="block text-sm font-medium text-gray-700 mb-2">
                                Tone
                              </label>
                              <select
                                id="aiTone"
                                value={aiTone}
                                onChange={(e) => setAiTone(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              >
                                <option value="friendly">Friendly</option>
                                <option value="professional">Professional</option>
                                <option value="urgent">Urgent</option>
                                <option value="casual">Casual</option>
                                <option value="persuasive">Persuasive</option>
                              </select>
                            </div>
                            <div>
                              <label htmlFor="aiOffer" className="block text-sm font-medium text-gray-700 mb-2">
                                Special Offer (Optional)
                              </label>
                              <input
                                id="aiOffer"
                                value={aiOffer}
                                onChange={(e) => setAiOffer(e.target.value)}
                                placeholder="e.g., 20% off all items"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              />
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={generateMessageVariants}
                            disabled={aiLoading || !aiObjective.trim()}
                            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {aiLoading ? (
                              <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                              </div>
                            ) : (
                              'Generate Message Variants'
                            )}
                          </button>

                          {messageVariants && messageVariants.length > 0 && (
                            <div className="space-y-3">
                              <h5 className="text-sm font-medium text-gray-700">Generated Variants:</h5>
                              <div className="space-y-2">
                                {messageVariants.map((variant, index) => (
                                  <div key={index} className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                                    <div className="flex-1">
                                      <p className="text-sm text-gray-900">{variant}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => selectMessageVariant(variant)}
                                      className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded hover:bg-purple-200"
                                    >
                                      Use This
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Campaign Message *
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2 border"
                        placeholder="Enter your campaign message"
                        required
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        {message.length} characters
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/campaigns')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || segments.length === 0}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  {loading ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
