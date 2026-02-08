import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/dashboardService';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      console.log('Iniciando carregamento do dashboard...');
      setLoading(true);
      const [statsData, activityData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(5)
      ]);
      console.log('Dados carregados:', { statsData, activityData });
      setStats(statsData);
      setRecentActivity(activityData);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
      setError('Erro ao carregar dados do dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem' }}>Carregando...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '2rem' }}>
        Dashboard - Bem-vindo, {user?.full_name}!
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
          value={stats?.calls?.total || 0}
          color="#007bff"
        />
        <StatCard
          title="Chamadas Avaliadas"
          value={stats?.calls?.evaluated || 0}
          color="#28a745"
        />
        <StatCard
          title="Pendentes de Avaliação"
          value={stats?.calls?.pending || 0}
          color="#ffc107"
        />
        <StatCard
          title="Nota Média Geral"
          value={stats?.evaluations?.avg_overall_score?.toFixed(2) || 'N/A'}
          color="#17a2b8"
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
        <h3 style={{ marginBottom: '1rem' }}>Duração Média das Chamadas</h3>
        <p style={{ fontSize: '1.5rem', color: '#007bff', fontWeight: 'bold' }}>
          {Math.floor((stats?.calls?.avg_duration_seconds || 0) / 60)} minutos e{' '}
          {Math.floor((stats?.calls?.avg_duration_seconds || 0) % 60)} segundos
        </p>
      </div>

      {/* Média por Critério */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Média por Critério de Avaliação</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {stats?.evaluations?.criteria_averages && Object.entries(stats.evaluations.criteria_averages).map(([key, value]) => (
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
                {value?.toFixed(2) || 'N/A'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Atividade Recente */}
      <div style={{ 
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Atividade Recente</h3>
        
        {recentActivity?.recent_calls?.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#555' }}>
              Últimas Chamadas
            </h4>
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
                  {recentActivity.recent_calls.map((call) => (
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
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      borderLeft: `4px solid ${color}`
    }}>
      <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
        {title}
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
  if (score >= 4) return '#28a745';
  if (score >= 3) return '#ffc107';
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
