import Head from 'next/head'

export default function Simple() {
  return (
    <>
      <Head>
        <title>Xeno CRM - Simple Test</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🚀 Xeno CRM
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '30px' }}>
            Simple test page is working!
          </p>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '10px',
            marginBottom: '20px'
          }}>
            <p><strong>Status:</strong> ✅ Deployed Successfully</p>
            <p><strong>Time:</strong> {new Date().toLocaleString()}</p>
            <p><strong>Environment:</strong> Production</p>
          </div>
          <a 
            href="/" 
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '25px',
              textDecoration: 'none',
              fontWeight: 'bold',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          >
            Go to Main App
          </a>
        </div>
      </div>
    </>
  )
}
