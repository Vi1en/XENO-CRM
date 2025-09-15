import React, { useState, useEffect } from 'react';
import { aiApi } from '@/lib/api';

interface AIInsight {
  type: 'trend' | 'anomaly' | 'recommendation' | 'warning';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
}

interface AIRecommendation {
  type: 'optimization' | 'growth' | 'retention' | 'engagement';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

interface AIPredictiveInsight {
  type: 'forecast' | 'trend' | 'anomaly' | 'opportunity';
  confidence: number;
  title: string;
  description: string;
  timeframe: string;
  data: any;
}

interface AIHealthStatus {
  status: 'healthy' | 'degraded' | 'offline';
  apiAvailable: boolean;
  fallbackMode: string;
  circuitBreakerOpen: boolean;
  lastFailure?: Date;
  failureCount: number;
  metrics: {
    totalRequests: number;
    successRate: string;
    averageResponseTime: string;
    uptime: string;
  };
}

interface DashboardInsights {
  aiHealth: AIHealthStatus;
  performanceMetrics: {
    totals: { customers: number; campaigns: number; orders: number };
    recentActivity: { customers: number; campaigns: number; orders: number };
    growthRates: { customers: number; campaigns: number; orders: number };
  };
  smartRecommendations: AIRecommendation[];
  predictiveInsights: AIPredictiveInsight[];
  systemStatus: string;
}

const AIInsightsDashboard: React.FC = () => {
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadInsights = async () => {
    try {
      setError(null);
      const response = await aiApi.getDashboardInsights();
      setInsights(response.data);
    } catch (err: any) {
      console.error('Error loading AI insights:', err);
      setError('Failed to load AI insights');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">AI Insights Unavailable</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Insights Dashboard</h2>
          <p className="text-gray-600">Intelligent analytics and recommendations powered by AI</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(insights.aiHealth.status)}`}>
              {insights.aiHealth.status.toUpperCase()}
            </div>
            <p className="text-sm text-gray-600 mt-1">AI Service Status</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{insights.aiHealth.metrics.successRate}</div>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{insights.aiHealth.metrics.averageResponseTime}</div>
            <p className="text-sm text-gray-600">Avg Response Time</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{insights.systemStatus}</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Total Counts</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Customers:</span>
                <span className="font-semibold">{insights.performanceMetrics.totals.customers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Campaigns:</span>
                <span className="font-semibold">{insights.performanceMetrics.totals.campaigns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Orders:</span>
                <span className="font-semibold">{insights.performanceMetrics.totals.orders}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Recent Activity (7 days)</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">New Customers:</span>
                <span className="font-semibold">{insights.performanceMetrics.recentActivity.customers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Campaigns:</span>
                <span className="font-semibold">{insights.performanceMetrics.recentActivity.campaigns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New Orders:</span>
                <span className="font-semibold">{insights.performanceMetrics.recentActivity.orders}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">Growth Rates</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Customers:</span>
                <span className={`font-semibold ${insights.performanceMetrics.growthRates.customers >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {insights.performanceMetrics.growthRates.customers >= 0 ? '+' : ''}{insights.performanceMetrics.growthRates.customers}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Campaigns:</span>
                <span className={`font-semibold ${insights.performanceMetrics.growthRates.campaigns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {insights.performanceMetrics.growthRates.campaigns >= 0 ? '+' : ''}{insights.performanceMetrics.growthRates.campaigns}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Orders:</span>
                <span className={`font-semibold ${insights.performanceMetrics.growthRates.orders >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {insights.performanceMetrics.growthRates.orders >= 0 ? '+' : ''}{insights.performanceMetrics.growthRates.orders}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Smart Recommendations</h3>
        <div className="space-y-4">
          {insights.smartRecommendations.map((rec, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{rec.title}</h4>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(rec.priority)}`}>
                    {rec.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(rec.impact)}`}>
                    {rec.impact.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">{rec.description}</p>
              <div className="text-sm">
                <p className="text-gray-700"><strong>Action:</strong> {rec.action}</p>
                <p className="text-gray-700"><strong>Impact:</strong> {rec.impact}</p>
                <p className="text-gray-700"><strong>Effort:</strong> {rec.effort}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Insights</h3>
        <div className="space-y-4">
          {insights.predictiveInsights.map((insight, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-900">{insight.title}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Confidence: {Math.round(insight.confidence * 100)}%</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${insight.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">{insight.description}</p>
              <p className="text-xs text-gray-500">Timeframe: {insight.timeframe}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsightsDashboard;
