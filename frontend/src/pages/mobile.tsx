import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Mobile() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [data, setData] = useState({
    customers: 0,
    campaigns: 0,
    segments: 0,
    orders: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect to main page to use the new responsive interface
    router.push('/')
  }, [router])

  // Redirecting to main page - no need for data loading

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', padding: '20px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#3b82f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px'
        }}>
          <span style={{ color: 'white', fontSize: '32px', fontWeight: 'bold' }}>X</span>
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '10px' }}>
          Redirecting...
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '20px' }}>
          Taking you to the new responsive interface
        </p>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
      </div>
    </div>
  )
}
