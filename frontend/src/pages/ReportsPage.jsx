import { useState, useEffect } from 'react';
import { reportsService } from '../services/reportsService';
import { useAuth } from '../contexts/AuthContext';

export default function ReportsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'quarter', 'year'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
      setError('Erro ao carregar relatórios. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0min 0s';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}min ${secs}s`;
  };

  const getScoreColor = (score) => {
    if (score >= 4) return '#28a745';
    if (score >= 3) return '#ffc107';
    return '#dc3545';
  };

  const getScoreLabel = (score) => {
    if (score >= 4.5) return 'Excelente';
    if (score >= 4) return 'Bom';
    if (score >= 3) return 'Regular';
    if (score >= 2) return 'Abaixo da Média';
    return 'Insuficiente';
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Carregando relatórios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '1rem',
          borderRadius: '4px'
        }}>
          {error}
          <button
            onClick={loadStats}
            style={{
              marginLeft: '1rem',
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
      </div>
    );
  }

  if (!stats || !stats.evaluations || !stats.calls) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Nenhum dado disponível.</p>
      </div>
    );
  }

  // Extrair dados da estrutura da API
  const totalCalls = stats.calls?.total || 0;
  const evaluatedCalls = stats.calls?.evaluated || 0;
  const avgScore = stats.evaluations?.avg_overall_score || 0;
  const avgDuration = parseFloat(stats.calls?.avg_duration_seconds || 0);
  const criteriaAverages = stats.evaluations?.criteria_averages || {};
  const callsByType = stats.calls?.by_type || {};

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h1>📈 Relatórios e Análises</h1>
        
        {/* Filtro de Período */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem'
          }}
        >
          <option value="week">Última Semana</option>
          <option value="month">Último Mês</option>
          <option value="quarter">Último Trimestre</option>
          <option value="year">Último Ano</option>
        </select>
      </div>

      {/* Cards de Resumo */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #007bff'
        }}>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
            📞 Total de Chamadas
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
            {totalCalls}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #28a745'
        }}>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
            ✅ Taxa de Avaliação
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
            {totalCalls > 0 ? ((evaluatedCalls / totalCalls) * 100).toFixed(1) : 0}%
          </div>
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
            {evaluatedCalls} de {totalCalls} avaliadas
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #ffc107'
        }}>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
            ⭐ Nota Média Geral
          </div>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: getScoreColor(avgScore)
          }}>
            {avgScore.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.5rem' }}>
            {getScoreLabel(avgScore)}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #17a2b8'
        }}>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
            ⏱️ Duração Média
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#17a2b8' }}>
            {formatDuration(avgDuration)}
          </div>
        </div>
      </div>

      {/* Distribuição por Tipo de Chamada */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>📊 Distribuição por Tipo de Chamada</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {Object.entries(callsByType).map(([type, count]) => {
            const percentage = totalCalls > 0 ? ((count / totalCalls) * 100).toFixed(1) : 0;
            return (
              <div key={type} style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 'bold',
                  marginBottom: '0.5rem'
                }}>
                  {type}
                </div>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold',
                  color: '#007bff',
                  marginBottom: '0.5rem'
                }}>
                  {count}
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: '#007bff',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666' }}>
                  {percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Média por Critério de Avaliação */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>📈 Desempenho por Critério de Avaliação</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(criteriaAverages).map(([criterion, score]) => {
            const scoreNum = parseFloat(score);
            const percentage = (scoreNum / 5) * 100;
            const criterionLabels = {
              greeting: '👋 Saudação',
              communication: '💬 Comunicação',
              empathy: '❤️ Empatia',
              knowledge: '📚 Conhecimento',
              problem_solving: '✅ Resolução',
              closing: '👋 Encerramento'
            };
            
            return (
              <div key={criterion}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{ fontWeight: 'bold' }}>
                    {criterionLabels[criterion] || criterion}
                  </span>
                  <span style={{ 
                    fontWeight: 'bold',
                    color: getScoreColor(scoreNum)
                  }}>
                    {scoreNum.toFixed(2)}
                  </span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '12px', 
                  backgroundColor: '#e9ecef',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: getScoreColor(scoreNum),
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Análise e Recomendações */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>💡 Análise e Recomendações</h3>
        
        {/* Pontos Fortes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ color: '#28a745', marginBottom: '0.5rem' }}>✅ Pontos Fortes</h4>
          <ul style={{ paddingLeft: '1.5rem' }}>
            {Object.entries(criteriaAverages)
              .filter(([_, score]) => parseFloat(score) >= 4)
              .map(([criterion, score]) => {
                const scoreNum = parseFloat(score);
                const labels = {
                  greeting: 'Saudação',
                  communication: 'Comunicação',
                  empathy: 'Empatia',
                  knowledge: 'Conhecimento',
                  problem_solving: 'Resolução',
                  closing: 'Encerramento'
                };
                return (
                  <li key={criterion} style={{ marginBottom: '0.5rem' }}>
                    <strong>{labels[criterion]}</strong> com média de {scoreNum.toFixed(2)} - Desempenho excelente!
                  </li>
                );
              })}
          </ul>
        </div>

        {/* Pontos de Melhoria */}
        <div>
          <h4 style={{ color: '#dc3545', marginBottom: '0.5rem' }}>⚠️ Pontos de Melhoria</h4>
          <ul style={{ paddingLeft: '1.5rem' }}>
            {Object.entries(criteriaAverages)
              .filter(([_, score]) => parseFloat(score) < 4)
              .map(([criterion, score]) => {
                const scoreNum = parseFloat(score);
                const labels = {
                  greeting: 'Saudação',
                  communication: 'Comunicação',
                  empathy: 'Empatia',
                  knowledge: 'Conhecimento',
                  problem_solving: 'Resolução',
                  closing: 'Encerramento'
                };
                return (
                  <li key={criterion} style={{ marginBottom: '0.5rem' }}>
                    <strong>{labels[criterion]}</strong> com média de {scoreNum.toFixed(2)} - Requer atenção e treinamento.
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </div>
  );
}
