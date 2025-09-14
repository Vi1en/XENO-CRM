import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function MobileDashboard() {
  const { data: session, status } = useSession()
  const [data, setData] = useState({
    customers: 0,
    campaigns: 0,
    segments: 0,
    orders: 0
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Simple direct API call
      const response = await fetch('https://backend-production-05a7e.up.railway.app/api/v1/orders')
      const result = await response.json()
      
      if (result.success) {
        setData({
          customers: result.data?.length || 0,
          campaigns: 0,
          segments: 0,
          orders: result.data?.length || 0
        })
      } else {
        setError('API returned error')
      }
    } catch (err) {
      setError('Cannot connect to server')
    }
    
    setLoading(false)
  }

  if (status === 'loading') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        fontFamily: 'system-ui'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#3b82f6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            X
          </div>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        padding: '20px',
        fontFamily: 'system-ui'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#3b82f6',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'white',
              fontSize: '32px',
              fontWeight: 'bold'
            }}>
              X
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 10px' }}>
              Xeno CRM
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
              Sign in to continue
            </p>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <button
              onClick={() => signIn('google')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <svg style={{ width: '20px', height: '20px', marginRight: '12px' }} viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6',
      fontFamily: 'system-ui'
    }}>
      <Head>
        <title>Xeno CRM</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', margin: '0 0 5px' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Hi, {session.user?.name?.split(' ')[0] || 'User'}
          </p>
        </div>
        <button
          onClick={() => signOut()}
          style={{
            padding: '8px',
            color: '#9ca3af',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          margin: '20px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '15px'
        }}>
          <p style={{ fontSize: '14px', color: '#dc2626', margin: '0 0 10px' }}>
            {error}
          </p>
          <button
            onClick={loadData}
            style={{
              fontSize: '14px',
              color: '#dc2626',
              textDecoration: 'underline',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{ padding: '20px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#3b82f6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ color: 'white', fontSize: '16px' }}>👥</span>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 5px' }}>
                  Customers
                </p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {loading ? '...' : data.customers}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#8b5cf6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ color: 'white', fontSize: '16px' }}>📧</span>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 5px' }}>
                  Campaigns
                </p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {loading ? '...' : data.campaigns}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#10b981',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ color: 'white', fontSize: '16px' }}>🎯</span>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 5px' }}>
                  Segments
                </p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {loading ? '...' : data.segments}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f59e0b',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ color: 'white', fontSize: '16px' }}>📦</span>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 5px' }}>
                  Orders
                </p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {loading ? '...' : data.orders}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={loadData}
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: loading ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
          
          <button
            onClick={() => window.location.href = '/mobile-orders'}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            View Orders
          </button>
        </div>

        {/* Debug Info */}
        <div style={{
          marginTop: '30px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          padding: '15px'
        }}>
          <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 10px', fontWeight: 'bold' }}>
            Debug Info:
          </p>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0' }}>
            API: https://backend-production-05a7e.up.railway.app/api/v1
          </p>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0' }}>
            Data: {data.customers} customers, {data.orders} orders
          </p>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0' }}>
            Status: {loading ? 'Loading...' : 'Ready'}
          </p>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0' }}>
            Error: {error || 'None'}
          </p>
        </div>
      </div>
    </div>
  )
}