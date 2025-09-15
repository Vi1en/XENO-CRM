// NextAuth client-side configuration
export const nextAuthConfig = {
  baseUrl: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : process.env.NEXTAUTH_URL || window.location.origin,
  basePath: '/api/auth'
}

// Log the configuration for debugging
if (typeof window !== 'undefined') {
  console.log('🔧 NextAuth Config:', nextAuthConfig)
}
