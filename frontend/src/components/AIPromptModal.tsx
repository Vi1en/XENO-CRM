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
      
      // Parse the prompt to extract key information
      const promptWords = prompt.toLowerCase().split(' ')
      const isHighValue = promptWords.some(word => ['high', 'premium', 'vip', 'valuable', 'expensive', 'luxury'].includes(word))
      const isEngagement = promptWords.some(word => ['engaged', 'active', 'frequent', 'regular', 'loyal'].includes(word))
      const isInactive = promptWords.some(word => ['inactive', 'churned', 'lost', 'abandoned', 'dormant'].includes(word))
      const isNew = promptWords.some(word => ['new', 'recent', 'fresh', 'first-time'].includes(word))
      const isRetention = promptWords.some(word => ['retention', 'retain', 'keep', 'maintain'].includes(word))
      const isAcquisition = promptWords.some(word => ['acquisition', 'acquire', 'attract', 'gain', 'new'].includes(word))
      
      if (type === 'segment') {
        // Generate intelligent segment names based on prompt
        const segmentName1 = isHighValue ? `Premium ${prompt.split(' ')[0]} Customers` :
                           isEngagement ? `Highly Engaged ${prompt.split(' ')[0]} Users` :
                           isInactive ? `Inactive ${prompt.split(' ')[0]} Customers` :
                           isNew ? `New ${prompt.split(' ')[0]} Customers` :
                           `${prompt.split(' ')[0]} Segment`
        
        const segmentName2 = isHighValue ? `Elite ${prompt.split(' ')[0]} Members` :
                           isEngagement ? `Active ${prompt.split(' ')[0]} Community` :
                           isInactive ? `At-Risk ${prompt.split(' ')[0]} Customers` :
                           isNew ? `First-Time ${prompt.split(' ')[0]} Buyers` :
                           `Advanced ${prompt.split(' ')[0]} Segment`
        
        // Generate intelligent rules based on prompt
        const rules1 = isHighValue ? [
          { field: 'totalSpend', operator: 'greater_than', value: 1000 },
          { field: 'visits', operator: 'greater_than', value: 5 }
        ] : isEngagement ? [
          { field: 'visits', operator: 'greater_than', value: 10 },
          { field: 'totalSpend', operator: 'greater_than', value: 200 }
        ] : isInactive ? [
          { field: 'lastOrderAt', operator: 'less_than', value: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() },
          { field: 'totalSpend', operator: 'greater_than', value: 50 }
        ] : isNew ? [
          { field: 'totalSpend', operator: 'greater_than', value: 0 },
          { field: 'visits', operator: 'greater_than', value: 1 }
        ] : [
          { field: 'totalSpend', operator: 'greater_than', value: 100 },
          { field: 'visits', operator: 'greater_than', value: 3 }
        ]
        
        const rules2 = isHighValue ? [
          { field: 'totalSpend', operator: 'greater_than', value: 2000 },
          { field: 'visits', operator: 'greater_than', value: 8 }
        ] : isEngagement ? [
          { field: 'visits', operator: 'greater_than', value: 15 },
          { field: 'totalSpend', operator: 'greater_than', value: 500 }
        ] : isInactive ? [
          { field: 'lastOrderAt', operator: 'less_than', value: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString() },
          { field: 'totalSpend', operator: 'greater_than', value: 100 }
        ] : isNew ? [
          { field: 'totalSpend', operator: 'greater_than', value: 0 },
          { field: 'visits', operator: 'greater_than', value: 2 }
        ] : [
          { field: 'totalSpend', operator: 'greater_than', value: 500 },
          { field: 'visits', operator: 'greater_than', value: 5 }
        ]
        
        generatedSuggestions = [
          {
            id: `ai-segment-${Date.now()}-1`,
            name: segmentName1,
            description: `AI-generated segment based on: "${prompt}". This segment targets customers who match your specific criteria.`,
            rules: rules1,
            estimatedCount: isHighValue ? Math.floor(Math.random() * 50) + 10 : 
                          isEngagement ? Math.floor(Math.random() * 80) + 20 :
                          isInactive ? Math.floor(Math.random() * 120) + 30 :
                          Math.floor(Math.random() * 100) + 15,
            confidence: Math.floor(Math.random() * 20) + 80,
            prompt: prompt
          },
          {
            id: `ai-segment-${Date.now()}-2`,
            name: segmentName2,
            description: `Advanced segment targeting: "${prompt}". This segment uses more specific criteria for better targeting.`,
            rules: rules2,
            estimatedCount: isHighValue ? Math.floor(Math.random() * 30) + 5 : 
                          isEngagement ? Math.floor(Math.random() * 60) + 10 :
                          isInactive ? Math.floor(Math.random() * 80) + 20 :
                          Math.floor(Math.random() * 70) + 10,
            confidence: Math.floor(Math.random() * 15) + 85,
            prompt: prompt
          }
        ]
      } else {
        // Generate intelligent campaign names and content based on prompt
        const campaignName1 = isRetention ? `${prompt} Retention Campaign` :
                             isAcquisition ? `${prompt} Acquisition Campaign` :
                             isHighValue ? `Premium ${prompt} Campaign` :
                             isEngagement ? `Engagement ${prompt} Campaign` :
                             `${prompt} Campaign`
        
        const campaignName2 = isRetention ? `Advanced ${prompt} Retention Strategy` :
                             isAcquisition ? `Smart ${prompt} Acquisition Drive` :
                             isHighValue ? `Elite ${prompt} Experience` :
                             isEngagement ? `Interactive ${prompt} Campaign` :
                             `Strategic ${prompt} Campaign`
        
        // Generate intelligent messages based on prompt
        const message1 = isRetention ? 
          `🔄 ${prompt} Retention Campaign\n\nWe noticed you haven't been active lately, and we miss you! We've prepared something special to welcome you back.\n\n✨ Exclusive ${prompt.toLowerCase()} offers\n🎁 Special discounts just for you\n📞 Personal support when you need it\n\nCome back and rediscover what makes us special!` :
          isAcquisition ?
          `🚀 ${prompt} Acquisition Campaign\n\nWelcome to our community! We're excited to help you discover the amazing benefits of ${prompt.toLowerCase()}.\n\n🎯 Personalized recommendations\n💡 Expert insights and tips\n🎉 Exclusive member benefits\n\nStart your journey with us today!` :
          isHighValue ?
          `💎 Premium ${prompt} Experience\n\nAs one of our valued customers, you deserve the very best. That's why we've created this exclusive ${prompt.toLowerCase()} experience just for you.\n\n🌟 VIP treatment and benefits\n🎁 Exclusive offers and rewards\n📞 Dedicated support team\n\nExperience the difference that premium service makes!` :
          `🎯 ${prompt} Campaign\n\nWe've crafted this campaign specifically for you based on your interests in ${prompt.toLowerCase()}.\n\n✨ Personalized content\n📊 Data-driven insights\n🎁 Special offers\n\nDiscover what we have in store for you!`
        
        const message2 = isRetention ?
          `🔄 Advanced ${prompt} Retention Strategy\n\nWe understand that every customer is unique. This advanced campaign is designed to re-engage you with personalized content and offers.\n\n📈 Behavioral insights\n🎯 Targeted recommendations\n💝 Exclusive retention offers\n\nLet's rebuild our relationship together!` :
          isAcquisition ?
          `🚀 Smart ${prompt} Acquisition Drive\n\nJoin thousands of satisfied customers who have discovered the power of ${prompt.toLowerCase()}. This intelligent campaign adapts to your needs.\n\n🤖 AI-powered personalization\n📊 Real-time optimization\n🎯 Precise targeting\n\nExperience the future of customer engagement!` :
          isHighValue ?
          `💎 Elite ${prompt} Experience\n\nYou're not just a customer - you're part of our elite community. This campaign reflects the premium service you deserve.\n\n👑 Exclusive access\n🎁 Premium rewards\n📞 Concierge support\n\nIndulge in the luxury you've earned!` :
          `🎯 Strategic ${prompt} Campaign\n\nThis campaign combines data science with creative marketing to deliver exactly what you need for ${prompt.toLowerCase()}.\n\n📊 Advanced analytics\n🎨 Creative optimization\n🎯 Precision targeting\n\nExperience marketing that truly understands you!`
        
        generatedSuggestions = [
          {
            id: `ai-campaign-${Date.now()}-1`,
            name: campaignName1,
            description: `AI-generated campaign for: "${prompt}". This campaign is designed to achieve your specific goals.`,
            type: 'Email',
            targetSegment: isHighValue ? 'Premium Customers' : isEngagement ? 'Engaged Users' : 'All Customers',
            estimatedRecipients: isHighValue ? Math.floor(Math.random() * 200) + 50 :
                                 isEngagement ? Math.floor(Math.random() * 400) + 100 :
                                 Math.floor(Math.random() * 500) + 150,
            confidence: Math.floor(Math.random() * 20) + 80,
            message: message1,
            subject: isRetention ? `We Miss You - ${prompt} Special Offer` :
                    isAcquisition ? `Welcome to ${prompt} - Your Journey Starts Here` :
                    isHighValue ? `Exclusive ${prompt} Experience Awaits You` :
                    `Your ${prompt} Campaign is Ready`,
            prompt: prompt
          },
          {
            id: `ai-campaign-${Date.now()}-2`,
            name: campaignName2,
            description: `Advanced campaign targeting: "${prompt}". This campaign uses sophisticated AI to maximize engagement.`,
            type: 'Email',
            targetSegment: isHighValue ? 'Elite Members' : isEngagement ? 'Active Community' : 'Engaged Users',
            estimatedRecipients: isHighValue ? Math.floor(Math.random() * 150) + 25 :
                                 isEngagement ? Math.floor(Math.random() * 300) + 75 :
                                 Math.floor(Math.random() * 350) + 100,
            confidence: Math.floor(Math.random() * 15) + 85,
            message: message2,
            subject: isRetention ? `Advanced ${prompt} Strategy - Let's Reconnect` :
                    isAcquisition ? `Smart ${prompt} Drive - Join the Future` :
                    isHighValue ? `Elite ${prompt} Experience - Luxury Awaits` :
                    `Strategic ${prompt} Campaign - Precision Marketing`,
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-scale-in transform translate-y-0">
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
