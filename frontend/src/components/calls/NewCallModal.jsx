import { useState } from 'react';
import { callsService } from '../../services/callsService';

export default function NewCallModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    call_type: 'information',
    notes: '',
    duration_seconds: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.customer_name || !formData.customer_phone) {
      setError('Nome e telefone do cliente são obrigatórios.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await callsService.createCall(formData);
      
      // Limpar formulário
      setFormData({
        customer_name: '',
        customer_phone: '',
        call_type: 'information',
        notes: '',
        duration_seconds: 0
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Erro ao criar chamada:', err);
      setError('Erro ao criar chamada. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: '1.5rem' }}>📞 Nova Chamada</h2>

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

        <form onSubmit={handleSubmit}>
          {/* Nome do Cliente */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              Nome do Cliente *
            </label>
            <input
              type="text"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              placeholder="Digite o nome do cliente"
            />
          </div>

          {/* Telefone do Cliente */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              Telefone do Cliente *
            </label>
            <input
              type="tel"
              name="customer_phone"
              value={formData.customer_phone}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Tipo de Chamada */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              Tipo de Chamada
            </label>
            <select
              name="call_type"
              value={formData.call_type}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            >
              <option value="information">Informação</option>
              <option value="complaint">Reclamação</option>
              <option value="sales">Vendas</option>
              <option value="support">Suporte</option>
            </select>
          </div>

          {/* Descrição */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              Descrição
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="4"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
              placeholder="Descreva o motivo da chamada..."
            />
          </div>

          {/* Duração (em segundos) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              Duração (segundos)
            </label>
            <input
              type="number"
              name="duration_seconds"
              value={formData.duration_seconds}
              onChange={handleChange}
              min="0"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
              placeholder="0"
            />
            <small style={{ color: '#666', fontSize: '0.85rem' }}>
              Deixe 0 se a chamada ainda está em andamento
            </small>
          </div>

          {/* Botões */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
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
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Criando...' : 'Criar Chamada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
