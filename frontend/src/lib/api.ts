import axios from 'axios';

// API base configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Customer API functions
export const customerApi = {
  // Get all customers
  getAll: () => api.get('/customers'),
  
  // Get customer by ID
  getById: (id: string) => api.get(`/customers/${id}`),
  
  // Create customer
  create: (data: any) => api.post('/ingest/customers', data),
  
  // Update customer
  update: (id: string, data: any) => api.put(`/customers/${id}`, data),
  
  // Delete customer
  delete: (id: string) => api.delete(`/customers/${id}`),
};

// Segment API functions
export const segmentApi = {
  // Get all segments
  getAll: () => api.get('/segments'),
  
  // Get segment by ID
  getById: (id: string) => api.get(`/segments/${id}`),
  
  // Create segment
  create: (data: any) => api.post('/segments', data),
  
  // Preview segment
  preview: (data: any) => api.post('/segments/preview', data),
  
  // Update segment
  update: (id: string, data: any) => api.put(`/segments/${id}`, data),
  
  // Delete segment
  delete: (id: string) => api.delete(`/segments/${id}`),
};

// Campaign API functions
export const campaignApi = {
  // Get all campaigns
  getAll: () => api.get('/campaigns'),
  
  // Get campaign by ID
  getById: (id: string) => api.get(`/campaigns/${id}`),
  
  // Create campaign
  create: (data: any) => api.post('/campaigns', data),
  
  // Update campaign
  update: (id: string, data: any) => api.put(`/campaigns/${id}`, data),
  
  // Delete campaign
  delete: (id: string) => api.delete(`/campaigns/${id}`),
  
  // Send campaign
  send: (id: string) => api.post(`/campaigns/${id}/send`),
  
  // Get campaign summary
  getSummary: (id: string) => api.get(`/campaigns/${id}/summary`),
};

// Order API functions
export const orderApi = {
  // Get all orders
  getAll: (params?: { page?: number; limit?: number; search?: string }) => 
    api.get('/orders', { params }),
  
  // Get order by ID
  getById: (id: string) => api.get(`/orders/${id}`),
  
  // Create order
  create: (data: any) => api.post('/orders', data),
  
  // Update order
  update: (id: string, data: any) => api.put(`/orders/${id}`, data),
  
  // Delete order
  delete: (id: string) => api.delete(`/orders/${id}`),
};

// AI API functions
export const aiApi = {
  // Generate segment rules
  generateSegmentRules: (prompt: string) => api.post('/ai/nl-to-segment', { prompt }),
  
  // Generate message variants
  generateMessageVariants: (objective: string, tone: string, offer?: string) => 
    api.post('/ai/message-variants', { objective, tone, offer }),
  
  // Generate campaign summary
  generateCampaignSummary: (campaignId: string) => api.get(`/ai/campaigns/${campaignId}/summary`),
  
  // Get analytics insights
  getAnalytics: () => api.get('/ai/analytics'),
};

export default api;