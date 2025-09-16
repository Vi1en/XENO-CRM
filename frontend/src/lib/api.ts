import axios from 'axios';

// API base configuration - PRODUCTION ONLY
const getApiBaseUrl = () => {
  // Always use production backend URL
  const prodUrl = 'https://backend-production-05a7e.up.railway.app/api/v1';
  
  // Check if we're in browser environment
  if (typeof window !== 'undefined') {
    console.log('🌐 Using production URL:', prodUrl);
    console.log('📍 Current hostname:', window.location.hostname);
    return prodUrl;
  }
  
  // In server-side rendering, use production URL
  console.log('🖥️ Using production SSR URL:', prodUrl);
  return prodUrl;
}

const API_BASE_URL = getApiBaseUrl();

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('📍 Current hostname:', window.location.hostname);
  console.log('🌐 Production mode: ENABLED');
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
  withCredentials: false, // Disable credentials to avoid CORS issues
});

// Function to get auth headers from localStorage
const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth-token');
    if (token) {
      console.log('🔐 API: Adding auth token to request');
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }
  }
  console.log('⚠️ API: No auth token found');
  return {
    'Content-Type': 'application/json',
  };
};

// Add request interceptor for debugging and auth
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    
    // Add authentication headers
    const authHeaders = getAuthHeaders();
    Object.assign(config.headers, authHeaders);
    
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
const retryRequest = async (fn: () => Promise<any>, retries = 3, isAnalytics = false): Promise<any> => {
  try {
    return await fn();
  } catch (error: any) {
    // For analytics endpoints, reduce retries since they're consistently failing
    const maxRetries = isAnalytics ? 1 : retries;
    const remainingRetries = isAnalytics ? 0 : retries - 1;
    
    if (remainingRetries > 0 && error.code !== 'ECONNABORTED') {
      console.log(`🔄 Retrying request... ${remainingRetries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retryRequest(fn, remainingRetries, isAnalytics);
    }
    throw error;
  }
};

// Customer API
export const customerApi = {
  getAll: async () => {
    return retryRequest(() => api.get('/customers'));
  },
  getById: async (id: string) => {
    return retryRequest(() => api.get(`/customers/${id}`));
  },
  create: async (data: any) => {
    // Use ingestion endpoint as fallback since direct POST to /customers is not working
    try {
      return retryRequest(() => api.post('/customers', data));
    } catch (error) {
      console.log('Direct customer creation failed, trying ingestion endpoint...');
      // Generate externalId for ingestion
      const externalId = `cust_${Date.now()}_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      const ingestionData = {
        ...data,
        externalId
      };
      return retryRequest(() => api.post('/ingest/customers', ingestionData));
    }
  },
  update: async (id: string, data: any) => {
    return retryRequest(() => api.put(`/customers/${id}`, data));
  },
  delete: async (id: string) => {
    return retryRequest(() => api.delete(`/customers/${id}`));
  },
  getAnalytics: async () => {
    return retryRequest(() => api.get('/customers/analytics'), 3, true);
  },
  getSegments: async () => {
    return retryRequest(() => api.get('/customers/segments'));
  }
};

// Campaign API
export const campaignApi = {
  getAll: async () => {
    return retryRequest(() => api.get('/campaigns'));
  },
  getById: async (id: string) => {
    return retryRequest(() => api.get(`/campaigns/${id}`));
  },
  create: async (data: any) => {
    return retryRequest(() => api.post('/campaigns', data));
  },
  update: async (id: string, data: any) => {
    return retryRequest(() => api.put(`/campaigns/${id}`, data));
  },
  delete: async (id: string) => {
    return retryRequest(() => api.delete(`/campaigns/${id}`));
  },
  getSummary: async (id: string) => {
    return retryRequest(() => api.get(`/campaigns/${id}/summary`));
  },
  getDeliveryStats: async () => {
    return retryRequest(() => api.get('/campaigns/delivery-stats'), 3, true);
  }
};

// Order API
export const orderApi = {
  getAll: async () => {
    return retryRequest(() => api.get('/orders'));
  },
  getById: async (id: string) => {
    return retryRequest(() => api.get(`/orders/${id}`));
  },
  create: async (data: any) => {
    return retryRequest(() => api.post('/orders', data));
  },
  update: async (id: string, data: any) => {
    return retryRequest(() => api.put(`/orders/${id}`, data));
  },
  delete: async (id: string) => {
    return retryRequest(() => api.delete(`/orders/${id}`));
  },
  getTrends: async () => {
    return retryRequest(() => api.get('/orders/trends'), 3, true);
  }
};

// Segment API
export const segmentApi = {
  getAll: async () => {
    return retryRequest(() => api.get('/segments'));
  },
  getById: async (id: string) => {
    return retryRequest(() => api.get(`/segments/${id}`));
  },
  create: async (data: any) => {
    return retryRequest(() => api.post('/segments', data));
  },
  update: async (id: string, data: any) => {
    return retryRequest(() => api.put(`/segments/${id}`, data));
  },
  delete: async (id: string) => {
    return retryRequest(() => api.delete(`/segments/${id}`));
  }
};

// AI API
export const aiApi = {
  getInsights: async () => {
    return retryRequest(() => api.get('/ai/insights'));
  },
  getDashboardInsights: async () => {
    return retryRequest(() => api.get('/ai/dashboard-insights'));
  },
  getHealthStatus: async () => {
    return retryRequest(() => api.get('/ai/health'));
  },
  clearCache: async () => {
    return retryRequest(() => api.post('/ai/clear-cache'));
  },
  generateSegmentRules: async (prompt: string) => {
    return retryRequest(() => api.post('/ai/nl-to-segment', { prompt }));
  },
  generateMessageVariants: async (objective: string, tone: string, offer?: string, brandVoice?: string) => {
    return retryRequest(() => api.post('/ai/message-variants', { objective, tone, offer, brandVoice }));
  }
};

// Test API connection
export const testApiConnection = async () => {
  try {
    console.log('🧪 Testing API connection...');
    const response = await api.get('/health');
    console.log('✅ API connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('❌ API connection failed:', error.message);
    return { success: false, error: error.message };
  }
};