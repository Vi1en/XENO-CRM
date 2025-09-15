import React, { useState, useEffect } from 'react';
import { aiApi } from '@/lib/api';

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

const AIStatusIndicator: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<AIHealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHealthStatus = async () => {
    try {
      setError(null);
      const response = await aiApi.getHealthStatus();
      setHealthStatus(response.data);
    } catch (err: any) {
      console.error('Error loading AI health status:', err);
      setError('Failed to load AI status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealthStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadHealthStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'offline': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'degraded': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'offline': 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default: 
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'healthy': return 'AI services are running optimally';
      case 'degraded': return 'AI services are using fallback responses';
      case 'offline': return 'AI services are offline - using smart mock responses';
      default: return 'AI services status unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
        <span className="text-sm">Checking AI status...</span>
      </div>
    );
  }

  if (error || !healthStatus) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span className="text-sm">AI status unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Status Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(healthStatus.status)}`}>
          {getStatusIcon(healthStatus.status)}
          <span className="ml-1">{healthStatus.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="hidden md:flex items-center space-x-4 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <span>Success:</span>
          <span className="font-medium">{healthStatus.metrics.successRate}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>Response:</span>
          <span className="font-medium">{healthStatus.metrics.averageResponseTime}</span>
        </div>
        <div className="flex items-center space-x-1">
          <span>Uptime:</span>
          <span className="font-medium">{healthStatus.metrics.uptime}</span>
        </div>
      </div>

      {/* Tooltip with detailed info */}
      <div className="relative group">
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        {/* Tooltip */}
        <div className="absolute right-0 top-6 w-80 bg-white rounded-lg shadow-lg border p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900">AI Service Status</h4>
              <p className="text-sm text-gray-600">{getStatusMessage(healthStatus.status)}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">API Available:</span>
                <span className={healthStatus.apiAvailable ? 'text-green-600' : 'text-red-600'}>
                  {healthStatus.apiAvailable ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fallback Mode:</span>
                <span className="text-gray-900">{healthStatus.fallbackMode}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Circuit Breaker:</span>
                <span className={healthStatus.circuitBreakerOpen ? 'text-red-600' : 'text-green-600'}>
                  {healthStatus.circuitBreakerOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Requests:</span>
                <span className="text-gray-900">{healthStatus.metrics.totalRequests}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Failure Count:</span>
                <span className="text-gray-900">{healthStatus.failureCount}</span>
              </div>
              {healthStatus.lastFailure && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Failure:</span>
                  <span className="text-gray-900">
                    {new Date(healthStatus.lastFailure).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStatusIndicator;
