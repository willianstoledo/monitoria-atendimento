import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '2rem', 
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          margin: '2rem'
        }}>
          <h2 style={{ color: '#856404', marginBottom: '1rem' }}>
            ⚠️ Algo deu errado
          </h2>
          <p style={{ color: '#856404', marginBottom: '1rem' }}>
            Ocorreu um erro ao carregar esta página. Por favor, tente recarregar ou entre em contato com o suporte.
          </p>
          <details style={{ marginTop: '1rem' }}>
            <summary style={{ cursor: 'pointer', color: '#856404', fontWeight: 'bold' }}>
              Detalhes técnicos
            </summary>
            <pre style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '0.85rem'
            }}>
              {this.state.error && this.state.error.toString()}
              {'\n\n'}
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
