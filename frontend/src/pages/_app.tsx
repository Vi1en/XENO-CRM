import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import '../styles/globals.css'

export default function App({ 
  Component, 
  pageProps: { session, ...pageProps } 
}: AppProps) {
  // Force localhost for development
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : undefined

  return (
    <SessionProvider 
      session={session}
      baseUrl={baseUrl}
    >
      <Component {...pageProps} />
    </SessionProvider>
  )
}