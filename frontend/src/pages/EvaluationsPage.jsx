import { useState, useEffect } from 'react';
import { evaluationsService } from '../services/evaluationsService';
import { callsService } from '../services/callsService';
import { useAuth } from '../contexts/AuthContext';

export default function EvaluationsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' ou 'completed'
  const [calls, setCalls] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  
  // Estado do formulário de avaliação
  const [formData, setFormData] = useState({
    greeting_score: 3,
    communication_score: 3,
    empathy_score: 3,
    knowledge_score: 3,
    problem_solving_score: 3,
    closing_score: 3,
    feedback_to_operator: '',
    status: 'sent'
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'pending') {
        const response = await callsService.getCalls({ status: 'pending' });
        setCalls(response.calls || []);
      } else {
        const response = await evaluationsService.getEvaluations();
        setEvaluations(response.evaluations || []);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = (call) => {
    setSelectedCall(call);
    setShowEvaluationForm(true);
    // Reset form
    setFormData({
      greeting_score: 3,
      communication_score: 3,
      empathy_score: 3,
      knowledge_score: 3,
      problem_solving_score: 3,
      closing_score: 3,
      feedback_to_operator: ''
    });
  };

  const handleScoreChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseInt(value)
    }));
  };

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await evaluationsService.createEvaluation({ call_id: selectedCall.id, ...formData });
      
      alert('Avaliação enviada com sucesso!');
      setShowEvaluationForm(false);
      setSelectedCall(null);
      loadData();
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEvaluation = () => {
    setShowEvaluationForm(false);
    setSelectedCall(null);
  };

  const getAverageScore = (evaluation) => {
    const scores = [
      evaluation.greeting_score,
      evaluation.communication_score,
      evaluation.empathy_score,
      evaluation.knowledge_score,
      evaluation.problem_solving_score,
      evaluation.closing_score
    ];
    const sum = scores.reduce((a, b) => a + b, 0);
    return (sum / scores.length).toFixed(2);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getScoreColor = (score) => {
    if (score >= 4) return '#28a745';
    if (score >= 3) return '#ffc107';
    return '#dc3545';
  };

  if (showEvaluationForm && selectedCall) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '1.5rem' }}>⭐ Avaliar Chamada</h2>
          
          {/* Informações da Chamada */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '4px',
            marginBottom: '2rem'
          }}>
            <p><strong>Protocolo:</strong> {selectedCall.protocol}</p>
            <p><strong>Cliente:</strong> {selectedCall.customer_name}</p>
            <p><strong>Operador:</strong> {selectedCall.operator_name}</p>
            <p><strong>Tipo:</strong> {selectedCall.call_type}</p>
            <p><strong>Data:</strong> {formatDate(selectedCall.call_date)}</p>
          </div>

          <form onSubmit={handleSubmitEvaluation}>
            {/* Critérios de Avaliação */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Critérios de Avaliação</h3>
              
              {[
                { field: 'greeting_score', label: '👋 Saudação' },
                { field: 'communication_score', label: '💬 Comunicação' },
                { field: 'empathy_score', label: '❤️ Empatia' },
                { field: 'knowledge_score', label: '📚 Conhecimento' },
                { field: 'problem_solving_score', label: '✅ Resolução' },
                { field: 'closing_score', label: '👋 Encerramento' }
              ].map(({ field, label }) => (
                <div key={field} style={{ marginBottom: '1.5rem' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem',
                    fontWeight: 'bold'
                  }}>
                    {label}: {formData[field]}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData[field]}
                    onChange={(e) => handleScoreChange(field, e.target.value)}
                    style={{ 
                      width: '100%',
                      height: '8px',
                      borderRadius: '4px'
                    }}
                  />
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: '#666',
                    marginTop: '0.25rem'
                  }}>
                    <span>1 - Insuficiente</span>
                    <span>5 - Excelente</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Comentários */}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: 'bold'
              }}>
                💭 Comentários (opcional)
              </label>
              <textarea
                value={formData.feedback_to_operator}
                onChange={(e) => setFormData(prev => ({ ...prev, feedback_to_operator: e.target.value }))}
                rows="4"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                placeholder="Adicione observações sobre o atendimento..."
              />
            </div>

            {/* Botões */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? 'Enviando...' : '✅ Enviar Avaliação'}
              </button>
              <button
                type="button"
                onClick={handleCancelEvaluation}
                disabled={loading}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>⭐ Avaliações</h1>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        borderBottom: '2px solid #dee2e6'
      }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'transparent',
            color: activeTab === 'pending' ? '#007bff' : '#6c757d',
            border: 'none',
            borderBottom: activeTab === 'pending' ? '3px solid #007bff' : 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'pending' ? 'bold' : 'normal'
          }}
        >
          ⏳ Pendentes ({calls.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'transparent',
            color: activeTab === 'completed' ? '#007bff' : '#6c757d',
            border: 'none',
            borderBottom: activeTab === 'completed' ? '3px solid #007bff' : 'none',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: activeTab === 'completed' ? 'bold' : 'normal'
          }}
        >
          ✅ Concluídas ({evaluations.length})
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Carregando...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      {/* Tab: Chamadas Pendentes */}
      {!loading && activeTab === 'pending' && (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {calls.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
              🎉 Não há chamadas pendentes de avaliação!
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Protocolo</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Cliente</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Operador</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Tipo</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Data</th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => (
                  <tr key={call.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '1rem' }}><strong>{call.protocol}</strong></td>
                    <td style={{ padding: '1rem' }}>{call.customer_name}</td>
                    <td style={{ padding: '1rem' }}>{call.operator_name}</td>
                    <td style={{ padding: '1rem' }}>{call.call_type}</td>
                    <td style={{ padding: '1rem' }}>{formatDate(call.call_date)}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => handleEvaluate(call)}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        ⭐ Avaliar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tab: Avaliações Concluídas */}
      {!loading && activeTab === 'completed' && (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {evaluations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
              Nenhuma avaliação realizada ainda.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Protocolo</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Cliente</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Operador</th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Nota Média</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Avaliado em</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Avaliador</th>
                </tr>
              </thead>
              <tbody>
                {evaluations.map((evaluation) => (
                  <tr key={evaluation.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '1rem' }}><strong>{evaluation.call_protocol}</strong></td>
                    <td style={{ padding: '1rem' }}>{evaluation.customer_name}</td>
                    <td style={{ padding: '1rem' }}>{evaluation.operator_name}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ 
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        color: getScoreColor(parseFloat(getAverageScore(evaluation)))
                      }}>
                        {getAverageScore(evaluation)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{formatDate(evaluation.evaluated_at)}</td>
                    <td style={{ padding: '1rem' }}>{evaluation.evaluator_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
