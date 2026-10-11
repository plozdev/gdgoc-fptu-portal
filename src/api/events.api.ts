import { api } from './client';
export interface QueryEventsParams { tenureId?: string; isPublic?: boolean; type?: string; status?: string; search?: string; }
export interface CreateEventDto { title: string; description?: string; type: string; location: string; startTime: string; endTime: string; contributionGems?: number; status?: string; isPublic?: boolean; bannerImageUrl?: string; registrationUrl?: string; tenureId?: string; }
export interface EventContributor { id: string; userId: string; roleInEvent?: string; notes?: string; isGemsGranted: boolean; user: { id: string; fullName: string; mssv: string; email: string }; }
export const eventsApi = {
  getMyContributionCount: () => api.get<{count:number}>('/api/events/contributions/mine/count'),
  getEvents: (params?: QueryEventsParams) => { const q = new URLSearchParams(); Object.entries(params || {}).forEach(([k,v])=>{ if(v !== undefined && v !== '') q.set(k,String(v)); }); return api.get('/api/events' + (q.size ? '?' + q.toString() : '')); },
  getEvent: (id: string) => api.get('/api/events/' + id),
  createEvent: (dto: CreateEventDto) => api.post('/api/events', dto),
  updateEvent: (id: string, dto: Partial<CreateEventDto>) => api.put('/api/events/' + id, dto),
  deleteEvent: (id: string) => api.delete('/api/events/' + id),
  getContributors: (id: string) => api.get<EventContributor[]>('/api/events/' + id + '/contributors'),
  addContributors: (id: string, dto: { userIds: string[]; roleInEvent?: string }) => api.post<{addedCount:number; skippedCount:number}>('/api/events/' + id + '/contributors/bulk', dto),
  addContributor: (id: string, dto: { userId: string; roleInEvent?: string; notes?: string }) => api.post('/api/events/' + id + '/contributors', dto),
  deleteContributor: (id: string, userId: string) => api.delete('/api/events/' + id + '/contributors/' + userId),
  settleGems: (id: string) => api.post<{ rewardedCount: number }>('/api/events/' + id + '/settle-gems'),
};
