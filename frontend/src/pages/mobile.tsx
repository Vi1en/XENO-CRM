import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Head from 'next/head'

export default function Mobile() {
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
    if (session) {
      loadData()
    }
  }, [session])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📱 Mobile: Loading data...')
      console.log('📱 Mobile: Current URL:', window.location.href)
      console.log('📱 Mobile: User Agent:', navigator.userAgent)
      
      // Test API first
      const testResponse = await fetch('https://backend-production-05a7e.up.railway.app/api/v1/orders')
      console.log('📱 Mobile: Test response status:', testResponse.status)
      
      if (!testResponse.ok) {
        throw new Error(`API test failed: ${testResponse.status}`)
      }
      
      // Load all data
      const [customersRes, campaignsRes, segmentsRes, ordersRes] = await Promise.all([
        fetch('https://backend-production-05a7e.up.railway.app/api/v1/customers'),
        fetch('https://backend-production-05a7e.up.railway.app/api/v1/campaigns'),
        fetch('https://backend-production-05a7e.up.railway.app/api/v1/segments'),
        fetch('https://backend-production-05a7e.up.railway.app/api/v1/orders')
      ])
      
      console.log('📱 Mobile: Response statuses:', {
        customers: customersRes.status,
        campaigns: campaignsRes.status,
        segments: segmentsRes.status,
        orders: ordersRes.status
      })
      
      const [customers, campaigns, segments, orders] = await Promise.all([
        customersRes.json(),
        campaignsRes.json(),
        segmentsRes.json(),
        ordersRes.json()
      ])
      
      console.log('📱 Mobile: Data loaded:', {
        customers: customers.data?.length || 0,
        campaigns: campaigns.data?.length || 0,
        segments: segments.data?.length || 0,
        orders: orders.data?.length || 0
      })
      
      setData({
        customers: customers.data?.length || 0,
        campaigns: campaigns.data?.length || 0,
        segments: segments.data?.length || 0,
        orders: orders.data?.length || 0
      })
      
    } catch (err: any) {
      console.error('📱 Mobile: Error loading data:', err)
      setError(err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const testAPI = async () => {
    try {
      console.log('🧪 Testing API...')
      const response = await fetch('https://backend-production-05a7e.up.railway.app/api/v1/orders')
      const data = await response.json()
      alert(`API Test: ${response.ok ? 'SUCCESS' : 'FAILED'}\nOrders: ${data.data?.length || 0}`)
    } catch (err: any) {
      alert(`API Test: FAILED\nError: ${err.message}`)
    }
  }

  if (status === 'loading') {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
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
            animation: 'pulse 2s infinite'
          }}>
            <span style={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}>X</span>
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
        padding: '20px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
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
            Xeno CRM
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>
            Please sign in to access your mobile dashboard
          </p>
          <button
            onClick={() => signIn()}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Head>
        <title>Mobile Dashboard - Xeno CRM</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      {/* Header */}
      <div style={{
        backgroundColor: '#1f2937',
        color: 'white',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>
          Xeno CRM
        </h1>
        <p style={{ fontSize: '14px', color: '#d1d5db' }}>
          Welcome, {session.user?.name?.split(' ')[0] || 'User'}
        </p>
        <button
          onClick={() => signOut()}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid white',
            borderRadius: '6px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
              {data.customers}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Customers</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {data.campaigns}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Campaigns</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              {data.segments}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Segments</div>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
              {data.orders}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Orders</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
            onClick={testAPI}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Test API Connection
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Debug Info */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <div><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
          <div><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</div>
          <div><strong>Screen:</strong> {typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'}</div>
        </div>
      </div>
    </div>
  )
}
