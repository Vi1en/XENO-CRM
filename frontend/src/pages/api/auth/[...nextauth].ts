import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Demo mode configuration - works without Google OAuth
export default NextAuth({
  providers: [
    // Only add Google provider if credentials are available
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    },
  },
  pages: {
    signIn: '/',
    error: '/', // Redirect errors back to main page
  },
  // Demo mode: allow sessions without authentication
  session: {
    strategy: 'jwt',
  },
  // Disable CSRF protection for demo mode
  useSecureCookies: false,
})