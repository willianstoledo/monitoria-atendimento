import api from './api';

export const dashboardService = {
  async getStats(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.operatorId) params.append('operator_id', filters.operatorId);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    
    const response = await api.get(`/dashboard/stats?${params.toString()}`);
    return response.data;
  },

  async getRecentActivity(limit = 10) {
    const response = await api.get(`/dashboard/recent-activity?limit=${limit}`);
    return response.data;
  },

  async getOperatorsRanking(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    
    const response = await api.get(`/dashboard/operators-ranking?${params.toString()}`);
    return response.data;
  },
};
