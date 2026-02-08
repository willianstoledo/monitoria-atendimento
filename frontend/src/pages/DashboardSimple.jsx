export default function DashboardSimple() {
  return (
    <div style={{ padding: '2rem', background: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: 'black', marginBottom: '1rem' }}>Dashboard Simples</h1>
      <p style={{ color: 'black' }}>Teste de renderização básica</p>
      <div style={{ 
        padding: '1rem', 
        background: '#f0f0f0', 
        borderRadius: '8px',
        marginTop: '1rem'
      }}>
        <p style={{ color: 'black' }}>Se você está vendo isso, o React está funcionando!</p>
      </div>
    </div>
  );
}
