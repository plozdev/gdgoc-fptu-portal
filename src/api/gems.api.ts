import { api } from './client';

export interface QueryLeaderboardParams {
  tenureId?: string;
  departmentCode?: string;
  limit?: number;
}

export interface QueryTransactionsParams {
  userId?: string;
  page?: number;
  limit?: number;
}

export const gemsApi = {
  getLeaderboard: (params?: QueryLeaderboardParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const queryString = query.toString();
    return api.get(`/api/gems/leaderboard${queryString ? `?${queryString}` : ''}`);
  },

  getTransactions: (params?: QueryTransactionsParams) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const queryString = query.toString();
    return api.get(`/api/gems/transactions${queryString ? `?${queryString}` : ''}`);
  },

  adjustGems: (dto: { userId: string; amount: number; reason: string }) =>
    api.post('/api/gems/adjust', dto),
};
