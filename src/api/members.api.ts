import { api } from './client';

export interface QueryMembersParams {
  tenureId?: string;
  departmentCode?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateMemberDto {
  mssv: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  departmentCode: string;
  role?: string;
  position?: string;
  tenureId?: string;
  joinedAt?: string;
}

export interface UpdateMemberDto {
  role?: string;
  status?: string;
  position?: string;
  departmentCode?: string;
}

export interface UpdateProfileDto {
  bio?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  skills?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  discordUsername?: string;
}

export const membersApi = {
  getMembers: (params?: QueryMembersParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const queryString = query.toString();
    return api.get(`/api/members${queryString ? `?${queryString}` : ''}`);
  },

  createMember: (dto: CreateMemberDto) => api.post('/api/members', dto),

  updateMember: (id: string, dto: UpdateMemberDto) =>
    api.put(`/api/members/${id}`, dto),

  deleteMember: (id: string) => api.delete(`/api/members/${id}`),

  importMembers: (formData: FormData) => api.post('/api/members/import', formData),

  updateProfile: (id: string, dto: UpdateProfileDto) =>
    api.put(`/api/members/${id}/profile`, dto),

  getOrganizers: (featured?: boolean) =>
    api.get(`/api/members/organizers${featured ? '?featured=true' : ''}`),
};
