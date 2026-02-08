import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { callsService } from '../services/callsService';
import { useAuth } from '../contexts/AuthContext';
import NewCallModal from '../components/calls/NewCallModal';

export default function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewCallModal, setShowNewCallModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    callType: '',
    page: 1
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadCalls();
  }, [filters]);

  const loadCalls = async () => {
    try {
      setLoading(true);
      const data = await callsService.getCalls(filters);
      setCalls(data.calls);
    } catch (err) {
      setError('Erro ao carregar chamadas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Carregando...</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1>Chamadas de Atendimento</h1>
        {(user?.role === 'supervisor' || user?.role === 'admin') && (
          <button
            onClick={() => setShowNewCallModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            ➕ Nova Chamada
          </button>
        )}
      </div>

      {/* Filtros */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              minWidth: '150px'
            }}
          >
            <option value="">Todos</option>
            <option value="pending">Pendente</option>
            <option value="evaluated">Avaliada</option>
            <option value="archived">Arquivada</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            Tipo de Chamada
          </label>
          <select
            value={filters.callType}
            onChange={(e) => handleFilterChange('callType', e.target.value)}
            style={{
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              minWidth: '150px'
            }}
          >
            <option value="">Todos</option>
            <option value="suporte">Suporte</option>
            <option value="vendas">Vendas</option>
            <option value="reclamacao">Reclamação</option>
            <option value="informacao">Informação</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Lista de Chamadas */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {calls.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            Nenhuma chamada encontrada
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={tableHeaderStyle}>Protocolo</th>
                  <th style={tableHeaderStyle}>Cliente</th>
                  <th style={tableHeaderStyle}>Operador</th>
                  <th style={tableHeaderStyle}>Tipo</th>
                  <th style={tableHeaderStyle}>Data</th>
                  <th style={tableHeaderStyle}>Duração</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => (
                  <tr key={call.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tableCellStyle}>
                      <strong>{call.protocol}</strong>
                    </td>
                    <td style={tableCellStyle}>{call.customer_name}</td>
                    <td style={tableCellStyle}>{call.operator_name}</td>
                    <td style={tableCellStyle}>{call.call_type}</td>
                    <td style={tableCellStyle}>
                      {new Date(call.call_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={tableCellStyle}>
                      {call.duration_seconds 
                        ? `${Math.floor(call.duration_seconds / 60)}:${String(call.duration_seconds % 60).padStart(2, '0')}`
                        : 'N/A'}
                    </td>
                    <td style={tableCellStyle}>
                      <StatusBadge status={call.status} />
                    </td>
                    <td style={tableCellStyle}>
                      <button
                        onClick={() => navigate(`/calls/${call.id}`)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Nova Chamada */}
      <NewCallModal
        isOpen={showNewCallModal}
        onClose={() => setShowNewCallModal(false)}
        onSuccess={() => {
          setShowNewCallModal(false);
          loadCalls();
        }}
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: { bg: '#fff3cd', color: '#856404', text: 'Pendente' },
    evaluated: { bg: '#d4edda', color: '#155724', text: 'Avaliada' },
    archived: { bg: '#d1ecf1', color: '#0c5460', text: 'Arquivada' }
  };

  const style = styles[status] || styles.pending;

  return (
    <span style={{
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.85rem',
      backgroundColor: style.bg,
      color: style.color,
      fontWeight: '500'
    }}>
      {style.text}
    </span>
  );
}

const tableHeaderStyle = {
  padding: '1rem',
  textAlign: 'left',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  color: '#555'
};

const tableCellStyle = {
  padding: '1rem',
  fontSize: '0.9rem'
};
