import axios from 'axios';

// API base configuration
const getApiBaseUrl = () => {
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    // In browser, use the environment variable or fallback
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log('🔗 Environment NEXT_PUBLIC_API_URL:', envUrl);
    
    if (envUrl) {
      // Ensure the URL has the correct format
      const cleanUrl = envUrl.endsWith('/api/v1') ? envUrl : `${envUrl}/api/v1`;
      console.log('✅ Using environment URL:', cleanUrl);
      return cleanUrl;
    }
    
    // Fallback for production if env var is not set
    if (window.location.hostname !== 'localhost') {
      const prodUrl = 'https://backend-production-05a7e.up.railway.app/api/v1';
      console.log('🌐 Using production fallback URL:', prodUrl);
      return prodUrl;
    }
    
    const localUrl = 'http://localhost:3001/api/v1';
    console.log('🏠 Using local URL:', localUrl);
    return localUrl;
  }
  
  // In server-side rendering, use environment variable or fallback
  const ssrUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-05a7e.up.railway.app/api/v1';
  console.log('🖥️ Using SSR URL:', ssrUrl);
  return ssrUrl;
}

const API_BASE_URL = getApiBaseUrl();

// Debug logging (remove in production)
if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🌍 Environment NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('📍 Current hostname:', window.location.hostname);
  console.log('📱 User Agent:', navigator.userAgent);
  console.log('📐 Screen size:', window.innerWidth + 'x' + window.innerHeight);
  
  // Test the API URL immediately
  fetch(API_BASE_URL + '/orders')
    .then(response => {
      console.log('🧪 API Test Response Status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('🧪 API Test Data:', data);
    })
    .catch(error => {
      console.error('🧪 API Test Error:', error);
    });
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

// Retry function for failed requests
const retryRequest = async (fn: () => Promise<any>, retries = 3): Promise<any> => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      console.log(`🔄 Retrying request, ${retries} attempts left...`)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      return retryRequest(fn, retries - 1)
    }
    throw error
  }
}

// Customer API functions
export const customerApi = {
  // Get all customers
  getAll: () => retryRequest(() => api.get('/customers')),
  
  // Get customer by ID
  getById: (id: string) => retryRequest(() => api.get(`/customers/${id}`)),
  
  // Create customer
  create: (data: any) => retryRequest(() => api.post('/ingest/customers', data)),
  
  // Update customer
  update: (id: string, data: any) => retryRequest(() => api.put(`/customers/${id}`, data)),
  
  // Delete customer
  delete: (id: string) => retryRequest(() => api.delete(`/customers/${id}`)),
  
  // Get customer analytics
  getAnalytics: () => retryRequest(() => api.get('/customers/analytics')),
};

// Segment API functions
export const segmentApi = {
  // Get all segments
  getAll: () => retryRequest(() => api.get('/segments')),
  
  // Get segment by ID
  getById: (id: string) => retryRequest(() => api.get(`/segments/${id}`)),
  
  // Create segment
  create: (data: any) => retryRequest(() => api.post('/segments', data)),
  
  // Preview segment
  preview: (data: any) => retryRequest(() => api.post('/segments/preview', data)),
  
  // Update segment
  update: (id: string, data: any) => retryRequest(() => api.put(`/segments/${id}`, data)),
  
  // Delete segment
  delete: (id: string) => retryRequest(() => api.delete(`/segments/${id}`)),
};

// Campaign API functions
export const campaignApi = {
  // Get all campaigns
  getAll: () => retryRequest(() => api.get('/campaigns')),
  
  // Get campaign by ID
  getById: (id: string) => retryRequest(() => api.get(`/campaigns/${id}`)),
  
  // Create campaign
  create: (data: any) => retryRequest(() => api.post('/campaigns', data)),
  
  // Update campaign
  update: (id: string, data: any) => retryRequest(() => api.put(`/campaigns/${id}`, data)),
  
  // Delete campaign
  delete: (id: string) => retryRequest(() => api.delete(`/campaigns/${id}`)),
  
  // Send campaign
  send: (id: string) => retryRequest(() => api.post(`/campaigns/${id}/send`)),
  
  // Get campaign summary
  getSummary: (id: string) => retryRequest(() => api.get(`/campaigns/${id}/summary`)),
  
  // Get delivery statistics
  getDeliveryStats: () => retryRequest(() => api.get('/campaigns/delivery-stats')),
};

// Order API functions
export const orderApi = {
  // Get all orders
  getAll: (params?: { page?: number; limit?: number; search?: string }) => 
    retryRequest(() => api.get('/orders', { params })),
  
  // Get order by ID
  getById: (id: string) => retryRequest(() => api.get(`/orders/${id}`)),
  
  // Create order
  create: (data: any) => retryRequest(() => api.post('/orders', data)),
  
  // Update order
  update: (id: string, data: any) => retryRequest(() => api.put(`/orders/${id}`, data)),
  
  // Delete order
  delete: (id: string) => retryRequest(() => api.delete(`/orders/${id}`)),
  
  // Get revenue trends
  getTrends: () => retryRequest(() => api.get('/orders/trends')),
};

// AI API functions
export const aiApi = {
  // Generate segment rules
  generateSegmentRules: (prompt: string) => retryRequest(() => api.post('/ai/nl-to-segment', { prompt })),
  
  // Generate message variants
  generateMessageVariants: (objective: string, tone: string, offer?: string) => 
    retryRequest(() => api.post('/ai/message-variants', { objective, tone, offer })),
  
  // Generate campaign summary
  generateCampaignSummary: (campaignId: string) => retryRequest(() => api.get(`/ai/campaigns/${campaignId}/summary`)),
  
  // Get analytics insights
  getAnalytics: () => retryRequest(() => api.get('/ai/analytics')),
  
  // Get AI insights (for AI dashboard)
  getInsights: () => retryRequest(() => api.get('/ai/insights')),
};

export default api;