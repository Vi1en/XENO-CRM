import { useState, useEffect } from 'react'
import Head from 'next/head'
import { segmentApi } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/useAuth'
import AuthNavigation from '@/components/AuthNavigation'
import PageTransition from '@/components/PageTransition'
import SmoothButton from '@/components/SmoothButton'

interface Segment {
  _id: string
  name: string
  description: string
  rules: any[]
  customerCount: number
  createdAt: string
  updatedAt: string
}

export default function EditSegment() {
  const router = useRouter()
  const { id } = router.query
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [segment, setSegment] = useState<Segment | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: [] as Array<{
      id: number
      field: string
      operator: string
      value: string
    }>
  })
  const [newRule, setNewRule] = useState({
    field: '',
    operator: '',
    value: ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('🔐 Segment Edit: User not authenticated, redirecting to login')
      router.push('/login')
    }
  }, [authLoading, isAuthenticated, router])

  // Load segment data when ID is available
  useEffect(() => {
    if (id && isAuthenticated) {
      loadSegment()
    }
  }, [id, isAuthenticated])

  const loadSegment = async () => {
    if (!id) return
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔄 Loading segment from API...', id)
      const response = await segmentApi.getById(id as string)
      const segmentData = response.data.data || response.data
      
      setSegment(segmentData)
             setFormData({
               name: segmentData.name || '',
               description: segmentData.description || '',
               rules: segmentData.rules || []
             })
             // Add IDs to existing rules for proper management
             setFormData(prev => ({
               ...prev,
               rules: (segmentData.rules || []).map((rule: any, index: number) => ({
                 ...rule,
                 id: rule.id || Date.now() + index
               }))
             }))
      console.log('✅ Segment loaded from API:', segmentData)
      
    } catch (error: any) {
      console.error('❌ Error loading segment from API:', error)
      setError('Failed to load segment data')
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

  const handleRuleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewRule(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addRule = () => {
    if (newRule.field && newRule.operator && newRule.value) {
      setFormData(prev => ({
        ...prev,
        rules: [...prev.rules, { ...newRule, id: Date.now() }]
      }))
      setNewRule({ field: '', operator: '', value: '' })
    }
  }

  const removeRule = (ruleId: number) => {
    setFormData(prev => ({
      ...prev,
      rules: prev.rules.filter((rule: any) => rule.id !== ruleId)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    
    setLoading(true)
    setError(null)

    try {
      await segmentApi.update(id as string, formData)
      setSuccess(true)
      
      // Redirect to segments list after 2 seconds
      setTimeout(() => {
        router.push('/segments')
      }, 2000)

    } catch (error: any) {
      console.error('Error updating segment:', error)
      setError(error.response?.data?.message || 'Failed to update segment')
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
          <p className="text-gray-600">Loading...</p>
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
          <p className="text-gray-600 mb-6">You need to be signed in to access this page.</p>
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

  if (!segment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">X</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Segment not found</h1>
          <p className="text-gray-600 mb-6">The segment you're looking for doesn't exist.</p>
          <Link
            href="/segments"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Segments
          </Link>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <Head>
        <title>Xeno CRM - Edit Segment</title>
        <meta name="description" content="Edit customer segment in Xeno CRM" />
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>/segments/edit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900" style={{ fontSize: '1.875rem', margin: '0' }}>Edit Segment</h1>
                  <p className="mt-2 text-gray-600">Update segment details and rules</p>
                </div>
                <Link
                  href="/segments"
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Back to Segments
                </Link>
              </div>
            </div>

            {/* Success Message */}
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
                      Segment updated successfully! Redirecting...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
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

            {/* Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Segment Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter segment name"
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
                    placeholder="Enter segment description"
                  />
                </div>

                {/* Rule Builder Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Rule Builder
                    </label>
                    <button
                      type="button"
                      className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      + Add Rule Group
                    </button>
                  </div>

                  {/* Example Rule */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value="Example: Customers inactive for 6 months & spent > 5000"
                        readOnly
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                      <button
                        type="button"
                        className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Convert to Rules
                      </button>
                    </div>
                  </div>

                  {/* Rule Groups */}
                  <div className="space-y-4">
                    {/* Rule Group 1 */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium text-gray-700">Rule Group 1</h4>
                        <div className="flex items-center space-x-2">
                          <select className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500">
                            <option value="AND">AND</option>
                            <option value="OR">OR</option>
                          </select>
                          <button
                            type="button"
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Rule Row */}
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <select
                              id="ruleField"
                              name="field"
                              value={newRule.field}
                              onChange={handleRuleChange}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Field</option>
                              <option value="visits_count">Visits Count</option>
                              <option value="last_active">Last Active</option>
                              <option value="total_spend">Total Spend</option>
                              <option value="created_at">Created At</option>
                              <option value="name">Name</option>
                              <option value="email">Email</option>
                              <option value="phone">Phone</option>
                              <option value="company">Company</option>
                              <option value="location">Location</option>
                              <option value="last_order_date">Last Order Date</option>
                              <option value="order_count">Order Count</option>
                              <option value="avg_order_value">Average Order Value</option>
                            </select>
                          </div>
                          
                          <div className="flex-1">
                            <select
                              id="ruleOperator"
                              name="operator"
                              value={newRule.operator}
                              onChange={handleRuleChange}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Operator</option>
                              <option value=">">&gt;</option>
                              <option value="<">&lt;</option>
                              <option value=">=">&gt;=</option>
                              <option value="<=">&lt;=</option>
                              <option value="=">=</option>
                              <option value="!=">!=</option>
                              <option value="contains">contains</option>
                              <option value="not_contains">not contains</option>
                              <option value="starts_with">starts with</option>
                              <option value="ends_with">ends with</option>
                              <option value="is_empty">is empty</option>
                              <option value="is_not_empty">is not empty</option>
                            </select>
                          </div>
                          
                          <div className="flex-1">
                            <input
                              type="text"
                              id="ruleValue"
                              name="value"
                              value={newRule.value}
                              onChange={handleRuleChange}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Value"
                            />
                          </div>
                          
                          <button
                            type="button"
                            className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={addRule}
                          disabled={!newRule.field || !newRule.operator || !newRule.value}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          + Add Rule
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Existing Rules Display */}
                  {formData.rules.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Active Rules</h4>
                      <div className="space-y-2">
                        {formData.rules.map((rule: any) => (
                          <div key={rule.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-700">
                                {rule.field.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </span>
                              <span className="text-sm text-gray-500 font-mono">
                                {rule.operator}
                              </span>
                              <span className="text-sm text-gray-900 font-medium">
                                "{rule.value}"
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeRule(rule.id)}
                              className="p-1 text-red-400 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.rules.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <p className="text-sm">No rules added yet</p>
                      <p className="text-xs text-gray-400">Add rules to define which customers belong to this segment</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer Count
                  </label>
                  <div className="text-2xl font-bold text-blue-600">{segment.customerCount} customers</div>
                  <p className="text-sm text-gray-500 mt-1">This will be recalculated when you save the segment</p>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <Link
                    href="/segments"
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Updating...' : 'Update Segment'}
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