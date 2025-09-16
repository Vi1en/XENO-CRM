export default function Health() {
  return (
    <div style={{ 
      padding: '20px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>✅ Health Check - App is Running!</h1>
      <p>Time: {new Date().toISOString()}</p>
      <p>Status: OK</p>
    </div>
  )
}
