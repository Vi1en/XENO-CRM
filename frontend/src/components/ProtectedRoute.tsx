import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { isAuthenticated, verifyToken, User } from '@/lib/auth'
import SkeletonLoader from './SkeletonLoader'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean
    user: User | null
  }>({
    isAuthenticated: false,
    user: null
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if user exists in localStorage
        const hasLocalAuth = isAuthenticated()
        
        if (!hasLocalAuth) {
          console.log('🔐 No local authentication found, redirecting to login')
          router.push(redirectTo)
          return
        }

        // Verify token with backend
        console.log('🔐 Verifying token with backend...')
        const verification = await verifyToken()
        
        if (verification.success && verification.user) {
          console.log('✅ Token verification successful')
          setAuthState({
            isAuthenticated: true,
            user: verification.user
          })
        } else {
          console.log('❌ Token verification failed, redirecting to login')
          router.push(redirectTo)
        }
      } catch (error) {
        console.error('❌ Auth check error:', error)
        router.push(redirectTo)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <SkeletonLoader type="card" />
          <p className="mt-4 text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!authState.isAuthenticated) {
    return null // Will redirect, so return nothing
  }

  return <>{children}</>
}
