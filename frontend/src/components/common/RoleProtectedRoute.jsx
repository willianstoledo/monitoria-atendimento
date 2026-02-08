import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function RoleProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ fontSize: '1.2rem', color: '#666' }}>
          Verificando permissões...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se allowedRoles não for especificado, permite todos os usuários autenticados
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  // Verifica se o papel do usuário está na lista de papéis permitidos
  if (!allowedRoles.includes(user.role)) {
    return (
      <div style={{ 
        padding: '2rem',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        margin: '2rem',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#721c24', marginBottom: '1rem' }}>
          🚫 Acesso Negado
        </h2>
        <p style={{ color: '#721c24', marginBottom: '1rem' }}>
          Você não tem permissão para acessar esta página.
        </p>
        <p style={{ color: '#856404', fontSize: '0.9rem' }}>
          Seu perfil: <strong>{getRoleName(user.role)}</strong>
        </p>
        <button
          onClick={() => window.history.back()}
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
          Voltar
        </button>
      </div>
    );
  }

  return children;
}

function getRoleName(role) {
  const roleNames = {
    admin: 'Administrador',
    administrator: 'Administrador',
    supervisor: 'Supervisor',
    operator: 'Operador'
  };
  return roleNames[role] || role;
}
