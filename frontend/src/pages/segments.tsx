import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { segmentApi } from '@/lib/api'
import PageTransition from '@/components/PageTransition'
import SkeletonLoader from '@/components/SkeletonLoader'
import SmoothButton from '@/components/SmoothButton'
import Navigation from '@/components/Navigation'
import AIPromptModal from '@/components/AIPromptModal'

interface Segment {
  _id: string
  name: string
  description: string
  rules: any[]
  customerCount: number
  createdAt: string
  updatedAt: string
}

export default function Segments() {
  const router = useRouter()
  const [segments, setSegments] = useState<Segment[]>([])
  const [filteredSegments, setFilteredSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
  const [showAIModal, setShowAIModal] = useState(false)

  // Simple authentication check
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('xeno-user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
          loadSegments()
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

  // Filter segments based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSegments(segments)
    } else {
      const filtered = segments.filter(segment => {
        const searchLower = searchTerm.toLowerCase()
        return (
          segment.name.toLowerCase().includes(searchLower) ||
          segment.description.toLowerCase().includes(searchLower)
        )
      })
      setFilteredSegments(filtered)
    }
  }, [segments, searchTerm])

  const loadSegments = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Loading segments from API...')
      const response = await segmentApi.getAll()
      const apiSegments = response.data.data || response.data // Handle both {data: [...]} and [...] formats
      
      setSegments(apiSegments)
      setFilteredSegments(apiSegments)
      console.log('✅ Real segments loaded from API:', apiSegments.length)
      
    } catch (error: any) {
      console.error('❌ Error loading segments from API:', error)
      setError('Failed to load segment data from database')
      setSegments([])
      setFilteredSegments([])
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('xeno-user')
    router.push('/')
  }

  const handleDelete = async (segmentId: string) => {
    if (!confirm('Are you sure you want to delete this segment?')) {
      return
    }

    try {
      await segmentApi.delete(segmentId)
      // Remove from local state
      setSegments(prev => prev.filter(segment => segment._id !== segmentId))
      setFilteredSegments(prev => prev.filter(segment => segment._id !== segmentId))
    } catch (error: any) {
      console.error('Error deleting segment:', error)
      setError('Failed to delete segment')
    }
  }

  const handleAIGenerate = (prompt: string, suggestions: any[]) => {
    setAiSuggestions(suggestions)
    console.log('AI generated segments from prompt:', prompt, suggestions)
  }

  const createAISegment = async (suggestion: any) => {
    try {
      const newSegment = {
        name: suggestion.name,
        description: suggestion.description,
        rules: suggestion.rules,
        customerCount: suggestion.estimatedCount
      }
      
      // Create the segment
      const response = await segmentApi.create(newSegment)
      const createdSegment = response.data
      
      // Add to local state
      setSegments(prev => [...prev, createdSegment])
      setFilteredSegments(prev => [...prev, createdSegment])
      
      // Remove from suggestions
      setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
      
      console.log('✅ AI segment created:', createdSegment)
    } catch (error) {
      console.error('Error creating AI segment:', error)
      setError('Failed to create AI segment')
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
          <p className="text-gray-600 animate-pulse">Loading segments...</p>
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
          <p className="text-gray-600 mb-6">You need to be signed in to view segments.</p>
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
        <title>Xeno CRM - Segments</title>
        <meta name="description" content="Manage customer segments in Xeno CRM" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Navigation Sidebar */}
        <Navigation 
          currentPath="/segments" 
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
                  <span>/segments</span>
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
                  <h1 className="text-3xl font-bold text-gray-900" style={{ fontSize: '1.875rem', margin: '0' }}>Customer Segments</h1>
                  <p className="mt-2 text-gray-600">Organize customers into targeted groups with AI assistance</p>
                </div>
                <div className="flex space-x-3">
                  <SmoothButton
                    onClick={loadSegments}
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
                    🤖 Generate AI Segments
                  </SmoothButton>
                  <SmoothButton
                    onClick={() => router.push('/segments/create')}
                    variant="primary"
                    size="md"
                    className="animate-fade-in"
                  >
                    + Create Segment
                  </SmoothButton>
                </div>
              </div>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions.length > 0 && (
              <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-sm border border-purple-200 p-6 animate-fade-in-down">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">🤖 AI-Generated Segment Suggestions</h2>
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
                        <span className="text-sm text-gray-500">~{suggestion.estimatedCount} customers</span>
                        <SmoothButton
                          onClick={() => createAISegment(suggestion)}
                          variant="primary"
                          size="sm"
                        >
                          Create
                        </SmoothButton>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Segments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading && (
                <div className="col-span-full">
                  <SkeletonLoader type="card" count={6} />
                </div>
              )}

              {!loading && filteredSegments.length === 0 && segments.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🎯</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No segments found</h3>
                  <p className="text-gray-500 mb-6">
                    Create your first customer segment to get started.
                  </p>
                  <Link
                    href="/segments/create"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Create Segment
                  </Link>
                </div>
              )}

              {!loading && filteredSegments.length === 0 && segments.length > 0 && (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No segments found</h3>
                  <p className="text-gray-500 mb-6">
                    No segments match your search criteria. Try adjusting your search terms.
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Clear search
                  </button>
                </div>
              )}

              {!loading && filteredSegments.length > 0 && (
                <>
                  {/* Search Bar */}
                  <div className="col-span-full mb-6">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Search segments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Segment Cards */}
                  {filteredSegments.map((segment: Segment, index: number) => (
                    <div 
                      key={segment._id} 
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:scale-105 transition-all duration-300 ease-smooth-out animate-fade-in-up group"
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{segment.name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{segment.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <SmoothButton
                            onClick={() => router.push(`/segments/edit?id=${segment._id}`)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-blue-600"
                            title="Edit segment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </SmoothButton>
                          <SmoothButton
                            onClick={() => handleDelete(segment._id)}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-600"
                            title="Delete segment"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </SmoothButton>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-blue-600">{segment.customerCount}</div>
                          <div className="text-sm text-gray-500">customers</div>
                        </div>
                        <div className="text-xs text-gray-400">
                          Created {new Date(segment.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Prompt Modal */}
      <AIPromptModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        type="segment"
        onGenerate={handleAIGenerate}
      />
    </PageTransition>
  )
}
