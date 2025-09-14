import { useSession } from 'next-auth/react'
import { useState } from 'react'
import Head from 'next/head'
import { segmentApi, aiApi } from '@/lib/api'
import Link from 'next/link'
import { useRouter } from 'next/router'

interface Condition {
  field: string
  operator: string
  value: string | number
}

export default function CreateSegment() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [segmentName, setSegmentName] = useState('')
  const [description, setDescription] = useState('')
  const [conditions, setConditions] = useState<Condition[]>([
    { field: 'totalSpend', operator: 'greater_than', value: '' }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // AI Assistant states
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [showAiAssistant, setShowAiAssistant] = useState(false)
  
  // Preview states
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewData, setPreviewData] = useState<{ count: number; customers: any[] } | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const fieldOptions = [
    { value: 'totalSpend', label: 'Total Spend' },
    { value: 'visits', label: 'Number of Visits' },
    { value: 'tags', label: 'Tags' },
    { value: 'lastOrderAt', label: 'Last Order Date' },
  ]

  const operatorOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
  ]

  const addCondition = () => {
    setConditions([...conditions, { field: 'totalSpend', operator: 'greater_than', value: '' }])
  }

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((_, i) => i !== index))
    }
  }

  // AI Assistant functions
  const generateRulesWithAI = async () => {
    if (!aiPrompt.trim()) {
      setError('Please enter a description for the segment')
      return
    }

    setAiLoading(true)
    setError(null)

    try {
      const response = await aiApi.generateSegmentRules(aiPrompt)
      const { rules, name, description } = response.data.data
      
      // Convert AI rules to conditions format
      const newConditions = rules.map((rule: any) => ({
        field: rule.field,
        operator: rule.operator,
        value: rule.value
      }))
      
      // Set the AI-generated name and description
      setSegmentName(name)
      setDescription(description)
      setConditions(newConditions)
      setShowAiAssistant(false)
      setSuccess(`AI has generated segment rules, name, and description based on your input!`)
    } catch (err) {
      console.error('AI generation error:', err)
      setError('Failed to generate rules with AI. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const previewAudience = async () => {
    if (!segmentName.trim()) {
      setError('Please enter a segment name')
      return
    }

    setPreviewLoading(true)
    setError(null)

    try {
      const response = await segmentApi.preview({
        name: segmentName,
        description,
        rules: conditions
      })
      
      setPreviewData(response.data.data)
      setShowPreview(true)
    } catch (err: any) {
      console.error('Preview error:', err)
      setError(err.response?.data?.message || 'Failed to preview audience')
    } finally {
      setPreviewLoading(false)
    }
  }

  const updateCondition = (index: number, field: keyof Condition, value: string | number) => {
    const newConditions = [...conditions]
    newConditions[index][field] = value as any
    setConditions(newConditions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!segmentName.trim()) {
      setError('Please enter a segment name')
      return
    }

    // Validate conditions
    const validConditions = conditions.filter(c => c.value !== '')
    if (validConditions.length === 0) {
      setError('Please add at least one condition')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      const segmentData = {
        name: segmentName,
        description: description || `Segment created for ${segmentName}`,
        rules: validConditions.map(c => ({
          field: c.field,
          operator: c.operator,
          value: c.field === 'totalSpend' || c.field === 'visits' ? Number(c.value) : c.value
        })),
      }

      const response = await segmentApi.create(segmentData)
      setSuccess('Segment created successfully!')
      setSegmentName('')
      setDescription('')
      setConditions([{ field: 'totalSpend', operator: 'greater_than', value: '' }])
      
      // Redirect to segments list after a short delay
      setTimeout(() => {
        router.push('/segments')
      }, 2000)
    } catch (error) {
      console.error('Error creating segment:', error)
      setError('Failed to create segment')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in</h2>
          <p className="text-gray-600">You need to be signed in to create segments.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Xeno CRM - Create Segment</title>
        <meta name="description" content="Create a new customer segment in Xeno CRM" />
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
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Create Segment</h1>
            <p className="mt-2 text-gray-600">
              Create a new customer segment using rules.
            </p>
          </div>

          {/* AI Assistant Section */}
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
                  <p className="text-sm text-gray-600">Describe your segment in natural language and let AI generate the rules</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiAssistant(!showAiAssistant)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                {showAiAssistant ? 'Hide' : 'Use AI'}
              </button>
            </div>

            {showAiAssistant && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="aiPrompt" className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your segment
                  </label>
                  <textarea
                    id="aiPrompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g., Customers who spent more than $500 in the last 30 days and have visited at least 3 times"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={generateRulesWithAI}
                    disabled={aiLoading || !aiPrompt.trim()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      'Generate Rules'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAiPrompt('')
                      setShowAiAssistant(false)
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="segmentName" className="block text-sm font-medium text-gray-700">
                    Segment Name
                  </label>
                  <input
                    type="text"
                    id="segmentName"
                    value={segmentName}
                    onChange={(e) => setSegmentName(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., High Value Customers"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Describe this segment..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Segment Rules
                  </label>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      All conditions must be true (AND logic)
                    </p>
                  </div>

                  <div className="space-y-4">
                    {conditions.map((condition, index) => (
                      <div key={index} className="flex items-end space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Field
                          </label>
                          <select
                            value={condition.field}
                            onChange={(e) => updateCondition(index, 'field', e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            {fieldOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Operator
                          </label>
                          <select
                            value={condition.operator}
                            onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            {operatorOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Value
                          </label>
                          <input
                            type={condition.field === 'totalSpend' || condition.field === 'visits' ? 'number' : 'text'}
                            value={condition.value}
                            onChange={(e) => updateCondition(index, 'value', condition.field === 'totalSpend' || condition.field === 'visits' ? Number(e.target.value) : e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder={condition.field === 'tags' ? 'e.g., vip, premium' : 'Enter value...'}
                          />
                        </div>
                        
                        {conditions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeCondition(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={addCondition}
                      className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800 text-sm font-medium"
                    >
                      + Add Another Condition
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="text-red-800">{error}</div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="text-green-800">{success}</div>
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <Link
                    href="/"
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </Link>
                  <button
                    type="button"
                    onClick={previewAudience}
                    disabled={previewLoading || loading}
                    className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {previewLoading ? 'Previewing...' : 'Preview Audience Size'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {loading ? 'Creating...' : 'Create Segment'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Example Segments:</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <div>
                <strong>High Value Customers:</strong>
                <p className="mt-1">Total Spend &gt; $1000</p>
              </div>
              <div>
                <strong>Frequent Visitors:</strong>
                <p className="mt-1">Number of Visits &gt; 10</p>
              </div>
              <div>
                <strong>VIP Customers:</strong>
                <p className="mt-1">Tags contains "vip" AND Total Spend &gt; $2000</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Audience Preview</h2>
            <div className="mb-4">
              <p className="text-lg font-semibold text-gray-900">
                {previewData.count} customers match this segment
              </p>
            </div>
            
            {previewData.customers.length > 0 && (
              <div>
                <h3 className="text-md font-semibold text-gray-700 mb-3">Customer List:</h3>
                <div className="max-h-60 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Spend</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.customers.slice(0, 10).map((customer: any, index: number) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {customer.firstName} {customer.lastName}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{customer.email}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">${customer.totalSpend}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.customers.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Showing first 10 of {previewData.customers.length} customers
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPreview(false)
                  // Proceed with creating the segment
                  const form = document.querySelector('form') as HTMLFormElement
                  if (form) form.requestSubmit()
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Create Segment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}
