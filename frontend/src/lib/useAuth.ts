import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-05a7e.up.railway.app/api/v1';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });
  
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    console.log('🔍 useAuth: Initializing auth state...');
    
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth-token');
        const storedUser = localStorage.getItem('auth-user');
        
        console.log('🔍 useAuth: Stored token:', !!storedToken);
        console.log('🔍 useAuth: Stored user:', !!storedUser);
        
        if (storedToken && storedUser) {
          // Verify token with backend
          console.log('🔍 useAuth: Verifying token with backend...');
          const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: storedToken }),
          });
          
          const result = await response.json();
          
          if (result.success && result.user) {
            console.log('✅ useAuth: Token verified successfully');
            setAuthState({
              user: result.user,
              token: storedToken,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            console.log('❌ useAuth: Token verification failed, clearing storage');
            localStorage.removeItem('auth-token');
            localStorage.removeItem('auth-user');
            setAuthState({
              user: null,
              token: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        } else {
          console.log('❌ useAuth: No stored auth data found');
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('❌ useAuth: Error initializing auth:', error);
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, []);

  // Handle callback from Auth0
  useEffect(() => {
    if (router.isReady && router.query.token) {
      console.log('🔄 useAuth: Handling Auth0 callback...');
      
      const token = router.query.token as string;
      
      // Verify token with backend
      const verifyAndStoreToken = async () => {
        try {
          console.log('🔄 useAuth: Verifying callback token...');
          const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });
          
          const result = await response.json();
          
          if (result.success && result.user) {
            console.log('✅ useAuth: Callback token verified, storing auth data');
            
            // Store in localStorage
            localStorage.setItem('auth-token', token);
            localStorage.setItem('auth-user', JSON.stringify(result.user));
            
            // Update state
            setAuthState({
              user: result.user,
              token: token,
              isLoading: false,
              isAuthenticated: true,
            });
            
            // Redirect to dashboard (remove token from URL)
            router.replace('/');
          } else {
            console.log('❌ useAuth: Callback token verification failed');
            router.replace('/login');
          }
        } catch (error) {
          console.error('❌ useAuth: Error verifying callback token:', error);
          router.replace('/login');
        }
      };

      verifyAndStoreToken();
    }
  }, [router.isReady, router.query.token]);

  const login = () => {
    console.log('🔐 useAuth: Starting login process...');
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-05a7e.up.railway.app/api/v1';
    window.location.href = `${backendUrl}/auth/login`;
  };

  const logout = () => {
    console.log('👋 useAuth: Starting logout process...');
    
    // Clear local storage
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    
    // Update state
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
    
    // Redirect to backend logout
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-05a7e.up.railway.app/api/v1';
    window.location.href = `${backendUrl}/auth/logout`;
  };

  const getAuthHeaders = () => {
    if (authState.token) {
      return {
        'Authorization': `Bearer ${authState.token}`,
        'Content-Type': 'application/json',
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  };

  return {
    ...authState,
    login,
    logout,
    getAuthHeaders,
  };
};
