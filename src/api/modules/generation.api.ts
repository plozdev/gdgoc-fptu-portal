import { api } from '../client';

export interface UpdateTenureConfigDto {
  isFrozen?: boolean;
  allowTaskSubmission?: boolean;
  allowRsvp?: boolean;
  freezeLeaderboard?: boolean;
  chapterLead?: string;
  coChapterLead?: string;
}

export interface TransitionTenureDto {
  newTenureName: string;
  newGenLabel: string;
  startDate: string;
  endDate: string;
  carryOverCoreTeam?: boolean;
  notifyAllMembers?: boolean;
  chapterLead?: string;
}

export const generationApi = {
  getGenerationConfig: () => api.get('/api/config/generation'),

  updateGenerationConfig: (dto: UpdateTenureConfigDto) =>
    api.put('/api/config/generation', dto),

  transitionTenure: (dto: TransitionTenureDto) =>
    api.post('/api/config/generation/transition', dto),
};
