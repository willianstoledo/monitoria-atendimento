import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentCalls, setRecentCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('[Dashboard] Componente montado, user:', user);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('[Dashboard] Iniciando carregamento...');
      setLoading(true);
      setError('');

      // Carregar stats
      console.log('[Dashboard] Carregando stats...');
      const statsResponse = await api.get('/dashboard/stats');
      console.log('[Dashboard] Stats recebidas:', statsResponse.data);
      setStats(statsResponse.data);

      // Carregar atividade recente
      console.log('[Dashboard] Carregando atividade recente...');
      const activityResponse = await api.get('/dashboard/recent-activity?limit=5');
      console.log('[Dashboard] Atividade recebida:', activityResponse.data);
      setRecentCalls(activityResponse.data.recent_calls || []);

      console.log('[Dashboard] Carregamento concluído com sucesso!');
    } catch (err) {
      console.error('[Dashboard] Erro ao carregar:', err);
      console.error('[Dashboard] Erro detalhes:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(`Erro ao carregar dados: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  console.log('[Dashboard] Renderizando, estado:', { loading, error, hasStats: !!stats, user });

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <div style={{ 
          fontSize: '1.5rem', 
          color: '#007bff',
          marginBottom: '1rem'
        }}>
          ⏳ Carregando dashboard...
        </div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          Aguarde enquanto buscamos seus dados
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem',
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        margin: '2rem'
      }}>
        <h3 style={{ color: '#721c24', marginBottom: '1rem' }}>
          ❌ Erro ao Carregar Dashboard
        </h3>
        <p style={{ color: '#721c24', marginBottom: '1rem' }}>
          {error}
        </p>
        <button
          onClick={loadDashboardData}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{ padding: '2rem' }}>
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>
        📊 Dashboard - Bem-vindo, {user?.full_name || 'Usuário'}!
      </h1>

      {/* Estatísticas Gerais */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          title="Total de Chamadas"
          value={stats.calls?.total || 0}
          color="#007bff"
          icon="📞"
        />
        <StatCard
          title="Chamadas Avaliadas"
          value={stats.calls?.evaluated || 0}
          color="#28a745"
          icon="✅"
        />
        <StatCard
          title="Pendentes de Avaliação"
          value={stats.calls?.pending || 0}
          color="#ffc107"
          icon="⏳"
        />
        <StatCard
          title="Nota Média Geral"
          value={stats.evaluations?.avg_overall_score?.toFixed(2) || 'N/A'}
          color="#17a2b8"
          icon="⭐"
        />
      </div>

      {/* Duração Média */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#333' }}>
          ⏱️ Duração Média das Chamadas
        </h3>
        <p style={{ fontSize: '1.5rem', color: '#007bff', fontWeight: 'bold' }}>
          {Math.floor((stats.calls?.avg_duration_seconds || 0) / 60)} minutos e{' '}
          {Math.floor((stats.calls?.avg_duration_seconds || 0) % 60)} segundos
        </p>
      </div>

      {/* Distribuição por Tipo */}
      {stats.calls?.by_type && Object.keys(stats.calls.by_type).length > 0 && (
        <div style={{ 
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>
            📊 Distribuição por Tipo de Chamada
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {Object.entries(stats.calls.by_type).map(([type, count]) => (
              <div key={type} style={{ 
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
                  {type}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Média por Critério */}
      {stats.evaluations?.criteria_averages && (
        <div style={{ 
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>
            📈 Média por Critério de Avaliação
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {Object.entries(stats.evaluations.criteria_averages).map(([key, value]) => (
              <div key={key} style={{ 
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                  {getCriteriaLabel(key)}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: getScoreColor(value) }}>
                  {typeof value === 'number' ? value.toFixed(2) : value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chamadas Recentes */}
      {recentCalls.length > 0 && (
        <div style={{ 
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333' }}>
            🕐 Chamadas Recentes
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={tableHeaderStyle}>Protocolo</th>
                  <th style={tableHeaderStyle}>Cliente</th>
                  <th style={tableHeaderStyle}>Tipo</th>
                  <th style={tableHeaderStyle}>Data</th>
                  <th style={tableHeaderStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentCalls.map((call) => (
                  <tr key={call.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={tableCellStyle}>{call.protocol}</td>
                    <td style={tableCellStyle}>{call.customer_name}</td>
                    <td style={tableCellStyle}>{call.call_type}</td>
                    <td style={tableCellStyle}>
                      {new Date(call.call_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        backgroundColor: call.status === 'evaluated' ? '#d4edda' : '#fff3cd',
                        color: call.status === 'evaluated' ? '#155724' : '#856404'
                      }}>
                        {call.status === 'evaluated' ? 'Avaliada' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, color, icon }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
        {icon} {title}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>
        {value}
      </div>
    </div>
  );
}

function getCriteriaLabel(key) {
  const labels = {
    greeting: 'Saudação',
    communication: 'Comunicação',
    knowledge: 'Conhecimento',
    problem_solving: 'Resolução',
    empathy: 'Empatia',
    closing: 'Encerramento'
  };
  return labels[key] || key;
}

function getScoreColor(score) {
  const numScore = typeof score === 'string' ? parseFloat(score) : score;
  if (numScore >= 4) return '#28a745';
  if (numScore >= 3) return '#ffc107';
  return '#dc3545';
}

const tableHeaderStyle = {
  padding: '0.75rem',
  textAlign: 'left',
  fontWeight: 'bold',
  fontSize: '0.9rem',
  color: '#555'
};

const tableCellStyle = {
  padding: '0.75rem',
  fontSize: '0.9rem'
};
