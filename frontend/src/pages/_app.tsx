import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'
import '../styles/globals.css'

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  // Configure NextAuth base URL for local development
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : process.env.NEXTAUTH_URL

  useEffect(() => {
    // Log the configuration for debugging
    console.log('🔧 NextAuth App Config:', {
      baseUrl,
      nodeEnv: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL
    })
  }, [])

  return (
    <SessionProvider 
      session={session}
      baseUrl={baseUrl}
      basePath="/api/auth"
    >
      <Component {...pageProps} />
    </SessionProvider>
  )
}