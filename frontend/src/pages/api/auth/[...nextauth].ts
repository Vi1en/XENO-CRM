import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    accessToken?: string
    provider?: string
  }
  interface User {
    id?: string
  }
}

const authOptions: NextAuthOptions = {
  // Configure NextAuth URL for local development
  ...(process.env.NODE_ENV === 'development' && {
    url: 'http://localhost:3000',
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.provider = account.provider
      }
      if (profile) {
        token.picture = (profile as any).picture
        token.name = profile.name
        token.email = profile.email
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string
      session.provider = token.provider as string
      if (session.user) {
        (session.user as any).id = token.sub as string
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Allow sign in for Google accounts
      if (account?.provider === 'google') {
        return true
      }
      return true
    }
  },
  pages: {
    signIn: '/signup',
    error: '/signup',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-local-development-only',
}

export default NextAuth(authOptions)
