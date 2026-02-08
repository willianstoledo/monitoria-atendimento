import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { callsService } from '../services/callsService';
import { evaluationsService } from '../services/evaluationsService';

export default function CallDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [call, setCall] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCallDetails();
  }, [id]);

  const loadCallDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados da chamada
      const callResponse = await callsService.getCall(id);
      setCall(callResponse);
      
      // Se a chamada foi avaliada, carregar a avaliação
      if (callResponse.status === 'evaluated') {
        try {
          const evalsResponse = await evaluationsService.getEvaluations({ call_id: id });
          if (evalsResponse && evalsResponse.evaluations && evalsResponse.evaluations.length > 0) {
            setEvaluation(evalsResponse.evaluations[0]);
          }
        } catch (err) {
          console.error('Erro ao carregar avaliação:', err);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar detalhes:', err);
      setError('Erro ao carregar detalhes da chamada');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeLabel = (type) => {
    const types = {
      'support': 'Suporte',
      'sales': 'Vendas',
      'complaint': 'Reclamação',
      'information': 'Informação'
    };
    return types[type] || type;
  };

  const getStatusLabel = (status) => {
    const statuses = {
      'pending': 'Pendente',
      'evaluated': 'Avaliada',
      'archived': 'Arquivada'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ffc107',
      'evaluated': '#28a745',
      'archived': '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          color: '#721c24'
        }}>
          {error || 'Chamada não encontrada'}
        </div>
        <button
          onClick={() => navigate('/calls')}
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
          ← Voltar para Chamadas
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>📞 Detalhes da Chamada</h1>
        <button
          onClick={() => navigate('/calls')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Voltar
        </button>
      </div>

      {/* Informações Principais */}
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          <div>
            <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              Protocolo
            </label>
            <p style={{ fontSize: '1.1rem', margin: 0 }}>{call.protocol}</p>
          </div>
          
          <div>
            <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              Status
            </label>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '4px',
              backgroundColor: getStatusColor(call.status),
              color: 'white',
              fontSize: '0.9rem'
            }}>
              {getStatusLabel(call.status)}
            </span>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              Cliente
            </label>
            <p style={{ margin: 0 }}>{call.customer_name}</p>
            {call.customer_phone && (
              <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{call.customer_phone}</p>
            )}
          </div>

          <div>
            <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              Operador
            </label>
            <p style={{ margin: 0 }}>{call.operator_name}</p>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              Tipo de Chamada
            </label>
            <p style={{ margin: 0 }}>{getTypeLabel(call.call_type)}</p>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              Data/Hora
            </label>
            <p style={{ margin: 0 }}>{formatDate(call.call_date)}</p>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              Duração
            </label>
            <p style={{ margin: 0 }}>{formatDuration(call.duration_seconds)}</p>
          </div>
        </div>

        {call.description && (
          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              Descrição
            </label>
            <p style={{
              margin: 0,
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap'
            }}>
              {call.description}
            </p>
          </div>
        )}
      </div>

      {/* Avaliação (se existir) */}
      {evaluation && (
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginTop: 0, marginBottom: '1.5rem' }}>⭐ Avaliação</h2>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
              Avaliador
            </label>
            <p style={{ margin: 0 }}>{evaluation.evaluator_name}</p>
            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
              {formatDate(evaluation.created_at)}
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '1rem' }}>
              Nota Geral: <span style={{ fontSize: '1.5rem', color: '#28a745' }}>{evaluation.overall_score.toFixed(2)}</span>
            </label>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div>
                <span style={{ fontWeight: 'bold' }}>👋 Saudação:</span> {evaluation.greeting_score}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>💬 Comunicação:</span> {evaluation.communication_score}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>❤️ Empatia:</span> {evaluation.empathy_score}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>📚 Conhecimento:</span> {evaluation.knowledge_score}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>✅ Resolução:</span> {evaluation.problem_solving_score}
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>👋 Encerramento:</span> {evaluation.closing_score}
              </div>
            </div>
          </div>

          {evaluation.feedback_to_operator && (
            <div>
              <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '0.5rem' }}>
                Feedback ao Operador
              </label>
              <p style={{
                margin: 0,
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                whiteSpace: 'pre-wrap'
              }}>
                {evaluation.feedback_to_operator}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
