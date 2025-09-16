export default function TestMobile() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      padding: '20px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '20px' }}>
          📱 Mobile Test Page
        </h1>
        <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '30px' }}>
          This is a simple test page to verify mobile routing works.
        </p>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            If you can see this page, the mobile routing is working!
          </p>
        </div>
      </div>
    </div>
  )
}
