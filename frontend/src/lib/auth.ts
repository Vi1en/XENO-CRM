// Authentication utilities for Xeno CRM

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider: string;
  jwt?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Get user from localStorage
export const getUser = (): User | null => {
  if (typeof window === 'undefined') {
    console.log('🔍 Auth: Window not available (SSR)');
    return null;
  }
  
  try {
    const storedUser = localStorage.getItem('xeno-user');
    console.log('🔍 Auth: getUser() - storedUser:', storedUser ? 'Found' : 'Not found');
    
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log('✅ Auth: User data:', {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider
      });
      return user;
    }
    
    return null;
  } catch (error) {
    console.error('❌ Auth: Error getting user from localStorage:', error);
    return null;
  }
};

// Get JWT token from localStorage
export const getJWT = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('xeno-jwt');
  } catch (error) {
    console.error('Error getting JWT from localStorage:', error);
    return null;
  }
};

// Set user in localStorage
export const setUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('xeno-user', JSON.stringify(user));
    if (user.jwt) {
      localStorage.setItem('xeno-jwt', user.jwt);
    }
  } catch (error) {
    console.error('Error setting user in localStorage:', error);
  }
};

// Clear user from localStorage
export const clearUser = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('xeno-user');
    localStorage.removeItem('xeno-jwt');
  } catch (error) {
    console.error('Error clearing user from localStorage:', error);
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const user = getUser();
  const jwt = getJWT();
  
  const authenticated = !!(user && jwt);
  console.log('🔍 Auth: isAuthenticated() - result:', authenticated);
  
  return authenticated;
};

// Verify JWT token with backend
export const verifyToken = async (): Promise<{ success: boolean; user?: User }> => {
  const jwt = getJWT();
  
  if (!jwt) {
    return { success: false };
  }
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-05a7e.up.railway.app/api/v1'}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: jwt })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      return { success: true, user: data.user };
    } else {
      // Token is invalid, clear it
      clearUser();
      return { success: false };
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return { success: false };
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    // Call backend logout endpoint
    const jwt = getJWT();
    if (jwt) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://backend-production-05a7e.up.railway.app/api/v1'}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: jwt })
      });
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    clearUser();
  }
};

// Get authorization header for API requests
export const getAuthHeader = (): { Authorization: string } | {} => {
  const jwt = getJWT();
  return jwt ? { Authorization: `Bearer ${jwt}` } : {};
};
