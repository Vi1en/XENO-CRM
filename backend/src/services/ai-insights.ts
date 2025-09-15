import { enhancedAI } from './ai-enhanced';
import { aiMonitor } from './ai-monitor';
import { Customer } from '../models/customer';
import { Campaign } from '../models/campaign';
import { Order } from '../models/order';

// AI Insights Dashboard Service
class AIInsightsService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  async getDashboardInsights(): Promise<{
    aiHealth: any;
    performanceMetrics: any;
    smartRecommendations: any[];
    predictiveInsights: any[];
    systemStatus: string;
  }> {
    const cacheKey = 'dashboard-insights';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log('📊 Using cached dashboard insights');
      return cached.data;
    }

    console.log('📊 Generating fresh dashboard insights');

    try {
      const [aiHealth, performanceMetrics, smartRecommendations, predictiveInsights] = await Promise.all([
        this.getAIHealthStatus(),
        this.getPerformanceMetrics(),
        this.getSmartRecommendations(),
        this.getPredictiveInsights()
      ]);

      const insights = {
        aiHealth,
        performanceMetrics,
        smartRecommendations,
        predictiveInsights,
        systemStatus: this.determineSystemStatus(aiHealth, performanceMetrics)
      };

      this.cache.set(cacheKey, { data: insights, timestamp: Date.now() });
      return insights;

    } catch (error) {
      console.error('❌ Error generating dashboard insights:', error);
      return this.getFallbackInsights();
    }
  }

  private async getAIHealthStatus() {
    const healthStatus = await enhancedAI.getHealthStatus();
    const metrics = aiMonitor.getMetrics();

    return {
      ...healthStatus,
      metrics: {
        totalRequests: metrics.totalRequests,
        successRate: `${metrics.successRate}%`,
        averageResponseTime: `${Math.round(metrics.averageResponseTime)}ms`,
        uptime: `${Math.round(metrics.uptime / 60)} minutes`
      }
    };
  }

  private async getPerformanceMetrics() {
    const [customerCount, campaignCount, orderCount] = await Promise.all([
      Customer.countDocuments(),
      Campaign.countDocuments(),
      Order.countDocuments()
    ]);

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [recentCustomers, recentCampaigns, recentOrders] = await Promise.all([
      Customer.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Campaign.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Order.countDocuments({ date: { $gte: sevenDaysAgo } })
    ]);

    // Calculate growth rates
    const customerGrowthRate = customerCount > 0 ? (recentCustomers / customerCount) * 100 : 0;
    const campaignGrowthRate = campaignCount > 0 ? (recentCampaigns / campaignCount) * 100 : 0;
    const orderGrowthRate = orderCount > 0 ? (recentOrders / orderCount) * 100 : 0;

    return {
      totals: {
        customers: customerCount,
        campaigns: campaignCount,
        orders: orderCount
      },
      recentActivity: {
        customers: recentCustomers,
        campaigns: recentCampaigns,
        orders: recentOrders
      },
      growthRates: {
        customers: Math.round(customerGrowthRate * 100) / 100,
        campaigns: Math.round(campaignGrowthRate * 100) / 100,
        orders: Math.round(orderGrowthRate * 100) / 100
      }
    };
  }

  private async getSmartRecommendations(): Promise<Array<{
    type: 'optimization' | 'growth' | 'retention' | 'engagement';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    action: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }>> {
    const recommendations = [];

    // Get data for analysis
    const [customers, campaigns] = await Promise.all([
      Customer.find().lean(),
      Campaign.find().lean()
    ]);

    // Analyze customer data
    const highValueCustomers = customers.filter(c => c.totalSpend > 1000);
    const dormantCustomers = customers.filter(c => {
      if (!c.lastOrderAt) return true;
      const daysSinceLastOrder = (Date.now() - new Date(c.lastOrderAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLastOrder > 60;
    });

    // Analyze campaign data
    const activeCampaigns = campaigns.filter(c => c.status === 'running');
    const completedCampaigns = campaigns.filter(c => c.status === 'completed');

    // Generate recommendations based on data
    if (dormantCustomers.length > customers.length * 0.2) {
      recommendations.push({
        type: 'retention',
        priority: 'high',
        title: 'Re-engage Dormant Customers',
        description: `${dormantCustomers.length} customers haven't made a purchase in 60+ days`,
        action: 'Launch a re-engagement campaign with special offers',
        impact: 'High potential revenue recovery',
        effort: 'medium'
      });
    }

    if (highValueCustomers.length > 0 && highValueCustomers.length < customers.length * 0.1) {
      recommendations.push({
        type: 'growth',
        priority: 'high',
        title: 'Expand High-Value Customer Base',
        description: `Only ${highValueCustomers.length} high-value customers identified`,
        action: 'Create targeted campaigns for customers approaching high-value threshold',
        impact: 'Significant revenue growth potential',
        effort: 'medium'
      });
    }

    if (activeCampaigns.length === 0) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        title: 'Launch New Campaigns',
        description: 'No active campaigns currently running',
        action: 'Create and launch new marketing campaigns',
        impact: 'Maintain customer engagement and drive sales',
        effort: 'low'
      });
    }

    if (completedCampaigns.length > 0) {
      const avgDeliveryRate = completedCampaigns.reduce((sum, c) => {
        const rate = c.stats?.totalRecipients > 0 ? 
          ((c.stats.delivered || 0) / c.stats.totalRecipients) * 100 : 0;
        return sum + rate;
      }, 0) / completedCampaigns.length;

      if (avgDeliveryRate < 80) {
        recommendations.push({
          type: 'optimization',
          priority: 'medium',
          title: 'Improve Campaign Delivery',
          description: `Average delivery rate is ${Math.round(avgDeliveryRate)}%`,
          action: 'Review email lists and improve deliverability',
          impact: 'Better campaign performance and ROI',
          effort: 'high'
        });
      }
    }

    // Add AI-generated recommendations
    try {
      const aiInsights = await enhancedAI.generateAnalyticsInsights();
      aiInsights.recommendations.forEach((rec, index) => {
        recommendations.push({
          type: 'optimization',
          priority: 'medium',
          title: `AI Recommendation ${index + 1}`,
          description: rec,
          action: 'Review and implement based on AI analysis',
          impact: 'Data-driven optimization',
          effort: 'medium'
        });
      });
    } catch (error) {
      console.log('📊 Using fallback recommendations due to AI service unavailability');
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  private async getPredictiveInsights(): Promise<Array<{
    type: 'forecast' | 'trend' | 'anomaly' | 'opportunity';
    confidence: number;
    title: string;
    description: string;
    timeframe: string;
    data: any;
  }>> {
    const insights = [];

    // Get historical data for trends
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentOrders, recentCampaigns] = await Promise.all([
      Order.find({ date: { $gte: thirtyDaysAgo } }).lean(),
      Campaign.find({ createdAt: { $gte: thirtyDaysAgo } }).lean()
    ]);

    // Calculate revenue trend
    const totalRevenue = recentOrders.reduce((sum, order) => sum + (order.totalSpent || 0), 0);
    const avgDailyRevenue = totalRevenue / 30;

    if (avgDailyRevenue > 0) {
      insights.push({
        type: 'forecast',
        confidence: 0.8,
        title: 'Revenue Forecast',
        description: `Based on recent trends, projected monthly revenue is $${Math.round(avgDailyRevenue * 30).toLocaleString()}`,
        timeframe: 'Next 30 days',
        data: { projectedRevenue: Math.round(avgDailyRevenue * 30) }
      });
    }

    // Campaign performance trend
    if (recentCampaigns.length > 0) {
      const avgDeliveryRate = recentCampaigns.reduce((sum, c) => {
        const rate = c.stats?.totalRecipients > 0 ? 
          ((c.stats.delivered || 0) / c.stats.totalRecipients) * 100 : 0;
        return sum + rate;
      }, 0) / recentCampaigns.length;

      insights.push({
        type: 'trend',
        confidence: 0.85,
        title: 'Campaign Performance Trend',
        description: `Average delivery rate is ${Math.round(avgDeliveryRate)}% across recent campaigns`,
        timeframe: 'Last 30 days',
        data: { deliveryRate: Math.round(avgDeliveryRate) }
      });
    }

    // Customer acquisition trend
    const customerCount = await Customer.countDocuments();
    const recentCustomerCount = await Customer.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });

    if (recentCustomerCount > 0) {
      const acquisitionRate = (recentCustomerCount / 30) * 30; // Projected monthly
      
      insights.push({
        type: 'forecast',
        confidence: 0.75,
        title: 'Customer Acquisition Forecast',
        description: `Projected ${Math.round(acquisitionRate)} new customers this month`,
        timeframe: 'Next 30 days',
        data: { projectedCustomers: Math.round(acquisitionRate) }
      });
    }

    return insights;
  }

  private determineSystemStatus(aiHealth: any, performanceMetrics: any): string {
    if (aiHealth.status === 'offline') {
      return 'AI services offline - using fallback responses';
    } else if (aiHealth.status === 'degraded') {
      return 'AI services degraded - some features may be limited';
    } else if (performanceMetrics.growthRates.customers < 0) {
      return 'Customer growth declining - attention needed';
    } else if (performanceMetrics.growthRates.orders < 0) {
      return 'Order volume declining - review campaigns';
    } else {
      return 'All systems operational';
    }
  }

  private getFallbackInsights() {
    return {
      aiHealth: {
        status: 'offline',
        apiAvailable: false,
        fallbackMode: 'smart',
        circuitBreakerOpen: false,
        failureCount: 0,
        metrics: {
          totalRequests: 0,
          successRate: '0%',
          averageResponseTime: '0ms',
          uptime: '0 minutes'
        }
      },
      performanceMetrics: {
        totals: { customers: 0, campaigns: 0, orders: 0 },
        recentActivity: { customers: 0, campaigns: 0, orders: 0 },
        growthRates: { customers: 0, campaigns: 0, orders: 0 }
      },
      smartRecommendations: [{
        type: 'optimization',
        priority: 'medium',
        title: 'System Initialization',
        description: 'AI services are being initialized',
        action: 'Please wait for system to fully load',
        impact: 'Normal operation will resume shortly',
        effort: 'low'
      }],
      predictiveInsights: [{
        type: 'forecast',
        confidence: 0.5,
        title: 'System Loading',
        description: 'AI insights are being generated',
        timeframe: 'Next few minutes',
        data: {}
      }],
      systemStatus: 'Initializing AI services'
    };
  }

  clearCache() {
    this.cache.clear();
    console.log('📊 AI Insights cache cleared');
  }
}

// Export singleton instance
export const aiInsights = new AIInsightsService();
