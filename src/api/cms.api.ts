import { api } from './client';

export const cmsApi = {
  getStats: () => api.get('/api/cms/stats'),

  updateStats: (stats: any[]) => api.put('/api/cms/stats', { stats }),

  getOrganizers: () => api.get('/api/cms/organizers'),

  updateOrganizers: (organizers: any[]) =>
    api.put('/api/cms/organizers', { organizers }),

  getPublicEvents: () => api.get('/api/cms/events'),
};
