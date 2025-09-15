// Demo mode API - no actual API calls
// This file provides mock API functions for demo purposes

// Mock data for demo mode
const mockCustomers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+1-555-0123', status: 'active', createdAt: '2024-01-01' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '+1-555-0124', status: 'active', createdAt: '2024-01-02' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '+1-555-0125', status: 'inactive', createdAt: '2024-01-03' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', phone: '+1-555-0126', status: 'active', createdAt: '2024-01-04' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', phone: '+1-555-0127', status: 'active', createdAt: '2024-01-05' },
];

const mockCampaigns = [
  { id: 1, name: 'Welcome Campaign', status: 'active', sent: 150, delivered: 145, opened: 120, clicked: 45 },
  { id: 2, name: 'Product Launch', status: 'active', sent: 200, delivered: 195, opened: 160, clicked: 60 },
  { id: 3, name: 'Holiday Sale', status: 'completed', sent: 300, delivered: 290, opened: 200, clicked: 80 },
];

const mockOrders = [
  { id: 1, customerId: 1, amount: 99.99, status: 'completed', createdAt: '2024-01-10' },
  { id: 2, customerId: 2, amount: 149.99, status: 'pending', createdAt: '2024-01-11' },
  { id: 3, customerId: 3, amount: 79.99, status: 'completed', createdAt: '2024-01-12' },
];

const mockSegments = [
  { id: 1, name: 'High Value Customers', criteria: 'orders > 100', customerCount: 25 },
  { id: 2, name: 'New Customers', criteria: 'created_at > 30 days ago', customerCount: 15 },
  { id: 3, name: 'Inactive Customers', criteria: 'last_order < 90 days ago', customerCount: 8 },
];

// Mock API functions
export const customerApi = {
  getAll: async () => {
    console.log('📊 Demo Mode: Returning mock customers');
    return { data: mockCustomers };
  },
  getById: async (id: number) => {
    const customer = mockCustomers.find(c => c.id === id);
    return { data: customer };
  },
  create: async (data: any) => {
    console.log('📊 Demo Mode: Creating customer', data);
    return { data: { id: Date.now(), ...data } };
  },
  update: async (id: number, data: any) => {
    console.log('📊 Demo Mode: Updating customer', id, data);
    return { data: { id, ...data } };
  },
  delete: async (id: number) => {
    console.log('📊 Demo Mode: Deleting customer', id);
    return { data: { success: true } };
  },
  getAnalytics: async () => {
    return {
      data: {
        total: mockCustomers.length,
        active: mockCustomers.filter(c => c.status === 'active').length,
        inactive: mockCustomers.filter(c => c.status === 'inactive').length,
        growth: 12.5,
        retention: 85.2
      }
    };
  }
};

export const campaignApi = {
  getAll: async () => {
    console.log('📊 Demo Mode: Returning mock campaigns');
    return { data: mockCampaigns };
  },
  getById: async (id: number) => {
    const campaign = mockCampaigns.find(c => c.id === id);
    return { data: campaign };
  },
  create: async (data: any) => {
    console.log('📊 Demo Mode: Creating campaign', data);
    return { data: { id: Date.now(), ...data } };
  },
  update: async (id: number, data: any) => {
    console.log('📊 Demo Mode: Updating campaign', id, data);
    return { data: { id, ...data } };
  },
  delete: async (id: number) => {
    console.log('📊 Demo Mode: Deleting campaign', id);
    return { data: { success: true } };
  },
  getDeliveryStats: async () => {
    return {
      data: {
        totalSent: 650,
        delivered: 630,
        opened: 480,
        clicked: 185,
        deliveryRate: 96.9,
        openRate: 76.2,
        clickRate: 28.5
      }
    };
  }
};

export const orderApi = {
  getAll: async () => {
    console.log('📊 Demo Mode: Returning mock orders');
    return { data: mockOrders };
  },
  getById: async (id: number) => {
    const order = mockOrders.find(o => o.id === id);
    return { data: order };
  },
  create: async (data: any) => {
    console.log('📊 Demo Mode: Creating order', data);
    return { data: { id: Date.now(), ...data } };
  },
  update: async (id: number, data: any) => {
    console.log('📊 Demo Mode: Updating order', id, data);
    return { data: { id, ...data } };
  },
  delete: async (id: number) => {
    console.log('📊 Demo Mode: Deleting order', id);
    return { data: { success: true } };
  },
  getTrends: async () => {
    return {
      data: {
        revenue: 329.97,
        growth: 15.3,
        averageOrderValue: 109.99,
        totalOrders: 3
      }
    };
  }
};

export const segmentApi = {
  getAll: async () => {
    console.log('📊 Demo Mode: Returning mock segments');
    return { data: mockSegments };
  },
  getById: async (id: number) => {
    const segment = mockSegments.find(s => s.id === id);
    return { data: segment };
  },
  create: async (data: any) => {
    console.log('📊 Demo Mode: Creating segment', data);
    return { data: { id: Date.now(), ...data } };
  },
  update: async (id: number, data: any) => {
    console.log('📊 Demo Mode: Updating segment', id, data);
    return { data: { id, ...data } };
  },
  delete: async (id: number) => {
    console.log('📊 Demo Mode: Deleting segment', id);
    return { data: { success: true } };
  }
};

export const aiApi = {
  getInsights: async () => {
    return {
      data: {
        insights: [
          'Customer engagement increased by 15% this month',
          'Email campaigns show 25% higher open rates on weekends',
          'Product recommendations could improve conversion by 30%'
        ],
        recommendations: [
          'Focus on weekend email campaigns',
          'Implement personalized product recommendations',
          'Target high-value customer segments'
        ]
      }
    };
  }
};

// Export mock data for direct use
export { mockCustomers, mockCampaigns, mockOrders, mockSegments };