import api from './api';

export const reportsService = {
  /**
   * Obtém estatísticas gerais para relatórios
   */
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  /**
   * Obtém relatório de desempenho de um operador
   */
  async getPerformance(operatorId, startDate, endDate) {
    const params = {};
    if (operatorId) params.operator_id = operatorId;
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get('/reports/performance', { params });
    return response.data;
  },

  /**
   * Obtém visão geral da equipe
   */
  async getTeamOverview(startDate, endDate) {
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await api.get('/reports/team-overview', { params });
    return response.data;
  },

  /**
   * Obtém tendências de qualidade
   */
  async getQualityTrends(period = 'month') {
    const response = await api.get('/reports/quality-trends', {
      params: { period }
    });
    return response.data;
  }
};
