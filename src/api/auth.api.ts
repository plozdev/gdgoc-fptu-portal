import { api } from './client';

export interface LoginDto {
  email: string;
  password?: string;
}

export interface UserSessionResponse {
  id: string;
  mssv: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  gemsBalance: number;
  tenures?: Array<{
    id: string;
    role: string;
    status: string;
    position?: string;
    department?: {
      id: string;
      code: string;
      name: string;
    };
    tenure?: {
      id: string;
      name: string;
      genLabel: string;
      isFrozen: boolean;
    };
  }>;
}

export const authApi = {
  login: (dto: LoginDto) => api.post('/api/auth/login', dto),
  getMe: () => api.get<UserSessionResponse>('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
};
