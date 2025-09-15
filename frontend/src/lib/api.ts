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

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('🌍 Environment NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('📍 Current hostname:', window.location.hostname);
  console.log('📱 User Agent:', navigator.userAgent);
  console.log('📐 Screen size:', window.innerWidth + 'x' + window.innerHeight);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
  withCredentials: false, // Disable credentials to avoid CORS issues
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
  getDeliveryStats: async () => {
    return retryRequest(() => api.get('/campaigns/delivery-stats'), 3, true);
  }
};

// Order API
export const orderApi = {
  getAll: async () => {
    return retryRequest(() => api.get('/orders'));
  },
  getById: async (id: number) => {
    return retryRequest(() => api.get(`/orders/${id}`));
  },
  create: async (data: any) => {
    return retryRequest(() => api.post('/orders', data));
  },
  update: async (id: number, data: any) => {
    return retryRequest(() => api.put(`/orders/${id}`, data));
  },
  delete: async (id: number) => {
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