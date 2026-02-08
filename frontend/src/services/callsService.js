import api from './api';

export const callsService = {
  async getCalls(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.operatorId) params.append('operator_id', filters.operatorId);
    if (filters.status) params.append('status', filters.status);
    if (filters.callType) params.append('call_type', filters.callType);
    if (filters.startDate) params.append('start_date', filters.startDate);
    if (filters.endDate) params.append('end_date', filters.endDate);
    if (filters.page) params.append('page', filters.page);
    if (filters.perPage) params.append('per_page', filters.perPage);
    
    const response = await api.get(`/calls?${params.toString()}`);
    return response.data;
  },

  async getCall(callId) {
    const response = await api.get(`/calls/${callId}`);
    return response.data;
  },

  async createCall(callData) {
    const response = await api.post('/calls', callData);
    return response.data;
  },

  async updateCall(callId, callData) {
    const response = await api.put(`/calls/${callId}`, callData);
    return response.data;
  },

  async deleteCall(callId) {
    const response = await api.delete(`/calls/${callId}`);
    return response.data;
  },
};
