import { useState } from 'react'
import SmoothButton from './SmoothButton'

interface AIPromptModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'segment' | 'campaign'
  onGenerate: (prompt: string, suggestions: any[]) => void
  onCreateSuggestion?: (suggestion: any) => Promise<void>
}

export default function AIPromptModal({ isOpen, onClose, type, onGenerate, onCreateSuggestion }: AIPromptModalProps) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [creatingIds, setCreatingIds] = useState<Set<string>>(new Set())
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      // Simulate AI API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      let generatedSuggestions = []
      
      if (type === 'segment') {
        generatedSuggestions = [
          {
            id: `ai-segment-${Date.now()}-1`,
            name: `${prompt.split(' ')[0]} Customers`,
            description: `AI-generated segment based on: ${prompt}`,
            rules: [
              { field: 'totalSpend', operator: 'greater_than', value: 100 },
              { field: 'visits', operator: 'greater_than', value: 3 }
            ],
            estimatedCount: Math.floor(Math.random() * 100) + 10,
            confidence: Math.floor(Math.random() * 20) + 80,
            prompt: prompt
          },
          {
            id: `ai-segment-${Date.now()}-2`,
            name: `High-Value ${prompt.split(' ')[0]} Users`,
            description: `Premium customers matching: ${prompt}`,
            rules: [
              { field: 'totalSpend', operator: 'greater_than', value: 500 },
              { field: 'visits', operator: 'greater_than', value: 5 }
            ],
            estimatedCount: Math.floor(Math.random() * 50) + 5,
            confidence: Math.floor(Math.random() * 15) + 85,
            prompt: prompt
          }
        ]
      } else {
        generatedSuggestions = [
          {
            id: `ai-campaign-${Date.now()}-1`,
            name: `${prompt} Campaign`,
            description: `AI-generated campaign for: ${prompt}`,
            type: 'Email',
            targetSegment: 'All Customers',
            estimatedRecipients: Math.floor(Math.random() * 500) + 100,
            confidence: Math.floor(Math.random() * 20) + 80,
            message: `🎯 ${prompt}\n\nWe've created something special just for you! This campaign is designed to help you achieve your goals with ${prompt.toLowerCase()}.\n\nDon't miss out on this exclusive opportunity!`,
            subject: `Your ${prompt} Journey Starts Here`,
            prompt: prompt
          },
          {
            id: `ai-campaign-${Date.now()}-2`,
            name: `Advanced ${prompt} Strategy`,
            description: `Comprehensive campaign targeting: ${prompt}`,
            type: 'Email',
            targetSegment: 'Engaged Users',
            estimatedRecipients: Math.floor(Math.random() * 300) + 50,
            confidence: Math.floor(Math.random() * 15) + 85,
            message: `🚀 Advanced ${prompt} Strategy\n\nOur AI has analyzed your preferences and created a personalized ${prompt.toLowerCase()} experience.\n\nGet ready for:\n• Personalized recommendations\n• Exclusive insights\n• Special offers\n\nStart your journey today!`,
            subject: `Unlock Your ${prompt} Potential`,
            prompt: prompt
          }
        ]
      }
      
      setSuggestions(generatedSuggestions)
    } catch (error) {
      console.error('AI generation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSuggestion = async (suggestion: any) => {
    if (onCreateSuggestion) {
      setCreatingIds(prev => new Set(prev).add(suggestion.id))
      try {
        await onCreateSuggestion(suggestion)
        // Only remove from list if creation was successful
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id))
        setSuccessMessage(`✅ ${suggestion.name} created successfully!`)
        setTimeout(() => setSuccessMessage(null), 3000)
        console.log('✅ Suggestion created successfully and removed from list')
      } catch (error) {
        console.error('❌ Error creating suggestion:', error)
        // Don't remove from list if creation failed
      } finally {
        setCreatingIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(suggestion.id)
          return newSet
        })
      }
    } else {
      onGenerate(prompt, [suggestion])
      onClose()
    }
  }

  const handleCreateAll = async () => {
    if (onCreateSuggestion) {
      const successfulCreations: string[] = []
      try {
        // Create all suggestions one by one
        for (const suggestion of suggestions) {
          try {
            await onCreateSuggestion(suggestion)
            successfulCreations.push(suggestion.id)
            console.log(`✅ Successfully created: ${suggestion.name}`)
          } catch (error) {
            console.error(`❌ Failed to create: ${suggestion.name}`, error)
          }
        }
        // Only remove successfully created suggestions
        setSuggestions(prev => prev.filter(s => !successfulCreations.includes(s.id)))
        console.log(`✅ Created ${successfulCreations.length} out of ${suggestions.length} suggestions`)
        if (successfulCreations.length === suggestions.length) {
          onClose()
        }
      } catch (error) {
        console.error('Error in create all process:', error)
      }
    } else {
      onGenerate(prompt, suggestions)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">🤖 AI {type === 'segment' ? 'Segment' : 'Campaign'} Generator</h2>
              <p className="text-purple-100 mt-1">
                Describe what you want and AI will create {type === 'segment' ? 'customer segments' : 'marketing campaigns'} for you
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe what you want to create:
            </label>
            <div className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  type === 'segment' 
                    ? "e.g., 'customers who bought winter jackets in the last 30 days' or 'high-value users who haven't purchased recently'"
                    : "e.g., 'welcome series for new customers' or 'abandoned cart recovery campaign'"
                }
                className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
              
              <div className="flex flex-wrap gap-2">
                {(type === 'segment' ? [
                  "High-value customers",
                  "Recent purchasers", 
                  "Inactive users",
                  "VIP members",
                  "Cart abandoners"
                ] : [
                  "Welcome series",
                  "Product launch",
                  "Seasonal promotion",
                  "Re-engagement",
                  "Loyalty program"
                ]).map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-purple-100 text-gray-700 rounded-full transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mb-6">
            <SmoothButton
              onClick={handleGenerate}
              disabled={!prompt.trim() || loading}
              loading={loading}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {loading ? 'AI is thinking...' : `🤖 Generate ${type === 'segment' ? 'Segments' : 'Campaigns'}`}
            </SmoothButton>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg animate-fade-in">
              {successMessage}
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Generated Suggestions ({suggestions.length})
                </h3>
                <SmoothButton
                  onClick={handleCreateAll}
                  variant="secondary"
                  size="md"
                >
                  Create All
                </SmoothButton>
              </div>

              <div className="grid gap-4">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow animate-fade-in-up"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{suggestion.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                        {suggestion.message && (
                          <div className="bg-gray-50 rounded p-3 mb-3">
                            <p className="text-sm text-gray-700 font-medium mb-1">Message Preview:</p>
                            <p className="text-sm text-gray-600 whitespace-pre-line">{suggestion.message}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          {suggestion.confidence}% confidence
                        </span>
                        <span className="text-sm text-gray-500">
                          {type === 'segment' ? `~${suggestion.estimatedCount} customers` : `~${suggestion.estimatedRecipients} recipients`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Based on: "{suggestion.prompt}"
                      </div>
                      <SmoothButton
                        onClick={() => handleCreateSuggestion(suggestion)}
                        disabled={creatingIds.has(suggestion.id)}
                        loading={creatingIds.has(suggestion.id)}
                        variant="primary"
                        size="sm"
                      >
                        {creatingIds.has(suggestion.id) ? 'Creating...' : 'Create This One'}
                      </SmoothButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
