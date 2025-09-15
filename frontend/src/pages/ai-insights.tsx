import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import PageTransition from '@/components/PageTransition'
import SkeletonLoader from '@/components/SkeletonLoader'
import SmoothButton from '@/components/SmoothButton'
import Navigation from '@/components/Navigation'

export default function AIInsights() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [aiData, setAiData] = useState<any>(null)

  // Simple authentication check
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('xeno-user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          setUser(userData)
          setIsAuthenticated(true)
          loadAIData()
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

  const loadAIData = async () => {
    setLoading(true)
    try {
      // Simulate AI data loading
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockAIData = {
        insights: [
          {
            id: 1,
            title: "Customer Segmentation Optimization",
            description: "AI suggests creating a new segment for high-value customers who haven't purchased in 30 days",
            confidence: 92,
            impact: "High",
            category: "Segmentation"
          },
          {
            id: 2,
            title: "Campaign Timing Recommendation",
            description: "Optimal send time for your campaigns is Tuesday 2-4 PM based on historical data",
            confidence: 87,
            impact: "Medium",
            category: "Campaigns"
          },
          {
            id: 3,
            title: "Content Personalization",
            description: "Personalized subject lines could increase open rates by 23%",
            confidence: 89,
            impact: "High",
            category: "Content"
          },
          {
            id: 4,
            title: "Customer Lifetime Value Prediction",
            description: "AI identified 15 customers with high churn risk and potential for increased LTV",
            confidence: 94,
            impact: "High",
            category: "Analytics"
          },
          {
            id: 5,
            title: "Email Engagement Optimization",
            description: "Segmented email campaigns show 45% higher engagement rates than broadcast campaigns",
            confidence: 91,
            impact: "Medium",
            category: "Campaigns"
          },
          {
            id: 6,
            title: "Cross-Sell Opportunity Detection",
            description: "AI found 8 product combinations with high cross-sell potential among your customers",
            confidence: 88,
            impact: "High",
            category: "Sales"
          }
        ],
        predictions: [
          {
            metric: "Customer Churn",
            current: 12,
            predicted: 8,
            trend: "decreasing",
            confidence: 85
          },
          {
            metric: "Revenue Growth",
            current: 15,
            predicted: 22,
            trend: "increasing",
            confidence: 78
          },
          {
            metric: "Email Open Rate",
            current: 24,
            predicted: 31,
            trend: "increasing",
            confidence: 82
          },
          {
            metric: "Customer Acquisition Cost",
            current: 45,
            predicted: 38,
            trend: "decreasing",
            confidence: 76
          }
        ],
        recommendations: [
          {
            action: "Create retention campaign for at-risk customers",
            priority: "High",
            effort: "Medium",
            impact: "High"
          },
          {
            action: "Optimize email timing based on AI insights",
            priority: "Medium",
            effort: "Low",
            impact: "Medium"
          },
          {
            action: "Implement personalized subject lines",
            priority: "High",
            effort: "Low",
            impact: "High"
          },
          {
            action: "Set up cross-sell campaigns for identified opportunities",
            priority: "Medium",
            effort: "High",
            impact: "High"
          },
          {
            action: "Create high-value customer segment for premium campaigns",
            priority: "Medium",
            effort: "Low",
            impact: "Medium"
          }
        ],
        aiHealth: {
          status: "healthy",
          apiAvailable: true,
          fallbackMode: "Smart Mock",
          circuitBreakerOpen: false,
          failureCount: 0,
          metrics: {
            totalRequests: 1247,
            successRate: "98.5%",
            averageResponseTime: "1.2s",
            uptime: "99.9%"
          }
        },
        performanceMetrics: {
          totals: { customers: 1247, campaigns: 23, orders: 89 },
          recentActivity: { customers: 45, campaigns: 3, orders: 12 },
          growthRates: { customers: 12, campaigns: 8, orders: 15 }
        }
      }
      
      setAiData(mockAIData)
    } catch (error) {
      console.error('Error loading AI data:', error)
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

  // Show loading state during authentication check
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
            <span className="text-white font-bold text-xl">X</span>
          </div>
          <p className="text-gray-600 animate-pulse">Loading AI insights...</p>
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
          <p className="text-gray-600 mb-6">You need to be signed in to view AI insights.</p>
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
        <title>Xeno CRM - AI Insights</title>
        <meta name="description" content="AI-powered insights and recommendations for your CRM" />
      </Head>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Navigation Sidebar */}
        <Navigation 
          currentPath="/ai-insights" 
          user={user} 
          onSignOut={handleSignOut} 
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col ml-64">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Insights</h1>
                <p className="text-gray-600">Intelligent analytics and recommendations powered by AI</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">AI Active</span>
                </div>
                <SmoothButton
                  onClick={loadAIData}
                  disabled={loading}
                  loading={loading}
                  variant="primary"
                  size="md"
                  className="animate-fade-in"
                >
                  Refresh Insights
                </SmoothButton>
              </div>
            </div>
          </div>

          {/* AI Content */}
          <div className="flex-1 p-6">
            {loading ? (
              <div className="space-y-6">
                <SkeletonLoader type="card" count={3} />
              </div>
            ) : (
              <div className="space-y-6">
                {/* AI Health Status */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">AI System Status</h2>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">Healthy</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{aiData?.aiHealth?.metrics?.successRate || '98.5%'}</div>
                      <p className="text-sm text-gray-600">Success Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{aiData?.aiHealth?.metrics?.averageResponseTime || '1.2s'}</div>
                      <p className="text-sm text-gray-600">Avg Response Time</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{aiData?.aiHealth?.metrics?.uptime || '99.9%'}</div>
                      <p className="text-sm text-gray-600">Uptime</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{aiData?.aiHealth?.metrics?.totalRequests || '1,247'}</div>
                      <p className="text-sm text-gray-600">Total Requests</p>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Total Counts</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customers:</span>
                          <span className="font-semibold">{aiData?.performanceMetrics?.totals?.customers || 1247}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Campaigns:</span>
                          <span className="font-semibold">{aiData?.performanceMetrics?.totals?.campaigns || 23}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Orders:</span>
                          <span className="font-semibold">{aiData?.performanceMetrics?.totals?.orders || 89}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Recent Activity (7 days)</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">New Customers:</span>
                          <span className="font-semibold">{aiData?.performanceMetrics?.recentActivity?.customers || 45}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">New Campaigns:</span>
                          <span className="font-semibold">{aiData?.performanceMetrics?.recentActivity?.campaigns || 3}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">New Orders:</span>
                          <span className="font-semibold">{aiData?.performanceMetrics?.recentActivity?.orders || 12}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Growth Rates</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customers:</span>
                          <span className={`font-semibold ${(aiData?.performanceMetrics?.growthRates?.customers || 12) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            +{aiData?.performanceMetrics?.growthRates?.customers || 12}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Campaigns:</span>
                          <span className={`font-semibold ${(aiData?.performanceMetrics?.growthRates?.campaigns || 8) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            +{aiData?.performanceMetrics?.growthRates?.campaigns || 8}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Orders:</span>
                          <span className={`font-semibold ${(aiData?.performanceMetrics?.growthRates?.orders || 15) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            +{aiData?.performanceMetrics?.growthRates?.orders || 15}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Smart Insights */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Smart Insights</h2>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">AI Active</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aiData?.insights.map((insight: any, index: number) => (
                      <div 
                        key={insight.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 ease-smooth-out animate-fade-in-up"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{insight.title}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            insight.impact === 'High' ? 'bg-red-100 text-red-800' :
                            insight.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {insight.impact}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{insight.category}</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-gray-600">{insight.confidence}% confidence</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Predictions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Predictions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {aiData?.predictions.map((prediction: any, index: number) => (
                      <div 
                        key={prediction.metric}
                        className="p-4 border border-gray-200 rounded-lg animate-fade-in-up"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <h3 className="font-medium text-gray-900 mb-2">{prediction.metric}</h3>
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl font-bold text-gray-900">{prediction.current}%</div>
                          <div className="flex items-center space-x-2">
                            <svg className={`w-4 h-4 ${prediction.trend === 'increasing' ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <span className="text-sm text-gray-600">Predicted: {prediction.predicted}%</span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {prediction.confidence}% confidence
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">AI Recommendations</h2>
                  <div className="space-y-4">
                    {aiData?.recommendations.map((rec: any, index: number) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300 ease-smooth-out animate-fade-in-up"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{rec.action}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                              rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {rec.priority} Priority
                            </span>
                            <span className="text-xs text-gray-500">Effort: {rec.effort}</span>
                            <span className="text-xs text-gray-500">Impact: {rec.impact}</span>
                          </div>
                        </div>
                        <SmoothButton
                          variant="primary"
                          size="sm"
                          className="ml-4"
                        >
                          Implement
                        </SmoothButton>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
