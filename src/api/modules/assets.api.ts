import { api, buildQueryString } from '../client';

export type DriveCategory =
  | 'BRAND_KIT'
  | 'TECH_LIBRARY'
  | 'MEDIA_VAULT'
  | 'PR_COMMS'
  | 'FINANCE'
  | 'HANDOVER_VAULT';

export type AccessLevel =
  | 'PUBLIC'
  | 'INTERNAL_MEMBER'
  | 'DEPARTMENT_ONLY'
  | 'EXECUTIVE_ONLY';

export interface QueryAssetsParams {
  category?: DriveCategory | string;
  departmentCode?: string;
  accessLevel?: AccessLevel | string;
  eventId?: string;
  tenureId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateAssetDto {
  name: string;
  description?: string;
  category: DriveCategory | string;
  driveUrl: string;
  driveFileId: string;
  accessLevel?: AccessLevel | string;
  departmentCode?: string;
  departmentId?: string;
  tenureId?: string;
  eventId?: string;
}

export interface UpdateAssetDto extends Partial<CreateAssetDto> {}

export const assetsApi = {
  getAssets: (params?: QueryAssetsParams) =>
    api.get(`/api/assets${buildQueryString(params)}`),

  getAsset: (id: string) => api.get(`/api/assets/${id}`),

  createAsset: (dto: CreateAssetDto) => api.post('/api/assets', dto),

  updateAsset: (id: string, dto: UpdateAssetDto) =>
    api.put(`/api/assets/${id}`, dto),

  deleteAsset: (id: string) => api.delete(`/api/assets/${id}`),

  createEventFolder: (dto: { eventId: string; eventTitle: string }) =>
    api.post('/api/drive/create-folder', dto),
};
