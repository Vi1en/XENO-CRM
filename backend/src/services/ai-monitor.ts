import { enhancedAI } from './ai-enhanced';

// AI Health Monitoring Service
class AIMonitor {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastHealthCheck: Date | null;
  } = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    lastHealthCheck: null
  };

  private responseTimes: number[] = [];

  constructor() {
    this.startHealthMonitoring();
  }

  private startHealthMonitoring() {
    // Health check every 5 minutes
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 5 * 60 * 1000);

    console.log('🔍 AI Health Monitor started');
  }

  private async performHealthCheck() {
    try {
      const startTime = Date.now();
      const healthStatus = await enhancedAI.getHealthStatus();
      const responseTime = Date.now() - startTime;

      this.responseTimes.push(responseTime);
      if (this.responseTimes.length > 100) {
        this.responseTimes = this.responseTimes.slice(-100); // Keep only last 100 measurements
      }

      this.metrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
      this.metrics.lastHealthCheck = new Date();

      console.log('🔍 AI Health Check:', {
        status: healthStatus.status,
        apiAvailable: healthStatus.apiAvailable,
        circuitBreakerOpen: healthStatus.circuitBreakerOpen,
        responseTime: `${responseTime}ms`,
        averageResponseTime: `${Math.round(this.metrics.averageResponseTime)}ms`
      });

      // Alert if health is degraded
      if (healthStatus.status === 'degraded') {
        console.warn('⚠️ AI Service is in degraded mode - using fallback responses');
      } else if (healthStatus.status === 'offline') {
        console.error('🚨 AI Service is offline - circuit breaker open');
      }

    } catch (error) {
      console.error('❌ AI Health Check failed:', error);
      this.metrics.failedRequests++;
    }
  }

  recordRequest(success: boolean, responseTime: number) {
    this.metrics.totalRequests++;
    if (success) {
      this.metrics.successfulRequests++;
    } else {
      this.metrics.failedRequests++;
    }

    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 100) {
      this.responseTimes = this.responseTimes.slice(-100);
    }

    this.metrics.averageResponseTime = this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }

  getMetrics() {
    const successRate = this.metrics.totalRequests > 0 
      ? (this.metrics.successfulRequests / this.metrics.totalRequests) * 100 
      : 0;

    return {
      ...this.metrics,
      successRate: Math.round(successRate * 100) / 100,
      uptime: this.metrics.lastHealthCheck ? 
        Math.round((Date.now() - this.metrics.lastHealthCheck.getTime()) / 1000) : 0
    };
  }

  stop() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    console.log('🛑 AI Health Monitor stopped');
  }
}

// Export singleton instance
export const aiMonitor = new AIMonitor();

// Graceful shutdown
process.on('SIGINT', () => {
  aiMonitor.stop();
});

process.on('SIGTERM', () => {
  aiMonitor.stop();
});
