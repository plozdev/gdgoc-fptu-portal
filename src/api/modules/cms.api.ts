import { api } from '../client';

export interface MilestoneStatItem {
  label: string;
  value: string;
  description?: string;
  accentColor?: string;
}

export interface PublicEventItem {
  id: string;
  title: string;
  description?: string;
  type: string;
  location: string;
  startTime: string;
  endTime: string;
  attendeeGems?: number;
  organizerGems?: number;
  isPublic?: boolean;
  bannerImageUrl?: string;
  registrationUrl?: string;
  attendeeCount: number;
  checkedInCount: number;
}

export const cmsApi = {
  getStats: () => api.get<MilestoneStatItem[]>('/api/cms/stats'),

  updateStats: (stats: MilestoneStatItem[]) =>
    api.put('/api/cms/stats', { stats }),

  getPublicEvents: () => api.get<PublicEventItem[]>('/api/cms/events'),
};
