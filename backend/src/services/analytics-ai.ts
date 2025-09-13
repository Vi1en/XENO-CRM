import { ICustomer } from '../models/customer';
import { ICampaign } from '../models/campaign';
import { IOrder } from '../models/order';

export interface AnalyticsInsight {
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  value?: string | number;
  trend?: 'up' | 'down' | 'stable';
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  vipCustomers: number;
  averageOrderValue: number;
  customerRetentionRate: number;
  topCustomerSegments: ChartData[];
  customerGrowthTrend: TimeSeriesData[];
}

export interface CampaignAnalytics {
  totalCampaigns: number;
  activeCampaigns: number;
  averageDeliveryRate: number;
  totalMessagesSent: number;
  campaignPerformance: ChartData[];
  deliveryTrends: TimeSeriesData[];
}

export interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersThisMonth: number;
  revenueGrowth: number;
  topProducts: ChartData[];
  revenueTrend: TimeSeriesData[];
}

export interface DashboardInsights {
  insights: AnalyticsInsight[];
  customerAnalytics: CustomerAnalytics;
  campaignAnalytics: CampaignAnalytics;
  orderAnalytics: OrderAnalytics;
}

export class AnalyticsAIService {
  static generateInsights(
    customers: ICustomer[],
    campaigns: ICampaign[],
    orders: IOrder[]
  ): DashboardInsights {
    const insights: AnalyticsInsight[] = [];
    
    // Customer insights
    const totalCustomers = customers.length;
    const vipCustomers = customers.filter(c => c.totalSpend >= 1000).length;
    const newCustomersThisMonth = customers.filter(c => {
      const createdDate = new Date(c.createdAt);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear();
    }).length;

    if (vipCustomers > 0) {
      insights.push({
        title: 'VIP Customer Base',
        description: `You have ${vipCustomers} VIP customers (${Math.round((vipCustomers/totalCustomers)*100)}% of total)`,
        type: 'positive',
        value: vipCustomers,
        trend: 'up'
      });
    }

    if (newCustomersThisMonth > 0) {
      insights.push({
        title: 'New Customer Growth',
        description: `${newCustomersThisMonth} new customers joined this month`,
        type: 'positive',
        value: newCustomersThisMonth,
        trend: 'up'
      });
    }

    // Campaign insights
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'running').length;
    const totalMessagesSent = campaigns.reduce((sum, c) => sum + c.stats.sent, 0);
    const averageDeliveryRate = campaigns.length > 0 
      ? campaigns.reduce((sum, c) => {
          const total = c.stats.sent + c.stats.failed;
          return total > 0 ? sum + (c.stats.delivered / total) : sum;
        }, 0) / campaigns.length
      : 0;

    if (averageDeliveryRate > 0.8) {
      insights.push({
        title: 'Excellent Delivery Rate',
        description: `Your campaigns have a ${Math.round(averageDeliveryRate * 100)}% delivery rate`,
        type: 'positive',
        value: `${Math.round(averageDeliveryRate * 100)}%`,
        trend: 'up'
      });
    } else if (averageDeliveryRate < 0.5) {
      insights.push({
        title: 'Low Delivery Rate',
        description: `Your campaigns have a ${Math.round(averageDeliveryRate * 100)}% delivery rate. Consider reviewing your targeting.`,
        type: 'warning',
        value: `${Math.round(averageDeliveryRate * 100)}%`,
        trend: 'down'
      });
    }

    // Order insights
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalSpent, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const ordersThisMonth = orders.filter(o => {
      const orderDate = new Date(o.date);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && 
             orderDate.getFullYear() === now.getFullYear();
    }).length;

    if (averageOrderValue > 100) {
      insights.push({
        title: 'High Average Order Value',
        description: `Your average order value is $${Math.round(averageOrderValue)}`,
        type: 'positive',
        value: `$${Math.round(averageOrderValue)}`,
        trend: 'up'
      });
    }

    // Generate analytics data
    const customerAnalytics = this.generateCustomerAnalytics(customers);
    const campaignAnalytics = this.generateCampaignAnalytics(campaigns);
    const orderAnalytics = this.generateOrderAnalytics(orders);

