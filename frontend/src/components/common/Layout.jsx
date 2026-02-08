import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '250px',
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Monitoria
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#bdc3c7' }}>
            Sistema de Atendimento
          </p>
        </div>

        <nav style={{ flex: 1 }}>
          <NavLink to="/dashboard" active={isActive('/dashboard')}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/calls" active={isActive('/calls')}>
            📞 Chamadas
          </NavLink>
          <NavLink to="/evaluations" active={isActive('/evaluations')}>
            ⭐ Avaliações
          </NavLink>
          {(user?.role === 'supervisor' || user?.role === 'admin') && (
            <NavLink to="/reports" active={isActive('/reports')}>
              📈 Relatórios
            </NavLink>
          )}
        </nav>

        <div style={{
          borderTop: '1px solid #34495e',
          paddingTop: '1rem',
          marginTop: '1rem'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
              {user?.full_name}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#bdc3c7' }}>
              {getRoleLabel(user?.role)}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '0.5rem',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            🚪 Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        backgroundColor: '#ecf0f1',
        overflow: 'auto'
      }}>
        {children}
      </main>
    </div>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      style={{
        display: 'block',
        padding: '0.75rem 1rem',
        marginBottom: '0.5rem',
        borderRadius: '4px',
        textDecoration: 'none',
        color: 'white',
        backgroundColor: active ? '#34495e' : 'transparent',
        transition: 'background-color 0.2s',
        fontSize: '0.95rem'
      }}
    >
      {children}
    </Link>
  );
}

function getRoleLabel(role) {
  const labels = {
    admin: 'Administrador',
    supervisor: 'Supervisor',
    operator: 'Operador'
  };
  return labels[role] || role;
}
