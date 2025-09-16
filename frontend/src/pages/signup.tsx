import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/useAuth'

export default function SignUp() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  // Redirect to login page since we only use Google OAuth
  useEffect(() => {
    console.log('🔄 Signup: Redirecting to login page (Google OAuth only)')
    router.replace('/login')
  }, [router])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center animate-fade-in">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-gentle">
          <span className="text-white font-bold text-xl">X</span>
        </div>
        <p className="text-gray-600 animate-pulse">Redirecting to login...</p>
      </div>
    </div>
  )
}