    return {
      insights,
      customerAnalytics,
      campaignAnalytics,
      orderAnalytics
    };
  }

  private static generateCustomerAnalytics(customers: ICustomer[]): CustomerAnalytics {
    const totalCustomers = customers.length;
    const newCustomersThisMonth = customers.filter(c => {
      const createdDate = new Date(c.createdAt);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear();
    }).length;

    const vipCustomers = customers.filter(c => c.totalSpend >= 1000).length;
    const premiumCustomers = customers.filter(c => c.totalSpend >= 500 && c.totalSpend < 1000).length;
    const regularCustomers = customers.filter(c => c.totalSpend < 500).length;

    const averageOrderValue = customers.length > 0 
      ? customers.reduce((sum, c) => sum + c.totalSpend, 0) / customers.length 
      : 0;

    const customerRetentionRate = customers.length > 0 
      ? customers.filter(c => c.visits > 1).length / customers.length 
      : 0;

    // Generate growth trend (last 6 months)
    const growthTrend: TimeSeriesData[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthCustomers = customers.filter(c => {
        const createdDate = new Date(c.createdAt);
        return createdDate.getMonth() === date.getMonth() && 
               createdDate.getFullYear() === date.getFullYear();
      }).length;
      
      growthTrend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: monthCustomers,
        label: `${monthCustomers} new customers`
      });
    }

    return {
      totalCustomers,
      newCustomersThisMonth,
      vipCustomers,
      averageOrderValue,
      customerRetentionRate,
      topCustomerSegments: [
        { name: 'VIP Customers', value: vipCustomers, color: '#8B5CF6' },
        { name: 'Premium Customers', value: premiumCustomers, color: '#3B82F6' },
        { name: 'Regular Customers', value: regularCustomers, color: '#10B981' }
      ],
      customerGrowthTrend: growthTrend
    };
  }

  private static generateCampaignAnalytics(campaigns: ICampaign[]): CampaignAnalytics {
    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'running').length;
    const totalMessagesSent = campaigns.reduce((sum, c) => sum + c.stats.sent, 0);
    const totalDelivered = campaigns.reduce((sum, c) => sum + c.stats.delivered, 0);
    const totalFailed = campaigns.reduce((sum, c) => sum + c.stats.failed, 0);
    
    const averageDeliveryRate = totalMessagesSent > 0 ? totalDelivered / totalMessagesSent : 0;

    // Campaign performance by status
    const statusCounts = campaigns.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const campaignPerformance: ChartData[] = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: this.getStatusColor(status)
    }));

    // Delivery trends (last 6 months)
    const deliveryTrends: TimeSeriesData[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthCampaigns = campaigns.filter(c => {
        const createdDate = new Date(c.createdAt);
        return createdDate.getMonth() === date.getMonth() && 
               createdDate.getFullYear() === date.getFullYear();
      });
      
      const monthDelivered = monthCampaigns.reduce((sum, c) => sum + c.stats.delivered, 0);
      const monthSent = monthCampaigns.reduce((sum, c) => sum + c.stats.sent, 0);
      const deliveryRate = monthSent > 0 ? monthDelivered / monthSent : 0;
      
      deliveryTrends.push({
        date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: Math.round(deliveryRate * 100),
        label: `${Math.round(deliveryRate * 100)}% delivery rate`
      });
    }

    return {
      totalCampaigns,
      activeCampaigns,
      averageDeliveryRate,
      totalMessagesSent,
      campaignPerformance,
      deliveryTrends
    };
  }

  private static generateOrderAnalytics(orders: IOrder[]): OrderAnalytics {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalSpent, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const ordersThisMonth = orders.filter(o => {
      const orderDate = new Date(o.date);
      const now = new Date();
      return orderDate.getMonth() === now.getMonth() && 
             orderDate.getFullYear() === now.getFullYear();
    }).length;

    const lastMonthOrders = orders.filter(o => {
      const orderDate = new Date(o.date);
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      return orderDate.getMonth() === lastMonth.getMonth() && 
             orderDate.getFullYear() === lastMonth.getFullYear();
    }).length;

    const revenueGrowth = lastMonthOrders > 0 
      ? ((ordersThisMonth - lastMonthOrders) / lastMonthOrders) * 100 
      : 0;

    // Top products (simulated based on order amounts)
    const orderRanges = [
      { name: '$0-50', min: 0, max: 50, count: 0 },
      { name: '$50-100', min: 50, max: 100, count: 0 },
      { name: '$100-500', min: 100, max: 500, count: 0 },
      { name: '$500+', min: 500, max: Infinity, count: 0 }
    ];

    orders.forEach(order => {
      const range = orderRanges.find(r => order.totalSpent >= r.min && order.totalSpent < r.max);
      if (range) range.count++;
    });

    const topProducts: ChartData[] = orderRanges
      .filter(r => r.count > 0)
      .map(r => ({
        name: r.name,
        value: r.count,
        color: this.getOrderRangeColor(r.name)
      }));

    // Revenue trend (last 6 months)
    const revenueTrend: TimeSeriesData[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.date);
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });
      
      const monthRevenue = monthOrders.reduce((sum, o) => sum + o.totalSpent, 0);
      
      revenueTrend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        value: monthRevenue,
        label: `$${monthRevenue} revenue`
      });
    }

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersThisMonth,
      revenueGrowth,
      topProducts,
      revenueTrend
    };
  }

  private static getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'draft': '#6B7280',
      'scheduled': '#F59E0B',
      'running': '#10B981',
      'paused': '#F59E0B',
      'completed': '#3B82F6',
      'cancelled': '#EF4444'
    };
    return colors[status] || '#6B7280';
  }

  private static getOrderRangeColor(range: string): string {
    const colors: Record<string, string> = {
      '$0-50': '#10B981',
      '$50-100': '#3B82F6',
      '$100-500': '#8B5CF6',
      '$500+': '#F59E0B'
    };
    return colors[range] || '#6B7280';
  }
}
