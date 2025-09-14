import Head from 'next/head'
import Link from 'next/link'

export default function TestAIPage() {
  return (
    <>
      <Head>
        <title>AI Dashboard Test - Xeno CRM</title>
        <meta name="description" content="Test page for AI Dashboard functionality" />
      </Head>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f4f8',
        fontFamily: 'sans-serif',
        color: '#333'
      }}>
        <div style={{
          textAlign: 'center',
          padding: '40px',
          borderRadius: '15px',
          backgroundColor: 'white',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          maxWidth: '600px'
        }}>
          <h1 style={{
            fontSize: '2.5em',
            color: '#8B5CF6',
            marginBottom: '20px'
          }}>🤖 AI Dashboard Test</h1>
          
          <p style={{
            fontSize: '1.2em',
            color: '#555',
            marginBottom: '30px'
          }}>Testing AI Dashboard functionality</p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <Link href="/ai-dashboard" style={{
              padding: '15px 25px',
              backgroundColor: '#8B5CF6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}>
              🧠 AI Dashboard
            </Link>
            
            <Link href="/" style={{
              padding: '15px 25px',
              backgroundColor: '#3B82F6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '10px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}>
              🏠 Main Dashboard
            </Link>
          </div>
          
          <div style={{
            backgroundColor: '#F3F4F6',
            padding: '20px',
            borderRadius: '10px',
            marginTop: '20px'
          }}>
            <h3 style={{ color: '#374151', marginBottom: '10px' }}>What to check:</h3>
            <ul style={{ textAlign: 'left', color: '#6B7280' }}>
              <li>✅ AI Dashboard link in sidebar navigation</li>
              <li>✅ AI Dashboard button in Quick Actions</li>
              <li>✅ AI Suggestions button in Quick Actions</li>
              <li>✅ Purple/indigo theme for AI elements</li>
              <li>✅ Lightbulb icon for AI Dashboard</li>
            </ul>
          </div>
          
          <p style={{
            fontSize: '0.9em',
            color: '#9CA3AF',
            marginTop: '20px'
          }}>Deployed at: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </>
  )
}
