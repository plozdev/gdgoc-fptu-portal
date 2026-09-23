import { api } from './client';

export const cmsApi = {
  getStats: () => api.get('/api/cms/stats'),

  updateStats: (stats: any[]) => api.put('/api/cms/stats', { stats }),

  getPublicEvents: () => api.get('/api/cms/events'),
};
