import { api } from './client';
export interface TransitionTenureDto { kind: 'semester' | 'tenure'; }
export const generationApi = {
 getGenerationConfig: () => api.get('/api/config/generation'),
 updateGenerationConfig: (dto: any) => api.put('/api/config/generation', dto),
 transitionTenure: (dto: TransitionTenureDto) => api.post('/api/config/generation/transition', dto),
};
