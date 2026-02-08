import api from './api';

export const evaluationsService = {
  async getEvaluations(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.operatorId) params.append('operator_id', filters.operatorId);
    if (filters.evaluatorId) params.append('evaluator_id', filters.evaluatorId);
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.perPage) params.append('per_page', filters.perPage);
    
    const response = await api.get(`/evaluations?${params.toString()}`);
    return response.data;
  },

  async getEvaluation(evaluationId) {
    const response = await api.get(`/evaluations/${evaluationId}`);
    return response.data;
  },

  async createEvaluation(evaluationData) {
    const response = await api.post('/evaluations', evaluationData);
    return response.data;
  },

  async updateEvaluation(evaluationId, evaluationData) {
    const response = await api.put(`/evaluations/${evaluationId}`, evaluationData);
    return response.data;
  },

  async acknowledgeEvaluation(evaluationId) {
    const response = await api.post(`/evaluations/${evaluationId}/acknowledge`);
    return response.data;
  },

  async deleteEvaluation(evaluationId) {
    const response = await api.delete(`/evaluations/${evaluationId}`);
    return response.data;
  },
};
